import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const globalForPg = globalThis;

export const pool = globalForPg.__wishlistPgPool || new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

if (!globalForPg.__wishlistPgPool) {
  globalForPg.__wishlistPgPool = pool;
}

let initPromise;

export async function ensureClaimsTable() {
  initPromise ||= pool.query(`
    CREATE TABLE IF NOT EXISTS gift_claims (
      id BIGSERIAL PRIMARY KEY,
      item_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      claimer_name TEXT NOT NULL,
      claimer_email TEXT,
      claimer_phone TEXT,
      message TEXT,
      is_unlimited BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    DROP INDEX IF EXISTS gift_claims_once_per_item_idx;

    CREATE INDEX IF NOT EXISTS gift_claims_item_id_idx
      ON gift_claims (item_id);

    CREATE INDEX IF NOT EXISTS gift_claims_created_at_idx
      ON gift_claims (created_at DESC);
  `);

  await initPromise;
}
