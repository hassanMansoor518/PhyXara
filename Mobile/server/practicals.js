const { class9Labs, practicalUnityModels } = require('../src/data/class9Labs.ts');
const { practicalQuiz } = require('../src/data/practicalQuiz.ts');

function publicLab(lab, index) {
  const { calculate, ...content } = lab;
  const number = index + 1;
  return { ...content, number, classLevel: 'Class 9', unityModel: practicalUnityModels[number] || null };
}

function validateEvent(number, body) {
  if (typeof body.eventId !== 'string' || !/^[\w-]{8,100}$/.test(body.eventId)) return null;
  const { kind } = body;
  if (kind === 'learn' || kind === 'view') return {};
  if (kind === 'bookmark' && typeof body.bookmarked === 'boolean') return { bookmarked: body.bookmarked };
  if (kind !== 'quiz') return null;
  const quiz = practicalQuiz(number);
  const { answers, elapsedSeconds } = body;
  if (!Array.isArray(answers) || answers.length !== quiz.length ||
      !answers.every(answer => answer === null || (Number.isInteger(answer) && answer >= 0 && answer < 4)) ||
      !Number.isInteger(elapsedSeconds) || elapsedSeconds < 0 || elapsedSeconds > 86400) return null;
  const score = quiz.filter((item, index) => item.correct === answers[index]).length;
  return { answers, elapsedSeconds, score, total: quiz.length, percentage: Math.round(100 * score / quiz.length) };
}

async function practicalRoute({ endpoint, method, req, res, send, readBody, getDatabase, authenticate }) {
  if (endpoint === '/practicals' && method === 'GET') {
    return send(res, 200, { practicals: class9Labs.map(publicLab) });
  }
  const match = endpoint.match(/^\/practicals\/(\d+)(?:\/(quiz|model|state|events))?$/);
  if (!match || !class9Labs[Number(match[1]) - 1]) return send(res, 404, { error: 'Practical not found' });
  const [, id, action] = match;
  const number = Number(id);
  if (method === 'GET') {
    const lab = publicLab(class9Labs[number - 1], number - 1);
    if (!action) return send(res, 200, lab);
    if (action === 'model') return send(res, 200, { model: lab.model, unityModel: lab.unityModel });
    if (action === 'quiz') {
      return send(res, 200, { questions: practicalQuiz(number).map(({ question, options }) => ({ question, options })) });
    }
  }
  if (!((action === 'events' && method === 'POST') || (action === 'state' && method === 'GET'))) {
    return send(res, 405, { error: 'Method not supported' });
  }
  const user = await authenticate(req);
  if (!user || (req.headers['x-phyxara-account'] && req.headers['x-phyxara-account'] !== user)) {
    return send(res, 401, { error: 'Sign in required' });
  }
  if (method === 'POST') {
    const body = await readBody(req);
    const payload = validateEvent(number, body);
    if (!payload) return send(res, 400, { error: 'Invalid practical event' });
    const db = await getDatabase();
    const timestamp = typeof body.occurredAt === 'string' ? Date.parse(body.occurredAt) : NaN;
    const occurredAt = new Date(Number.isFinite(timestamp) ? Math.min(timestamp, Date.now()) : Date.now());
    if (occurredAt.getUTCFullYear() < 2020) return send(res, 400, { error: 'Invalid activity date' });
    await db.query(
      `INSERT INTO practical_events (user_id, practical_number, event_id, kind, payload, occurred_at)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
      [user, number, body.eventId, body.kind, payload, occurredAt]);
    const saved = await db.query(
      'SELECT practical_number, kind, payload FROM practical_events WHERE user_id = $1 AND event_id = $2',
      [user, body.eventId]);
    const event = saved.rows[0];
    if (event.practical_number !== number || event.kind !== body.kind) {
      return send(res, 409, { error: 'Event ID already used' });
    }
    return send(res, 200, event.payload);
  }
  const db = await getDatabase();
  const [status, attempts] = await Promise.all([
    db.query(`SELECT DISTINCT ON (kind) kind, payload FROM practical_events
      WHERE user_id = $1 AND practical_number = $2 AND kind <> 'quiz'
      ORDER BY kind, occurred_at DESC, event_id DESC`, [user, number]),
    db.query(`SELECT event_id, payload, occurred_at FROM practical_events
      WHERE user_id = $1 AND practical_number = $2 AND kind = 'quiz'
      ORDER BY occurred_at DESC, event_id DESC LIMIT 25`, [user, number]),
  ]);
  const latest = Object.fromEntries(status.rows.map(row => [row.kind, row.payload]));
  return send(res, 200, {
    learned: Boolean(latest.learn), viewed: Boolean(latest.view), bookmarked: latest.bookmark?.bookmarked ?? false,
    attempts: attempts.rows.map(row => ({ ...row.payload, id: row.event_id, createdAt: row.occurred_at })),
  });
}

module.exports = { practicalRoute, validateEvent };
