const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addGoogleColumns() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_key" ON "users"("google_id");
    `);
    console.log('✅ Successfully added Google Auth columns to users table in PostgreSQL!');
  } finally {
    client.release();
    await pool.end();
  }
}

addGoogleColumns().catch(console.error);
