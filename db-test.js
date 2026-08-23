const { Client } = require('pg');
const client = new Client('postgresql://neondb_owner:npg_Df1hEg8xIlsW@ep-lingering-resonance-aya9r8md-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require');
async function test() {
  await client.connect();
  console.log('shows:', (await client.query(`SELECT id FROM shows`)).rows);
  console.log('show_seats count:', (await client.query(`SELECT COUNT(*) FROM show_seats`)).rows);
  process.exit(0);
}
test();
