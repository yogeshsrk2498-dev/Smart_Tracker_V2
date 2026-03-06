import Database from 'better-sqlite3';
import path from 'path';

// Local SQLite database for system configuration
const dbPath = path.resolve(process.cwd(), 'system_config.db');
const db = new Database(dbPath);

// Initialize the local configuration database schema
export function initConfigDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Check if the system has been configured
// A system is considered configured if an admin user exists AND an external database connection is set
export function isSystemConfigured(): boolean {
  try {
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
    const dbConfig = db.prepare("SELECT value FROM settings WHERE key = 'external_db_config'").get() as { value: string } | undefined;
    
    return adminCount.count > 0 && !!dbConfig && !!dbConfig.value;
  } catch (error) {
    // If tables don't exist yet, it's not configured
    return false;
  }
}

// Get setting value
export function getSetting(key: string): string | null {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

// Set setting value
export function setSetting(key: string, value: string) {
  db.prepare(`
    INSERT INTO settings (key, value) 
    VALUES (?, ?) 
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).run(key, value);
}

// Get the local DB instance
export function getConfigDB() {
  return db;
}

// Initialize on load
initConfigDB();
