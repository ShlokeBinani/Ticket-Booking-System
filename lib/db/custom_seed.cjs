const { Client } = require('pg');
const client = new Client('postgresql://neondb_owner:npg_Df1hEg8xIlsW@ep-lingering-resonance-aya9r8md-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require');
async function seed() {
  await client.connect();
  try {
    const v1 = await client.query("INSERT INTO venues (name, city, address, capacity) VALUES ('Jio World Drive', 'Mumbai', 'Bandra Kurla Complex', 72) RETURNING id");
    const v2 = await client.query("INSERT INTO venues (name, city, address, capacity) VALUES ('JLN Stadium', 'Delhi', 'Pragati Vihar', 72) RETURNING id");
    const venues = [v1.rows[0].id, v2.rows[0].id];
    for (const v of venues) {
      const p = await client.query(`INSERT INTO seat_categories (venue_id, name) VALUES (${v}, 'Premium') RETURNING id`);
      const s = await client.query(`INSERT INTO seat_categories (venue_id, name) VALUES (${v}, 'Standard') RETURNING id`);
      for (const row of ['A','B','C','D','E','F']) {
        for (let i = 1; i <= 12; i++) {
          await client.query(`INSERT INTO seat_layouts (venue_id, category_id, row, number) VALUES (${v}, ${row === 'A' || row === 'B' ? p.rows[0].id : s.rows[0].id}, '${row}', ${i})`);
        }
      }
    }
    console.log('Seeded');
  } catch(e) {
    console.log(e);
  }
  process.exit(0);
}
seed();
