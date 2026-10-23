import Database from 'better-sqlite3';

export function createDatabase(path) {
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT NOT NULL,
      year INTEGER NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      quantity INTEGER NOT NULL CHECK (quantity >= 0),
      image_url TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
    CREATE INDEX IF NOT EXISTS idx_vehicles_category_price ON vehicles(category, price);
  `);
  return db;
}

export function vehicleById(db, id) {
  const row = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
  return row && {
    id: row.id, make: row.make, model: row.model, category: row.category,
    year: row.year, price: row.price, quantity: row.quantity,
    imageUrl: row.image_url, description: row.description, createdBy: row.created_by,
  };
}
