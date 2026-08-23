const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Df1hEg8xIlsW@ep-lingering-resonance-aya9r8md-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require' });
async function check() {
  const events = await pool.query('SELECT id, title FROM events ORDER BY id ASC');
  console.log("Events:", events.rows);
  const shows = await pool.query('SELECT id, event_id FROM shows ORDER BY id ASC');
  console.log("Shows:", shows.rows);
  process.exit(0);
}
check();
