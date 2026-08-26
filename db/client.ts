import { env } from 'cloudflare:workers';
import { createLeadsTable, createRateLimitsTable } from './schema';

export function getDatabase(): D1Database {
  const database = (env as unknown as { DB?: D1Database }).DB;
  if (!database) throw new Error('Database binding is unavailable');
  return database;
}

export async function ensureDatabase(database: D1Database) {
  await database.batch([
    database.prepare(createLeadsTable),
    database.prepare(createRateLimitsTable),
  ]);
}
