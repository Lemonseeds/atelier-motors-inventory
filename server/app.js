import { existsSync } from 'node:fs';
import { join } from 'node:path';
import express from 'express';
import { createRequireAuth } from './middleware.js';
import { createUserRepository } from './repositories/userRepository.js';
import { createVehicleRepository } from './repositories/vehicleRepository.js';
import { createAuthRouter } from './routes/authRoutes.js';
import { createVehicleRouter } from './routes/vehicleRoutes.js';
import { createAssistantRouter } from './routes/assistantRoutes.js';

/**
 * Composes the Express application. The database is injected so tests can use
 * an isolated SQLite database and production can use PostgreSQL.
 * @param {object} db database exposing prepare(sql).get/all/run
 * @param {{ clientDist?: string }} options optional built SPA directory to serve
 */
export function createApp(db, { clientDist } = {}) {
  const users = createUserRepository(db);
  const vehicles = createVehicleRepository(db);
  const requireAuth = createRequireAuth(users);

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter({ users, requireAuth }));
  app.use('/api/vehicles', createVehicleRouter({ vehicles, requireAuth }));
  app.use('/api/assistant', createAssistantRouter({ vehicles }));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

  if (clientDist && existsSync(clientDist)) serveSpa(app, clientDist);

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'Invalid JSON.' });
    console.error(error);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  });
  return app;
}

/** Serves the built React app and falls back to index.html for client-side routes. */
function serveSpa(app, clientDist) {
  app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
  app.get('/{*path}', (_req, res) => res.sendFile(join(clientDist, 'index.html')));
}
