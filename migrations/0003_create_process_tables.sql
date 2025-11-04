-- Create tables for real problem analysis processes

-- Processes table: stores each problem analysis process
CREATE TABLE IF NOT EXISTS processes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
  current_day INTEGER DEFAULT 1,
  current_step INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Process steps: tracks which steps are completed in each process
CREATE TABLE IF NOT EXISTS process_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  process_id INTEGER NOT NULL,
  day_id INTEGER NOT NULL,
  step_id INTEGER NOT NULL,
  completed BOOLEAN DEFAULT 0,
  completed_at DATETIME,
  FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE,
  FOREIGN KEY (day_id) REFERENCES training_days(id),
  FOREIGN KEY (step_id) REFERENCES training_steps(id),
  UNIQUE(process_id, day_id, step_id)
);

-- Process responses: stores user inputs for each step in a process
CREATE TABLE IF NOT EXISTS process_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  process_id INTEGER NOT NULL,
  day_id INTEGER NOT NULL,
  step_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  response_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE,
  FOREIGN KEY (day_id) REFERENCES training_days(id),
  FOREIGN KEY (step_id) REFERENCES training_steps(id),
  UNIQUE(process_id, day_id, step_id, field_name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_processes_user_id ON processes(user_id);
CREATE INDEX IF NOT EXISTS idx_processes_status ON processes(status);
CREATE INDEX IF NOT EXISTS idx_process_steps_process_id ON process_steps(process_id);
CREATE INDEX IF NOT EXISTS idx_process_responses_process_id ON process_responses(process_id);
CREATE INDEX IF NOT EXISTS idx_process_responses_lookup ON process_responses(process_id, day_id, step_id, field_name);

-- Trigger to update updated_at timestamp on processes
CREATE TRIGGER IF NOT EXISTS update_process_timestamp 
AFTER UPDATE ON processes
BEGIN
  UPDATE processes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp on process_responses
CREATE TRIGGER IF NOT EXISTS update_process_response_timestamp 
AFTER UPDATE ON process_responses
BEGIN
  UPDATE process_responses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
