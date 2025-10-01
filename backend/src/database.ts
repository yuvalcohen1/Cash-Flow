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
