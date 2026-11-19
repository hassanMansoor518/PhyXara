const fs = require('node:fs');
const path = require('node:path');
const { authenticate } = require('./session');
const { practicalRoute } = require('./practicals');
const { VERIFIED_3D_MODELS } = require('./geminiService');
const { SINDH_PHYSICS_CHAPTERS } = require('../src/data/physicsTopics.ts');
const { PHYSICS_QUIZZES } = require('../src/data/quizzes.ts');

const defaults = { classLevel: 'Class 9', timeZone: 'Asia/Karachi', reminders: false };
const classes = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
let database;

async function getDatabase() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (!database) {
    database = (async () => {
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
      pool.on('error', error => console.error('Learning database:', error.message));
      try {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query('SELECT pg_advisory_xact_lock(764432)');
          await client.query(fs.readFileSync(path.join(__dirname, 'learning.sql'), 'utf8'));
          await client.query(
            `INSERT INTO learning_topics (id, position, content)
             SELECT entry->>'id', ordinality, entry FROM jsonb_array_elements($1) WITH ORDINALITY AS items(entry, ordinality)
             ON CONFLICT (id) DO UPDATE SET position = EXCLUDED.position, content = EXCLUDED.content`,
            [JSON.stringify(SINDH_PHYSICS_CHAPTERS)]
          );
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
        return pool;
      } catch (error) {
        await pool.end();
        database = undefined;
        throw error;
      }
    })();
  }
  return database;
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > 16384) {
      req.resume();
      throw Object.assign(new Error('Request too large'), { status: 413 });
    }
    chunks.push(chunk);
  }
  let data;
  try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { /* invalid JSON */ }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw Object.assign(new Error('Expected a JSON object'), { status: 400 });
  }
  return data;
}

async function getPreferences(db, user) {
  const result = await db.query('SELECT preferences FROM learning_preferences WHERE user_id = $1', [user]);
  return { ...defaults, ...result.rows[0]?.preferences };
}

function summarize(events, earned, timeZone, topicCount) {
  const stats = { xp: 0, streak: 0, questionsAnswered: 0, quizzesCompleted: 0,
    chaptersCompleted: 0, modelsExplored: 0, overallProgress: 0 };
  const completed = new Set();
  const models = new Set();
  const date = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const days = new Set();
  let perfect = false;
  for (const event of events) {
    days.add(date.format(event.occurred_at));
    if (event.kind === 'quiz') {
      stats.xp += event.correct * 10;
      stats.quizzesCompleted++;
      stats.questionsAnswered += event.total;
      perfect ||= event.correct === event.total;
    }
    if (event.kind === 'scan') models.add(event.target);
    if (event.kind === 'topic_complete') completed.add(event.target);
  }
  stats.modelsExplored = models.size;
  stats.chaptersCompleted = completed.size;
  stats.overallProgress = Math.round(100 * completed.size / Math.max(topicCount, 1));
  stats.xp += models.size * 25;
  const day = new Date(date.format(new Date()) + 'T00:00:00Z');
  const key = () => day.toISOString().slice(0, 10);
  if (!days.has(key())) day.setUTCDate(day.getUTCDate() - 1);
  while (days.has(key())) {
    stats.streak++;
    day.setUTCDate(day.getUTCDate() - 1);
  }

  let longestStreak = 0;
  let consecutive = 0;
  let previous = 0;
  for (const activityDay of [...days].sort()) {
    const timestamp = Date.parse(activityDay + 'T00:00:00Z');
    consecutive = timestamp - previous === 86400000 ? consecutive + 1 : 1;
    longestStreak = Math.max(longestStreak, consecutive);
    previous = timestamp;
  }

  const definitions = [
    ['first_scan', 'First Scan', 'Identify your first model', 'Scan', 'Explorer', 50, models.size, 1],
    ['first_quiz', 'First Quiz', 'Complete a practice quiz', 'Award', 'Mastery', 50, stats.quizzesCompleted, 1],
    ['7_day_streak', '7 Day Streak', 'Study for seven consecutive days', 'Flame', 'Streak', 100, longestStreak, 7],
    ['physics_explorer', 'Physics Explorer', 'Identify five different models', 'Box', 'Explorer', 75, models.size, 5],
    ['quiz_master', 'Quiz Master', 'Score 100% on a practice quiz', 'Trophy', 'Mastery', 120, Number(perfect), 1],
    ['chapter_completed', 'Chapter Completed', 'Finish your first chapter', 'GraduationCap', 'Mastery', 200, completed.size, 1],
  ];
  const achievements = definitions.map(([id, title, description, icon, category, rewardXP, count, goal]) => {
    const unlocked = earned.has(id) || count >= goal;
    if (unlocked) stats.xp += rewardXP;
    return { id, title, description, icon, category, rewardXP, unlocked,
      progress: unlocked ? 100 : Math.floor(100 * count / goal) };
  });
  return { stats, achievements, completedTopicIds: [...completed],
    resumeTopicId: events.find(event => event.kind === 'topic_open' && !completed.has(event.target))?.target };
}

async function getProgress(db, user, timeZone) {
  const events = await db.query(
    'SELECT kind, target, correct, total, occurred_at FROM learning_events WHERE user_id = $1 ORDER BY occurred_at DESC, event_id DESC', [user]);
  const earned = await db.query('SELECT achievement_id FROM learning_achievements WHERE user_id = $1', [user]);
  return summarize(events.rows, new Set(earned.rows.map(row => row.achievement_id)), timeZone, SINDH_PHYSICS_CHAPTERS.length);
}

