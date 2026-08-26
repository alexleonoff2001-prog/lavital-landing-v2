export const createLeadsTable = `
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    consent_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    source TEXT NOT NULL
  )
`;

export const createRateLimitsTable = `
  CREATE TABLE IF NOT EXISTS rate_limits (
    rate_key TEXT PRIMARY KEY,
    request_count INTEGER NOT NULL,
    window_started INTEGER NOT NULL
  )
`;
