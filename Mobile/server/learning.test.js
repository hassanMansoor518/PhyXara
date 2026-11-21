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

test('practical progress only advances from saved learning, model, calculation, and quiz events', () => {
  const { applyPracticalEvent, emptyPracticalState } = require('../src/data/practicalProgress.ts');
  const { validateEvent } = require('./practicals');
  let state = emptyPracticalState;

  assert.equal(state.learned || state.viewed || state.calculated || state.attempts.length > 0, false);

  for (const kind of ['learn', 'view', 'calculation']) {
    const event = { kind, eventId: 'progress-' + kind };
    assert.deepEqual(validateEvent(1, event), {});
    state = applyPracticalEvent(state, 1, event, event.eventId, '2026-11-11T00:00:00Z');
  }

  assert.equal(state.learned, true);
  assert.equal(state.viewed, true);
  assert.equal(state.calculated, true);
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

test('practical badges reflect saved activity and keep a perfect score after history is capped', () => {
  const { practicalQuiz } = require('../src/data/practicalQuiz.ts');
  const { applyPracticalEvent, emptyPracticalState, practicalAchievements } = require('../src/data/practicalProgress.ts');
  const fresh = practicalAchievements([]);
  assert.equal(fresh.length, 4);
  assert.ok(fresh.every(badge => !badge.unlocked && badge.completedCount === 0));
  assert.ok(fresh.every(badge => !Object.hasOwn(badge, 'rewardXP')));
  const questions = practicalQuiz(1);
  const date = '2026-11-22T00:00:00Z';
  let state = applyPracticalEvent(emptyPracticalState, 1,
    { kind: 'quiz', answers: questions.map(question => question.correct), elapsedSeconds: 20 }, 'perfect-attempt', date);
  for (let index = 0; index < 30; index++) {
    state = applyPracticalEvent(state, 1,
      { kind: 'quiz', answers: questions.map(() => null), elapsedSeconds: 20 }, 'skipped-' + index, date);
  }
  assert.equal(state.attempts.length, 25);
  assert.ok(state.attempts.every(attempt => attempt.score === 0));
  assert.equal(state.perfectQuiz, true);
  for (const kind of ['learn', 'view', 'calculation']) {
    state = applyPracticalEvent(state, 1, { kind }, 'event-' + kind, date);
  }
  const badges = practicalAchievements([state]);
  assert.equal(badges.length, 4);
  assert.ok(badges.every(badge => badge.unlocked));
  assert.ok(practicalAchievements(Array(16).fill(state)).every(badge => badge.unlocked));
});

test('practical statistics count real attempts, unique model views and local study days', () => {
  const { practicalQuiz } = require('../src/data/practicalQuiz.ts');
  const { applyPracticalEvent, emptyPracticalState, practicalStatistics } = require('../src/data/practicalProgress.ts');
  const now = new Date('2026-11-22T01:00:00Z');
  const quiz = practicalQuiz(1);
  const answers = quiz.map(question => question.correct);
  const event = { kind: 'quiz', answers, elapsedSeconds: 10 };
  let state = applyPracticalEvent(emptyPracticalState, 1, { kind: 'learn' }, 'learn-one', '2026-11-21T01:00:00Z');
  state = applyPracticalEvent(state, 1, { kind: 'view' }, 'view-one', now.toISOString());
  state = applyPracticalEvent(state, 1, { kind: 'view' }, 'view-again', now.toISOString());
  for (let index = 0; index < 30; index++) {
    state = applyPracticalEvent(state, 1, event, 'quiz-' + index, now.toISOString());
  }
  state = applyPracticalEvent(state, 1, event, 'quiz-0', now.toISOString());
  const stats = practicalStatistics([state], 'Asia/Karachi', now);
  assert.equal(state.attempts.length, 25);
  assert.equal(stats.quizzesCompleted, 30);
  assert.equal(stats.modelsExplored, 1);
  assert.equal(stats.xp, 30 * quiz.length * 10 + 25);
  assert.equal(stats.questionsAnswered, 30 * quiz.length);
  assert.equal(stats.streak, 2);
  assert.deepEqual(practicalStatistics([], 'Asia/Karachi', now), {
    xp: 0, streak: 0, quizzesCompleted: 0, modelsExplored: 0, questionsAnswered: 0,
  });
  const bookmark = applyPracticalEvent(emptyPracticalState, 1, { kind: 'bookmark', bookmarked: true }, 'bookmark-one', now.toISOString());
  assert.equal(practicalStatistics([bookmark], 'Asia/Karachi', now).streak, 0);
});
