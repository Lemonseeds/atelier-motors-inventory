/**
 * Data access for vehicles. Works with any database exposing the
 * `prepare(sql).get/all/run` interface (SQLite locally, PostgreSQL when hosted).
 * All SQL is portable between the two engines.
 */

/** Maps API field names to database column names; also acts as the update whitelist. */
const COLUMN_FOR_FIELD = {
  make: 'make', model: 'model', category: 'category', year: 'year',
  price: 'price', quantity: 'quantity', imageUrl: 'image_url', description: 'description',
};

/** Converts a database row to the API's camelCase vehicle shape. */
export function toVehicle(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    make: row.make,
    model: row.model,
    category: row.category,
    year: Number(row.year),
    price: Number(row.price),
    quantity: Number(row.quantity),
    imageUrl: row.image_url,
    description: row.description,
    createdBy: row.created_by == null ? null : Number(row.created_by),
  };
}

/** Escapes LIKE wildcards so user input is matched literally. */
const likePattern = (text) => `%${text.toLowerCase().replace(/[\\%_]/g, '\\$&')}%`;

/** Builds a WHERE clause from validated search filters. */
function buildFilterClause(filters) {
  const clauses = [];
  const params = [];
  if (filters.q) {
    clauses.push("LOWER(make || ' ' || model) LIKE ? ESCAPE '\\'");
    params.push(likePattern(filters.q));
  }
  for (const key of ['make', 'model', 'category']) {
    if (!filters[key]) continue;
    clauses.push(`LOWER(${key}) LIKE ? ESCAPE '\\'`);
    params.push(likePattern(filters[key]));
  }
  if (filters.minPrice !== undefined) { clauses.push('price >= ?'); params.push(filters.minPrice); }
  if (filters.maxPrice !== undefined) { clauses.push('price <= ?'); params.push(filters.maxPrice); }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

export function createVehicleRepository(db) {
  return {
    /** Lists vehicles matching optional filters, newest first. */
    async list(filters = {}) {
      const { where, params } = buildFilterClause(filters);
      const rows = await db.prepare(`SELECT * FROM vehicles ${where} ORDER BY created_at DESC, id DESC`).all(...params);
      return rows.map(toVehicle);
    },

    async findById(id) {
      return toVehicle(await db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id));
    },

    async count() {
      const row = await db.prepare('SELECT COUNT(*) AS total FROM vehicles').get();
      return Number(row.total);
    },

    async create(vehicle, createdBy) {
      const row = await db.prepare(`
        INSERT INTO vehicles (make, model, category, year, price, quantity, image_url, description, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *
      `).get(vehicle.make, vehicle.model, vehicle.category, vehicle.year, vehicle.price,
        vehicle.quantity, vehicle.imageUrl ?? '', vehicle.description ?? '', createdBy);
      return toVehicle(row);
    },

    /** Applies a partial update; only whitelisted fields reach the SQL. */
    async update(id, changes) {
      const entries = Object.entries(changes).filter(([key]) => key in COLUMN_FOR_FIELD);
      const assignments = entries.map(([key]) => `${COLUMN_FOR_FIELD[key]} = ?`).join(', ');
      const row = await db.prepare(`UPDATE vehicles SET ${assignments} WHERE id = ? RETURNING *`)
        .get(...entries.map(([, value]) => value), id);
      return toVehicle(row);
    },

    async remove(id) {
      const result = await db.prepare('DELETE FROM vehicles WHERE id = ?').run(id);
      return result.changes > 0;
    },

    /**
     * Sells one unit. The conditional UPDATE is atomic, so two concurrent
     * buyers can never both purchase the last unit. Returns null if sold out or missing.
     */
    async purchase(id) {
      const row = await db.prepare('UPDATE vehicles SET quantity = quantity - 1 WHERE id = ? AND quantity > 0 RETURNING *').get(id);
      return toVehicle(row);
    },

    /** Adds stock. Returns null if the vehicle does not exist. */
    async restock(id, quantity) {
      const row = await db.prepare('UPDATE vehicles SET quantity = quantity + ? WHERE id = ? RETURNING *').get(quantity, id);
      return toVehicle(row);
    },
  };
}
