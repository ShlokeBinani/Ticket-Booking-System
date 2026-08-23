const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Df1hEg8xIlsW@ep-lingering-resonance-aya9r8md-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require' });

async function seed() {
  console.log("Seeding remaining 6 events...");
  
  const orgIdRes = await pool.query(`SELECT id FROM users WHERE email='organiser@demo.com' LIMIT 1`);
  const orgId = orgIdRes.rows[0].id;

  const venues = [
    { name: 'DY Patil Stadium', city: 'Mumbai', address: 'Navi Mumbai' },
    { name: 'Balewadi Stadium', city: 'Pune', address: 'Balewadi' },
    { name: 'KTPO', city: 'Bangalore', address: 'Whitefield' },
    { name: 'PVR Director\'s Cut', city: 'Delhi', address: 'Vasant Kunj' },
    { name: 'Mahalaxmi Racecourse', city: 'Mumbai', address: 'Mahalaxmi' },
    { name: 'Siri Fort Aud.', city: 'Delhi', address: 'August Kranti Marg' },
  ];
  
  const venueIds = [];
  for (const v of venues) {
    const vres = await pool.query(`INSERT INTO venues (name, city, address) VALUES ($1, $2, $3) RETURNING id`, [v.name, v.city, v.address]);
    const vid = vres.rows[0].id;
    venueIds.push(vid);
    
    const cat1 = await pool.query(`INSERT INTO seat_categories (venue_id, name) VALUES ($1, 'Premium') RETURNING id`, [vid]);
    const cat2 = await pool.query(`INSERT INTO seat_categories (venue_id, name) VALUES ($1, 'Standard') RETURNING id`, [vid]);
    const c1 = cat1.rows[0].id;
    const c2 = cat2.rows[0].id;
    
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
    { title: 'Coldplay: Music of the Spheres', type: 'concert', category: 'Music', city: 'Mumbai', venueId: venueIds[0], price: 4500, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/ColdplayWembley120925_%28cropped%29.jpg/1280px-ColdplayWembley120925_%28cropped%29.jpg' },
    { title: 'Zakir Khan: Tathastu', type: 'comedy', category: 'Standup', city: 'Pune', venueId: venueIds[1], price: 999, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Zakir_khan_2.jpg/1280px-Zakir_khan_2.jpg' },
    { title: 'Sunburn Festival', type: 'concert', category: 'Music', city: 'Bangalore', venueId: venueIds[2], price: 3000, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Sunburn_Festival%2C_Goa%2C_Trance_music_culture.jpg/1280px-Sunburn_Festival%2C_Goa%2C_Trance_music_culture.jpg' },
    { title: 'Animal', type: 'movie', category: 'Cinema', city: 'Delhi', venueId: venueIds[3], price: 800, image: 'https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg' },
    { title: 'Ed Sheeran: Mathematics Tour', type: 'concert', category: 'Music', city: 'Mumbai', venueId: venueIds[4], price: 5500, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Ed_Sheeran-6886_%28cropped_2%29.jpg/960px-Ed_Sheeran-6886_%28cropped_2%29.jpg' },
    { title: 'Anubhav Singh Bassi: Kisi Ko Batana Mat', type: 'comedy', category: 'Standup', city: 'Delhi', venueId: venueIds[5], price: 1499, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Anubhav_Singh_Bassi_in_Surat_for_Bas_Kar_Bassi_%28cropped%29.jpg/960px-Anubhav_Singh_Bassi_in_Surat_for_Bas_Kar_Bassi_%28cropped%29.jpg' }
  ];

  for (const e of eventsList) {
    const eRes = await pool.query(`INSERT INTO events (organiser_id, title, type, category, image) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [orgId, e.title, e.type, e.category, e.image]);
    const eventId = eRes.rows[0].id;
    
    const sRes = await pool.query(`INSERT INTO shows (event_id, venue_id, show_date) VALUES ($1, $2, NOW() + INTERVAL '30 days') RETURNING id`, [eventId, e.venueId]);
    const showId = sRes.rows[0].id;

    const layouts = await pool.query(`SELECT id FROM seat_layouts WHERE venue_id = $1`, [e.venueId]);
    
    let seatInsert = 'INSERT INTO show_seats (show_id, seat_layout_id, status) VALUES ';
    const vals = [];
    for (const row of layouts.rows) {
      vals.push(`(${showId}, ${row.id}, 'available')`);
    }
    await pool.query(seatInsert + vals.join(','));
  }

  console.log("Seeding complete!");
  process.exit(0);
}
seed().catch(console.error);
