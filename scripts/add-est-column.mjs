import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS est INTEGER NOT NULL DEFAULT 1`;

console.log('Column "est" added.');
process.exit(0);