async function handleLearning(req, res, url) {
  try {
    const route = new URL(url, 'http://localhost');
    const endpoint = route.pathname.slice('/api/v1'.length);
    const method = req.method;
    if (endpoint === '/practicals' || endpoint.startsWith('/practicals/')) {
      return await practicalRoute({ endpoint, method, req, res, send, readBody, getDatabase, authenticate });
    }
    if (method === 'GET' && endpoint === '/health') {
      await (await getDatabase()).query('SELECT 1');
      return send(res, 200, { status: 'ok' });
    }
    if (method === 'GET' && (endpoint === '/topics' || /^\/topics\/[\w-]+$/.test(endpoint))) {
      const db = await getDatabase();
      if (endpoint !== '/topics') {
        const result = await db.query('SELECT content FROM learning_topics WHERE id = $1', [endpoint.slice(8)]);
        return result.rowCount ? send(res, 200, { ...result.rows[0].content, progress: 0 })
          : send(res, 404, { error: 'Topic not found' });
      }
      const result = await db.query('SELECT content FROM learning_topics ORDER BY position');
      const classLevel = route.searchParams.get('classLevel');
      const query = route.searchParams.get('q')?.trim().toLowerCase();
      const topics = result.rows.map(row => ({ ...row.content, progress: 0 })).filter(topic =>
        (!classLevel || topic.classLevel === classLevel) &&
        (!query || topic.title.toLowerCase().includes(query) || topic.description.toLowerCase().includes(query)));
      return send(res, 200, { topics });
    }

    const user = await authenticate(req);
    if (!user || (req.headers['x-phyxara-account'] && req.headers['x-phyxara-account'] !== user)) return send(res, 401, { error: 'Sign in required' });
    const db = await getDatabase();
    if (method === 'GET' && endpoint === '/me') return send(res, 200, { userId: user });
    if (method === 'GET' && endpoint === '/me/preferences') return send(res, 200, await getPreferences(db, user));
    if (method === 'PATCH' && endpoint === '/me/preferences') {
      const patch = await readBody(req);
      for (const [key, value] of Object.entries(patch)) {
        let valid = key === 'classLevel' && classes.includes(value) ||
          key === 'reminders' && typeof value === 'boolean';
        if (key === 'timeZone' && typeof value === 'string' && value.length <= 64) {
          try { new Intl.DateTimeFormat('en', { timeZone: value }); valid = true; } catch { /* invalid zone */ }
        }
        if (!valid) return send(res, 400, { error: 'Invalid preference: ' + key });
      }
      const result = await db.query(
        `INSERT INTO learning_preferences VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET preferences = learning_preferences.preferences || $3::jsonb
         RETURNING preferences`, [user, { ...defaults, ...patch }, patch]);
      return send(res, 200, result.rows[0].preferences);
    }
    if (method === 'GET' && (endpoint === '/progress' || endpoint === '/home')) {
      const preferences = await getPreferences(db, user);
      const progress = await getProgress(db, user, preferences.timeZone);
      if (endpoint === '/progress') return send(res, 200, progress);
      const featured = SINDH_PHYSICS_CHAPTERS.find(topic => topic.classLevel === preferences.classLevel);
      const topic = SINDH_PHYSICS_CHAPTERS.find(item => item.id === progress.resumeTopicId) || featured;
      return send(res, 200, { ...progress, topic, featured });
    }
    if (method === 'POST' && (endpoint === '/activity' || endpoint === '/quiz-attempts')) {
      const body = await readBody(req);
      if (typeof body.eventId !== 'string' || !/^[\w-]{8,100}$/.test(body.eventId)) {
        return send(res, 400, { error: 'Invalid event ID' });
      }
      const timestamp = typeof body.occurredAt === 'string' ? Date.parse(body.occurredAt) : NaN;
      const occurredAt = Number.isFinite(timestamp) ? new Date(Math.min(timestamp, Date.now())) : new Date();
      if (occurredAt.getUTCFullYear() < 2020) return send(res, 400, { error: 'Invalid activity date' });
      let { kind, target } = body;
      let correct = 0;
      let total = 0;
      if (endpoint === '/quiz-attempts') {
        const answers = body.answers;
        if (!Array.isArray(answers) || answers.length !== PHYSICS_QUIZZES.length ||
            !PHYSICS_QUIZZES.every((question, index) => question.options.some(option => option.key === answers[index]))) {
          return send(res, 400, { error: 'Submit one valid answer per question' });
        }
        kind = 'quiz';
        target = 'general-physics';
        total = PHYSICS_QUIZZES.length;
        correct = PHYSICS_QUIZZES.filter((question, index) => question.correctOptionKey === answers[index]).length;
      } else if (!(
        (kind === 'topic_open' || kind === 'topic_complete') && SINDH_PHYSICS_CHAPTERS.some(topic => topic.id === target) ||
        kind === 'scan' && typeof target === 'string' && Object.hasOwn(VERIFIED_3D_MODELS, target)
      )) {
        return send(res, 400, { error: 'Invalid activity' });
      }
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [user]);
        await client.query(
          `INSERT INTO learning_events (user_id, event_id, kind, target, correct, total, occurred_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
          [user, body.eventId, kind, target, correct, total, occurredAt]);
        const { timeZone } = await getPreferences(client, user);
        const progress = await getProgress(client, user, timeZone);
        await client.query(
          `INSERT INTO learning_achievements SELECT $1, unnest($2::text[]) ON CONFLICT DO NOTHING`,
          [user, progress.achievements.filter(item => item.unlocked).map(item => item.id)]);
        await client.query('COMMIT');
        return send(res, 200, progress);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
    return send(res, 404, { error: 'Route not found' });
  } catch (error) {
    if (!error.status) console.error('Learning API:', error.message);
    return send(res, error.status || 503, { error: error.status ? error.message : 'Learning service unavailable' });
  }
}

module.exports = { handleLearning, summarize };
