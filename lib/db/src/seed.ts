import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import { 
  venuesTable, seatCategoriesTable, seatLayoutsTable, 
  usersTable, eventsTable, showsTable 
} from './schema/index.js';
import * as schema from './schema/index.js';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '../../.env' });
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log("Seeding database...");

  // 1. Ensure we have an admin user and an organiser user
  let [admin] = await db.select().from(usersTable).where(schema.eq(usersTable.email, 'admin@paradox.com'));
  if (!admin) {
    const hash = await bcrypt.hash('password123', 10);
    [admin] = await db.insert(usersTable).values({
      email: 'admin@paradox.com',
      name: 'Paradox Admin',
      passwordHash: hash,
      role: 'admin'
    }).returning();
  }

  let [organiser] = await db.select().from(usersTable).where(schema.eq(usersTable.email, 'organiser@paradox.com'));
  if (!organiser) {
    const hash = await bcrypt.hash('password123', 10);
    [organiser] = await db.insert(usersTable).values({
      email: 'organiser@paradox.com',
      name: 'Paradox Organiser',
      passwordHash: hash,
      role: 'organiser'
    }).returning();
  }

  // 2. Venues
  const venuesData = [
    { name: "Jio World Drive", city: "Mumbai", address: "Bandra Kurla Complex", capacity: 120 },
    { name: "JLN Stadium", city: "Delhi", address: "Pragati Vihar", capacity: 120 },
    { name: "KTPO", city: "Bangalore", address: "Whitefield", capacity: 120 }
  ];

  const venues = [];
  for (const v of venuesData) {
    let [venue] = await db.select().from(venuesTable).where(schema.eq(venuesTable.name, v.name));
    if (!venue) {
      [venue] = await db.insert(venuesTable).values(v).returning();
    }
    venues.push(venue);
  }

  // 3. Categories and Layouts for venues
  for (const venue of venues) {
    let [premiumCat] = await db.select().from(seatCategoriesTable).where(schema.eq(seatCategoriesTable.venueId, venue.id));
    if (!premiumCat) {
      [premiumCat] = await db.insert(seatCategoriesTable).values({ venueId: venue.id, name: 'Premium' }).returning();
      const [standardCat] = await db.insert(seatCategoriesTable).values({ venueId: venue.id, name: 'Standard' }).returning();

      const layouts = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      
      for (const row of rows) {
        for (let i = 1; i <= 12; i++) {
          layouts.push({
            venueId: venue.id,
            categoryId: (row === 'A' || row === 'B') ? premiumCat.id : standardCat.id,
            row: row,
            number: i
          });
        }
      }
      await db.insert(seatLayoutsTable).values(layouts);
    }
  }

  // 4. Events
  const eventsData = [
    { title: 'Arijit Singh Live', type: 'concert', category: 'Music', description: 'Experience the magic.', image: 'https://images.unsplash.com/photo-1540039155732-d688126b8b0b?q=80&w=800&auto=format&fit=crop', rating: 5 },
    { title: 'Diljit Dosanjh: Dil-Luminati', type: 'concert', category: 'Music', description: 'The biggest tour of the year.', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop', rating: 5 },
  ];

  for (const e of eventsData) {
    let [event] = await db.select().from(eventsTable).where(schema.eq(eventsTable.title, e.title));
    if (!event) {
      [event] = await db.insert(eventsTable).values({
        ...e,
        organiserId: organiser.id
      }).returning();
      
      const targetVenue = e.title.includes('Arijit') ? venues[0] : venues[1];
      
      // Create a show
      await db.insert(showsTable).values({
        eventId: event.id,
        venueId: targetVenue.id,
        showDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
