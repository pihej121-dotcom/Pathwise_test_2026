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
 * SSL: the explicit `ssl` object below is authoritative. When node-postgres
 * receives both a connection-string SSL parameter (e.g. sslmode=require) AND
 * a programmatic `ssl` object, the two can conflict and produce
 * SELF_SIGNED_CERT_IN_CHAIN errors. To keep SSL behaviour unambiguous:
 *   • DATABASE_URL must NOT contain sslmode, sslcert, sslkey, or sslrootcert
 *     query parameters. Strip them if they are present (e.g. Supabase copies
 *     them into the pooler URI by default — remove the ?sslmode=... suffix).
 *   • `rejectUnauthorized: false` accepts the provider's self-signed cert
 *     chain while still encrypting the connection. SSL is never disabled.
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
