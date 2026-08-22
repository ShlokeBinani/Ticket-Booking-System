const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_Df1hEg8xIlsW@ep-lingering-resonance-aya9r8md-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
  });
  
  await client.connect();
  
  const hash = await bcrypt.hash('12345678', 10);
  
  await client.query(
    "INSERT INTO users (email, password_hash, name, role) VALUES ('admin@demo.com', $1, 'System Admin', 'admin') ON CONFLICT (email) DO NOTHING", 
    [hash]
  );
  
  await client.query(
    "INSERT INTO users (email, password_hash, name, role) VALUES ('organizer@demo.com', $1, 'Event Organizer', 'organiser') ON CONFLICT (email) DO NOTHING", 
    [hash]
  );

  console.log("Accounts seeded!");
  await client.end();
}

seed();
