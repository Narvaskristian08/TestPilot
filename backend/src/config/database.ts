import Database from 'better-sqlite3';
import { CONFIG } from './constants';
import fs from 'fs';
import path from 'path';

// Ensure storage directories exist
const storageDir = path.dirname(CONFIG.DATABASE_PATH);
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

if (!fs.existsSync(CONFIG.ARTIFACTS_PATH)) {
  fs.mkdirSync(CONFIG.ARTIFACTS_PATH, { recursive: true });
}

// Initialize database connection
export const db = new Database(CONFIG.DATABASE_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
  console.log('Initializing database schema...');

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create test_projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      base_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create test_runs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'QUEUED',
      started_at DATETIME,
      completed_at DATETIME,
      duration_ms INTEGER,
      total_tests INTEGER DEFAULT 0,
      passed_tests INTEGER DEFAULT 0,
      failed_tests INTEGER DEFAULT 0,
      warning_tests INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES test_projects(id)
    )
  `);

  // Create test_results table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER NOT NULL,
      test_name TEXT NOT NULL,
      test_type TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      details TEXT,
      duration_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (run_id) REFERENCES test_runs(id) ON DELETE CASCADE
    )
  `);

  // Create test_artifacts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_artifacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      result_id INTEGER NOT NULL,
      artifact_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (result_id) REFERENCES test_results(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
    CREATE INDEX IF NOT EXISTS idx_test_runs_created_at ON test_runs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_test_results_run_id ON test_results(run_id);
    CREATE INDEX IF NOT EXISTS idx_test_artifacts_result_id ON test_artifacts(result_id);
  `);

  console.log('Database schema initialized successfully');
}

// Initialize on import
initDatabase();

export default db;
