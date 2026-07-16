import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for SSL connections (Railway, Supabase, etc.)
  max: 10, // keep pool small for serverless environments
});

export const db = drizzle(pool);
