const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Df1hEg8xIlsW@ep-lingering-resonance-aya9r8md-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require' });
async function test() {
  const res = await pool.query(`
    SELECT ss.id, ss.status, sl.row, sl.number 
    FROM show_seats ss
    JOIN seat_layouts sl ON ss.seat_layout_id = sl.id
    WHERE ss.show_id = 3
    LIMIT 5;
  `);
  console.log(res.rows);
  process.exit();
}
test();
