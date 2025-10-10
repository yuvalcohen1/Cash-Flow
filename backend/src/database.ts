import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// ✅ Make sure the directory exists
const dataDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file (auto-created if missing)
const dbPath = path.join(dataDir, "app.db");
const db = new Database(dbPath);

// ===========================
// Tables creation
// ===========================

// Users table (optional)
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`
).run();

// Transactions table
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category_id INTEGER,
      description TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`
).run();

// AI Reports table
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS ai_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    report_text TEXT NOT NULL,
    processed_insights TEXT NOT NULL,  -- JSON string
    start_date TEXT,
    end_date TEXT,
    num_transactions INTEGER NOT NULL,
    savings_rate REAL,
    total_income REAL,
    total_expenses REAL,
    model_used TEXT DEFAULT 'gemini-2.5-flash',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`
).run();

db.prepare(
  `
  CREATE INDEX IF NOT EXISTS idx_reports_user_id ON ai_reports(user_id)
`
).run();

db.prepare(
  `
  CREATE INDEX IF NOT EXISTS idx_reports_created_at ON ai_reports(created_at DESC)
`
).run();

// Trigger to auto-update updated_at
db.prepare(
  `
  CREATE TRIGGER IF NOT EXISTS update_transaction_updated_at
  AFTER UPDATE ON transactions
  FOR EACH ROW
  WHEN NEW.updated_at = OLD.updated_at
  BEGIN
      UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`
).run();

export default db;
