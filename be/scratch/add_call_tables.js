const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addCallTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "CallType" AS ENUM ('AUDIO', 'VIDEO');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "CallStatus" AS ENUM ('MISSED', 'COMPLETED', 'REJECTED', 'BUSY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS "call_logs" (
        "id" TEXT PRIMARY KEY,
        "caller_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "receiver_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "type" "CallType" NOT NULL DEFAULT 'AUDIO',
        "status" "CallStatus" NOT NULL DEFAULT 'COMPLETED',
        "duration" INTEGER NOT NULL DEFAULT 0,
        "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "ended_at" TIMESTAMP(3)
      );
    `);
    console.log('✅ Successfully added CallLog table to PostgreSQL!');
  } finally {
    client.release();
    await pool.end();
  }
}

addCallTables().catch(console.error);
