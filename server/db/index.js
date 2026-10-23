import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createPostgresDatabase } from './postgres.js';
import { createSqliteDatabase } from './sqlite.js';

/**
 * Chooses the database from configuration: PostgreSQL when DATABASE_URL is set
 * (hosted deployments), otherwise a persistent SQLite file (local development).
 */
export async function openDatabase({ databaseUrl, databasePath }) {
  if (databaseUrl) return createPostgresDatabase(databaseUrl);
  mkdirSync(dirname(databasePath), { recursive: true });
  return createSqliteDatabase(databasePath);
}
