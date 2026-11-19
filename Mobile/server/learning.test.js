const assert = require('node:assert/strict');
const { once } = require('node:events');
const { test } = require('node:test');
const { summarize } = require('./learning');
const { server } = require('./index');

test('new learners start with empty progress and locked achievements', () => {
  const result = summarize([], new Set(), 'Asia/Karachi', 10);
  assert.ok(Object.values(result.stats).every(value => value === 0));
  assert.ok(result.achievements.every(item => !item.unlocked));
});

test('progress counts distinct models and completed topics and awards quiz XP', () => {
  const event = (kind, target, extra) => ({ kind, target, occurred_at: new Date(), ...extra });
  const result = summarize([
    event('topic_open', 'resume'),
    event('topic_complete', 'done'),
    event('topic_complete', 'done'),
    event('scan', 'vernier'),
    event('scan', 'vernier'),
    event('quiz', 'general-physics', { correct: 10, total: 10 }),
  ], new Set(), 'Asia/Karachi', 10);
  assert.equal(result.resumeTopicId, 'resume');
  assert.deepEqual(result.completedTopicIds, ['done']);
  assert.equal(result.stats.modelsExplored, 1);
  assert.equal(result.stats.overallProgress, 10);
  assert.equal(result.stats.questionsAnswered, 10);
  assert.equal(result.stats.streak, 1);
  assert.equal(result.stats.xp, 545);
});

test('an offline week of study can earn the streak achievement after the streak ends', () => {
  const events = Array.from({ length: 7 }, (_, index) => ({
    kind: 'topic_open',
    target: 'topic',
    occurred_at: new Date(Date.UTC(2025, 0, index + 1, 12)),
  }));
  const result = summarize(events, new Set(), 'Asia/Karachi', 10);
  assert.equal(result.stats.streak, 0);
  assert.equal(result.achievements.find(item => item.id === '7_day_streak').unlocked, true);
});

test('learning routes require sign-in and preserve the Gemini health endpoint', async () => {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const url = 'http://127.0.0.1:' + server.address().port;
    for (const endpoint of ['/home', '/progress', '/me/preferences']) {
      const response = await fetch(url + '/api/v1' + endpoint);
      assert.equal(response.status, 401);
    }
    const health = await fetch(url + '/api/health');
    assert.equal(health.status, 200);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('session verification accepts only signed, unexpired tokens for the configured Clerk issuer', async t => {
  const { generateKeyPairSync, sign } = require('node:crypto');
  const { authenticate } = require('./session');
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const issuer = 'https://example.clerk.accounts.dev';
  const previousIssuer = process.env.CLERK_ISSUER;
  process.env.CLERK_ISSUER = issuer;
  t.after(() => {
    if (previousIssuer === undefined) delete process.env.CLERK_ISSUER;
    else process.env.CLERK_ISSUER = previousIssuer;
  });
  t.mock.method(globalThis, 'fetch', async url => {
    assert.equal(url, issuer + '/.well-known/jwks.json');
    return Response.json({ keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'test' }] });
  });
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const token = overrides => {
    const message = encode({ alg: 'RS256', kid: 'test' }) + '.' +
      encode({ iss: issuer, sub: 'user_one', exp: now + 60, ...overrides });
    return message + '.' + sign('RSA-SHA256', Buffer.from(message), privateKey).toString('base64url');
  };
  const request = value => ({ headers: { authorization: 'Bearer ' + value } });
  assert.equal(await authenticate(request(token())), 'user_one');
  assert.equal(await authenticate(request(token({ exp: now - 1 }))), null);
  assert.equal(await authenticate(request(token({ iss: 'https://other.example' }))), null);
  assert.equal(await authenticate(request(token() + 'tampered')), null);
});

test('all 16 practical quizzes have unique options and grade identically on the server and offline', () => {
  const { practicalQuiz } = require('../src/data/practicalQuiz.ts');
  const { applyPracticalEvent, emptyPracticalState } = require('../src/data/practicalProgress.ts');
  const { validateEvent } = require('./practicals');
  for (let number = 1; number <= 16; number++) {
    const questions = practicalQuiz(number);
    assert.equal(questions.length, 5);
    for (const question of questions) assert.equal(new Set(question.options).size, 4);
    const event = { kind: 'quiz', answers: questions.map(item => item.correct), elapsedSeconds: 42 };
    const saved = validateEvent(number, { ...event, eventId: 'test-event-id' });
    const local = applyPracticalEvent(emptyPracticalState, number, event, 'test-event-id', '2026-11-11T00:00:00Z');
    assert.equal(saved.score, 5);
    assert.equal(saved.percentage, local.attempts[0].percentage);
    const skipped = validateEvent(number, { ...event, answers: questions.map(() => null), eventId: 'test-event-id' });
    assert.equal(skipped.score, 0);
    assert.equal(validateEvent(number, { ...event, answers: [5], eventId: 'test-event-id' }), null);
  }
});

test('the practical catalog works without a database and private history requires sign-in', async () => {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const base = 'http://127.0.0.1:' + server.address().port + '/api/v1/practicals';
    const catalog = await (await fetch(base)).json();
    assert.equal(catalog.practicals.length, 16);
    assert.equal(catalog.practicals[0].unityModel, 'exp_vernier_caliper');
    assert.equal(catalog.practicals[15].unityModel, null);
    const quiz = await (await fetch(base + '/1/quiz')).json();
    assert.equal(quiz.questions.length, 5);
    assert.ok(quiz.questions.every(question => !Object.hasOwn(question, 'correct')));
    assert.equal((await fetch(base + '/16/state')).status, 401);
    assert.equal((await fetch(base + '/17/model')).status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
