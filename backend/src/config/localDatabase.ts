import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

type LocalResult = {
  data: any;
  error: { code?: string; message: string } | null;
  count?: number | null;
};

type Filter = {
  column: string;
  operator: 'eq' | 'lt' | 'gte' | 'isNull';
  value?: unknown;
};

const TABLES = new Set([
  'users',
  'test_runs',
  'test_results',
  'test_artifacts',
  'guest_usage',
  'daily_usage',
  'test_suites',
  'test_cases',
  'schedules',
  'environments',
  'reports',
]);

const JSON_COLUMNS = new Set(['test_config', 'details', 'config', 'data']);

const LOCAL_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  supabase_user_id TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  guest_id TEXT,
  url TEXT NOT NULL,
  browser TEXT DEFAULT 'chromium',
  status TEXT DEFAULT 'QUEUED',
  overall_status TEXT,
  test_mode TEXT DEFAULT 'quick',
  test_config TEXT,
  total_tests INTEGER DEFAULT 0,
  passed_tests INTEGER DEFAULT 0,
  failed_tests INTEGER DEFAULT 0,
  warning_tests INTEGER DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  error_category TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  url TEXT,
  details TEXT,
  duration_ms INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES test_runs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS test_artifacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  result_id INTEGER NOT NULL,
  run_id INTEGER NOT NULL,
  artifact_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (result_id) REFERENCES test_results(id) ON DELETE CASCADE,
  FOREIGN KEY (run_id) REFERENCES test_runs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS guest_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_identifier TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  test_count INTEGER DEFAULT 0,
  last_used_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  usage_date TEXT NOT NULL,
  test_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, usage_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS test_suites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  test_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  suite_id INTEGER,
  user_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  config TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (suite_id) REFERENCES test_suites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  suite_id INTEGER,
  name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  enabled INTEGER DEFAULT 1,
  next_run TEXT,
  last_run TEXT,
  last_status TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS environments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'development',
  status TEXT DEFAULT 'active',
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  title TEXT NOT NULL,
  period_start TEXT,
  period_end TEXT,
  total_tests INTEGER DEFAULT 0,
  passed_tests INTEGER DEFAULT 0,
  failed_tests INTEGER DEFAULT 0,
  warning_tests INTEGER DEFAULT 0,
  pass_rate REAL DEFAULT 0,
  data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_local_test_runs_created ON test_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_local_test_runs_user ON test_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_local_test_runs_guest ON test_runs(guest_id);
CREATE INDEX IF NOT EXISTS idx_local_test_results_run ON test_results(run_id);
CREATE INDEX IF NOT EXISTS idx_local_test_artifacts_run ON test_artifacts(run_id);
`;

function identifier(value: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Invalid local database identifier: ${value}`);
  }
  return `"${value}"`;
}

function serialize(value: unknown): unknown {
  if (value === undefined) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value !== null && typeof value === 'object') return JSON.stringify(value);
  return value;
}

function normalizeRow(row: Record<string, any>): Record<string, any> {
  const normalized = { ...row };

  for (const column of JSON_COLUMNS) {
    if (typeof normalized[column] !== 'string') continue;
    try {
      normalized[column] = JSON.parse(normalized[column]);
    } catch {
      // Keep legacy string values intact when they are not JSON.
    }
  }

  if ('enabled' in normalized) {
    normalized.enabled = Boolean(normalized.enabled);
  }

  return normalized;
}

class LocalQueryBuilder implements PromiseLike<LocalResult> {
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload: any;
  private selectedColumns = '*';
  private selectRequested = false;
  private singleResult = false;
  private countExact = false;
  private headOnly = false;
  private filters: Filter[] = [];
  private orFilters: Filter[] = [];
  private orderColumn: string | null = null;
  private orderAscending = true;
  private limitCount: number | null = null;
  private rangeStart: number | null = null;
  private rangeEnd: number | null = null;

  constructor(private readonly database: any, private readonly table: string) {
    if (!TABLES.has(table)) {
      throw new Error(`Unsupported local database table: ${table}`);
    }
  }

  select(columns = '*', options?: { count?: string; head?: boolean }): this {
    this.selectedColumns = columns;
    this.selectRequested = true;
    this.countExact = options?.count === 'exact';
    this.headOnly = options?.head === true;
    return this;
  }

