import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";

/**
 * Connection pool configuration for serverless environments (Vercel) and
 * traditional servers alike.
 *
 * Pool size: keep at 2 for Vercel. Each serverless instance creates its own
 * pool, so 10+ connections per instance × many concurrent instances quickly
 * exhausts Supabase's connection limit. 2 is sufficient for the async
 * request-per-invocation pattern.
 *
 * Prepared statements: Drizzle with node-postgres uses parameterized queries
 * (not named prepared statements), which is compatible with Supabase's
 * transaction pooler (PgBouncer, port 6543). No special configuration needed.
 *
 * SSL: required for Supabase, Railway, and most managed PostgreSQL providers.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// Single shared instance — reused across warm serverless invocations.
export const db = drizzle(pool);
