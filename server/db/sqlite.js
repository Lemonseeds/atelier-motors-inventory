import Database from 'better-sqlite3';

/**
 * Shared schema, written in SQL that both SQLite and PostgreSQL accept
 * except for the identity column, which each adapter supplies.
 */
export function schemaSql(idColumn) {
  return `
    CREATE TABLE IF NOT EXISTS users (
      id ${idColumn},
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS vehicles (
      id ${idColumn},
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT NOT NULL,
      year INTEGER NOT NULL,
      price DOUBLE PRECISION NOT NULL CHECK (price >= 0),
      quantity INTEGER NOT NULL CHECK (quantity >= 0),
      image_url TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
    CREATE INDEX IF NOT EXISTS idx_vehicles_category_price ON vehicles(category, price);
    CREATE TABLE IF NOT EXISTS test_drives (
      id ${idColumn},
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      preferred_date TEXT NOT NULL,
      time_window TEXT NOT NULL CHECK (time_window IN ('Morning', 'Afternoon', 'Evening')),
      status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'cancelled')),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_test_drives_user ON test_drives(user_id, created_at);
  `;
}

/**
 * Opens (or creates) a file-backed SQLite database. better-sqlite3 already exposes
 * the `prepare(sql).get/all/run`, `exec` and `close` interface the repositories use.
 * @param {string} path file path, or ':memory:' for tests
 */
export function createSqliteDatabase(path) {
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(schemaSql('INTEGER PRIMARY KEY AUTOINCREMENT'));
  return db;
}