  insert(payload: any): this {
    this.operation = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: any): this {
    this.operation = 'update';
    this.payload = payload;
    return this;
  }

  delete(): this {
    this.operation = 'delete';
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  lt(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'lt', value });
    return this;
  }

  gte(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'gte', value });
    return this;
  }

  or(expression: string): this {
    this.orFilters = expression.split(',').map((part) => {
      const match = part.match(/^([A-Za-z_][A-Za-z0-9_]*)\.(eq|is)\.(.*)$/);
      if (!match) throw new Error(`Unsupported local OR filter: ${part}`);

      return {
        column: match[1],
        operator: match[2] === 'is' ? 'isNull' : 'eq',
        value: match[2] === 'is' && match[3] === 'null' ? null : match[3],
      } as Filter;
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.orderColumn = column;
    this.orderAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  range(start: number, end: number): this {
    this.rangeStart = Math.max(0, start);
    this.rangeEnd = Math.max(this.rangeStart, end);
    return this;
  }

  single(): this {
    this.singleResult = true;
    return this;
  }

  then(onfulfilled?: any, onrejected?: any): Promise<any> {
    return Promise.resolve()
      .then(() => this.execute())
      .then(onfulfilled, onrejected);
  }

  private execute(): LocalResult {
    try {
      if (this.operation === 'insert') return this.executeInsert();
      if (this.operation === 'update') return this.executeUpdate();
      if (this.operation === 'delete') return this.executeDelete();
      return this.executeSelect();
    } catch (error: any) {
      return {
        data: null,
        error: {
          code: error?.code || 'LOCAL_DB_ERROR',
          message: error?.message || 'Local database query failed',
        },
      };
    }
  }

  private executeInsert(): LocalResult {
    const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
    const insertedRows: Record<string, any>[] = [];

    for (const originalRow of rows) {
      const row = { ...originalRow };
      if (this.table === 'users' && !row.id) {
        row.id = crypto.randomUUID();
      }

      const columns = Object.keys(row).filter((column) => row[column] !== undefined);
      const placeholders = columns.map(() => '?').join(', ');
      const statement = this.database.prepare(
        `INSERT INTO ${identifier(this.table)} (${columns.map(identifier).join(', ')}) VALUES (${placeholders})`
      );
      const result = statement.run(...columns.map((column) => serialize(row[column])));
      const primaryKey = row.id ?? Number(result.lastInsertRowid);
      const inserted = this.database
        .prepare(`SELECT * FROM ${identifier(this.table)} WHERE ${identifier('id')} = ?`)
        .get(primaryKey);
      insertedRows.push(normalizeRow(inserted || row));
    }

    const data = this.singleResult ? insertedRows[0] : insertedRows;
    return { data, error: null };
  }

  private executeUpdate(): LocalResult {
    const row = this.payload || {};
    const columns = Object.keys(row).filter((column) => row[column] !== undefined);
    if (columns.length === 0) return { data: [], error: null };

    const where = this.buildWhere();
    const statement = this.database.prepare(
      `UPDATE ${identifier(this.table)} SET ${columns.map((column) => `${identifier(column)} = ?`).join(', ')}${where.sql}`
    );
    statement.run(...columns.map((column) => serialize(row[column])), ...where.values);

    if (!this.selectRequested) return { data: null, error: null };
    return this.executeSelect();
  }

  private executeDelete(): LocalResult {
    const where = this.buildWhere();
    const deletedRows = this.database
      .prepare(`SELECT * FROM ${identifier(this.table)}${where.sql}`)
      .all(...where.values)
      .map(normalizeRow);

    this.database.prepare(`DELETE FROM ${identifier(this.table)}${where.sql}`).run(...where.values);
    return { data: this.selectRequested ? deletedRows : null, error: null };
  }

  private executeSelect(): LocalResult {
    const where = this.buildWhere();
    let count: number | null | undefined;

    if (this.countExact) {
      const countRow = this.database
        .prepare(`SELECT COUNT(*) AS count FROM ${identifier(this.table)}${where.sql}`)
        .get(...where.values);
      count = Number(countRow.count);
      if (this.headOnly) return { data: null, error: null, count };
    }

    const columns = this.selectedColumns === '*'
      ? '*'
      : this.selectedColumns.split(',').map((column) => identifier(column.trim())).join(', ');
    let sql = `SELECT ${columns} FROM ${identifier(this.table)}${where.sql}`;

    if (this.orderColumn) {
      sql += ` ORDER BY ${identifier(this.orderColumn)} ${this.orderAscending ? 'ASC' : 'DESC'}`;
    }

    if (this.rangeStart !== null && this.rangeEnd !== null) {
      sql += ` LIMIT ${this.rangeEnd - this.rangeStart + 1} OFFSET ${this.rangeStart}`;
    } else if (this.limitCount !== null) {
      sql += ` LIMIT ${this.limitCount}`;
    }

    const rows = this.database.prepare(sql).all(...where.values).map(normalizeRow);
    if (this.singleResult) {
      if (rows.length !== 1) {
        return {
          data: null,
          error: {
            code: 'PGRST116',
            message: rows.length === 0 ? 'No rows found' : 'Multiple rows found',
          },
          count,
        };
      }
      return { data: rows[0], error: null, count };
    }

    return { data: rows, error: null, count };
  }

  private buildWhere(): { sql: string; values: unknown[] } {
    const clauses: string[] = [];
    const values: unknown[] = [];

    const appendFilter = (filter: Filter): string => {
      const column = identifier(filter.column);
      if (filter.operator === 'isNull') return `${column} IS NULL`;
      values.push(serialize(filter.value));
      const operator = filter.operator === 'lt' ? '<' : filter.operator === 'gte' ? '>=' : '=';
      return `${column} ${operator} ?`;
    };

    for (const filter of this.filters) {
      clauses.push(appendFilter(filter));
    }

    if (this.orFilters.length > 0) {
      clauses.push(`(${this.orFilters.map(appendFilter).join(' OR ')})`);
    }

    return {
      sql: clauses.length > 0 ? ` WHERE ${clauses.join(' AND ')}` : '',
      values,
    };
  }
}

class LocalDatabaseClient {
  constructor(private readonly database: any) {}

  from(table: string): LocalQueryBuilder {
    return new LocalQueryBuilder(this.database, table);
  }
}

export function createLocalDatabase(databasePath: string): LocalDatabaseClient {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  database.exec(LOCAL_SCHEMA);
  migrateLegacySchema(database);
  return new LocalDatabaseClient(database);
}

function migrateLegacySchema(database: any): void {
  // Older local SQLite databases used `tests_used` instead of `test_count`.
  // Keep those databases usable when a developer switches off Supabase.
  ensureColumn(database, 'guest_usage', 'test_count', 'INTEGER NOT NULL DEFAULT 0');
  if (hasColumn(database, 'guest_usage', 'tests_used')) {
    database.prepare(
      `UPDATE ${identifier('guest_usage')} SET ${identifier('test_count')} = ${identifier('tests_used')} WHERE ${identifier('test_count')} = 0 AND ${identifier('tests_used')} > 0`
    ).run();
  }

  ensureColumn(database, 'daily_usage', 'test_count', 'INTEGER NOT NULL DEFAULT 0');
  if (hasColumn(database, 'daily_usage', 'tests_used')) {
    database.prepare(
      `UPDATE ${identifier('daily_usage')} SET ${identifier('test_count')} = ${identifier('tests_used')} WHERE ${identifier('test_count')} = 0 AND ${identifier('tests_used')} > 0`
    ).run();
  }

  // The legacy artifact table did not store the optional public URL column.
  ensureColumn(database, 'test_artifacts', 'file_url', 'TEXT');
}

function hasColumn(database: any, table: string, column: string): boolean {
  return database
    .prepare(`PRAGMA table_info(${identifier(table)})`)
    .all()
    .some((entry: { name: string }) => entry.name === column);
}

function ensureColumn(database: any, table: string, column: string, definition: string): void {
  if (!hasColumn(database, table, column)) {
    database.exec(`ALTER TABLE ${identifier(table)} ADD COLUMN ${identifier(column)} ${definition}`);
  }
}
