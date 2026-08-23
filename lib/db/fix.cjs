const { Client } = require('pg'); 
const client = new Client('postgresql://neondb_owner:npg_Df1hEg8xIlsW@ep-lingering-resonance-aya9r8md-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require'); 
async function migrate() { 
  await client.connect(); 
  try { 
    await client.query('DROP TABLE IF EXISTS support_tickets'); 
    await client.query('DROP TYPE IF EXISTS ticket_status'); 
    await client.query("CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Terminated')"); 
    await client.query('CREATE TABLE support_tickets (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL, message TEXT NOT NULL, reply TEXT, assigned_to INTEGER REFERENCES users(id), status ticket_status DEFAULT \'Open\' NOT NULL, created_at TIMESTAMP DEFAULT NOW() NOT NULL)'); 
    console.log('Fixed support_tickets'); 
  } catch(e) { 
    console.log(e.message); 
  } 
  process.exit(0); 
} 
migrate();
