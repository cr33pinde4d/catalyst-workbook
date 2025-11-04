-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Training days master data
CREATE TABLE IF NOT EXISTS training_days (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  order_num INTEGER NOT NULL
);

-- Steps within each training day
CREATE TABLE IF NOT EXISTS training_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_id INTEGER NOT NULL,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tools TEXT, -- JSON array of tools
  importance TEXT,
  limitations TEXT,
  instructions TEXT,
  FOREIGN KEY (day_id) REFERENCES training_days(id)
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  day_id INTEGER NOT NULL,
  step_id INTEGER NOT NULL,
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
  started_at DATETIME,
  completed_at DATETIME,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (day_id) REFERENCES training_days(id),
  FOREIGN KEY (step_id) REFERENCES training_steps(id),
  UNIQUE(user_id, day_id, step_id)
);

-- User responses to exercises
CREATE TABLE IF NOT EXISTS user_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  day_id INTEGER NOT NULL,
  step_id INTEGER NOT NULL,
  field_name TEXT NOT NULL, -- e.g., "problem_1", "swot_strengths"
  field_value TEXT NOT NULL, -- JSON or plain text
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (day_id) REFERENCES training_days(id),
  FOREIGN KEY (step_id) REFERENCES training_steps(id),
  UNIQUE(user_id, day_id, step_id, field_name)
);

-- Sessions for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_user ON user_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
