/** Data access for user accounts. */

/** Raised when registering an email that already exists. */
export class DuplicateEmailError extends Error {
  constructor() {
    super('An account with this email already exists.');
    this.name = 'DuplicateEmailError';
  }
}

// SQLite and PostgreSQL report unique-constraint violations differently.
const isUniqueViolation = (error) => error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === '23505';

/** Strips the password hash so it never leaves the server. */
export const toPublicUser = (row) => row && { id: Number(row.id), name: row.name, email: row.email, role: row.role };

export function createUserRepository(db) {
  return {
    /** Includes password_hash; for login checks only. */
    async findByEmailWithHash(email) {
      return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    },

    async findById(id) {
      return toPublicUser(await db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(id));
    },

    async create({ name, email, passwordHash, role }) {
      try {
        const row = await db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) RETURNING id, name, email, role')
          .get(name, email, passwordHash, role);
        return toPublicUser(row);
      } catch (error) {
        if (isUniqueViolation(error)) throw new DuplicateEmailError();
        throw error;
      }
    },
  };
}
