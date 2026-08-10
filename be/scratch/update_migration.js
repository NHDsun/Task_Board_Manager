const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixMigrationName() {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE "_prisma_migrations" SET migration_name = 'init' WHERE migration_name = '20260810030829_init';`
    );
    console.log('✅ Successfully updated migration_name in PostgreSQL!');
  } finally {
    client.release();
    await pool.end();
  }
}

fixMigrationName().catch(console.error);
