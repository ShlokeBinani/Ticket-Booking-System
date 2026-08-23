const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Df1hEg8xIlsW@ep-lingering-resonance-aya9r8md-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require' });

async function seed() {
  console.log("Starting DB Seed...");
  
  const res1 = await pool.query(`INSERT INTO users (email, name, role, password_hash) VALUES ('organiser@demo.com', 'Demo Organiser', 'organiser', 'hash') ON CONFLICT (email) DO UPDATE SET role = 'organiser' RETURNING id`);
  const orgId = res1.rows[0].id;

  const venues = [
    { name: 'Jio World Drive', city: 'Mumbai', address: 'BKC, Mumbai' },
    { name: 'JLN Stadium', city: 'Delhi', address: 'Lodhi Road' },
    { name: 'PVR IMAX', city: 'Mumbai', address: 'Lower Parel' },
    { name: 'Inox Megaplex', city: 'Bangalore', address: 'MG Road' },
  ];
  
  const venueIds = [];
  for (const v of venues) {
    const vres = await pool.query(`INSERT INTO venues (name, city, address) VALUES ($1, $2, $3) RETURNING id`, [v.name, v.city, v.address]);
    const vid = vres.rows[0].id;
    venueIds.push(vid);
    
    // Create categories
    const cat1 = await pool.query(`INSERT INTO seat_categories (venue_id, name) VALUES ($1, 'Premium') RETURNING id`, [vid]);
    const cat2 = await pool.query(`INSERT INTO seat_categories (venue_id, name) VALUES ($1, 'Standard') RETURNING id`, [vid]);
    const c1 = cat1.rows[0].id;
    const c2 = cat2.rows[0].id;
    
    // Create layout
    let layoutInsert = 'INSERT INTO seat_layouts (venue_id, category_id, row, number) VALUES ';
    const vals = [];
    const rows = ['A','B','C','D','E','F','G','H','I','J'];
    for (let r=0; r<10; r++) {
      for (let c=1; c<=12; c++) {
        const cat = (r < 3) ? c1 : c2;
        vals.push(`(${vid}, ${cat}, '${rows[r]}', ${c})`);
      }
    }
    await pool.query(layoutInsert + vals.join(','));
  }

  const eventsList = [
    { title: 'Arijit Singh Live', type: 'concert', category: 'Music', city: 'Mumbai', venueId: venueIds[0], price: 2500, image: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Arijit_Singh_performance_at_Chandigarh_2025.jpg' },
    { title: 'Diljit Dosanjh: Dil-Luminati', type: 'concert', category: 'Music', city: 'Delhi', venueId: venueIds[1], price: 3999, image: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Diljit_Dosanjh.jpg' },
    { title: 'Jawan', type: 'movie', category: 'Cinema', city: 'Mumbai', venueId: venueIds[2], price: 450, image: 'https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg' },
    { title: 'Kalki 2898 AD', type: 'movie', category: 'Cinema', city: 'Bangalore', venueId: venueIds[3], price: 350, image: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg' }
  ];

  for (const e of eventsList) {
    const eRes = await pool.query(`INSERT INTO events (organiser_id, title, type, category, image) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [orgId, e.title, e.type, e.category, e.image]);
    const eventId = eRes.rows[0].id;
    
    const sRes = await pool.query(`INSERT INTO shows (event_id, venue_id, show_date) VALUES ($1, $2, NOW() + INTERVAL '30 days') RETURNING id`, [eventId, e.venueId]);
    const showId = sRes.rows[0].id;

    // Get the layouts
    const layouts = await pool.query(`SELECT id FROM seat_layouts WHERE venue_id = $1`, [e.venueId]);
    
    let seatInsert = 'INSERT INTO show_seats (show_id, seat_layout_id, status) VALUES ';
    const vals = [];
    for (const row of layouts.rows) {
      vals.push(`(${showId}, ${row.id}, 'available')`);
    }
    await pool.query(seatInsert + vals.join(','));
  }

  console.log("DB Seed complete!");
  process.exit(0);
}

seed().catch(err => console.error(err));
