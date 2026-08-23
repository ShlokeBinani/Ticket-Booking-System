const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Df1hEg8xIlsW@ep-lingering-resonance-aya9r8md-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require' });
async function test() {
  const res = await pool.query(`SELECT show_id, count(*) FROM show_seats GROUP BY show_id`);
  console.log(res.rows);
  process.exit();
}
test();
