CREATE TABLE IF NOT EXISTS learning_topics (
  id text PRIMARY KEY,
  position integer NOT NULL,
  content jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS learning_preferences (
  user_id text PRIMARY KEY,
  preferences jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS learning_events (
  user_id text NOT NULL,
  event_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('topic_open', 'topic_complete', 'quiz', 'scan')),
  target text NOT NULL,
  correct integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);
CREATE TABLE IF NOT EXISTS learning_achievements (
  user_id text NOT NULL,
  achievement_id text NOT NULL,
  PRIMARY KEY (user_id, achievement_id)
);


CREATE TABLE IF NOT EXISTS practical_events (
  user_id text NOT NULL,
  practical_number smallint NOT NULL CHECK (practical_number BETWEEN 1 AND 16),
  event_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('learn', 'view', 'bookmark', 'quiz')),
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  PRIMARY KEY (user_id, event_id)
);
CREATE INDEX IF NOT EXISTS practical_events_history_idx
  ON practical_events (user_id, practical_number, occurred_at DESC);
