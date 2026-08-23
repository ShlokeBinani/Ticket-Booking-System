"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const index_js_1 = require("./schema/index.js");
const drizzle_orm_1 = require("drizzle-orm");
const schema = require("./schema/index.js");
const dotenv = require("dotenv");
const bcryptjs_1 = require("bcryptjs");
dotenv.config({ path: '../../.env' });
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});
const db = (0, node_postgres_1.drizzle)(pool, { schema });
async function seed() {
    console.log("Seeding database...");
    // 1. Ensure we have an admin user and an organiser user
    let [admin] = await db.select().from(index_js_1.usersTable).where((0, drizzle_orm_1.eq)(index_js_1.usersTable.email, 'admin@paradox.com'));
    if (!admin) {
        const hash = await bcryptjs_1.default.hash('password123', 10);
        [admin] = await db.insert(index_js_1.usersTable).values({
            email: 'admin@paradox.com',
            name: 'Paradox Admin',
            passwordHash: hash,
            role: 'admin'
        }).returning();
    }
    let [organiser] = await db.select().from(index_js_1.usersTable).where((0, drizzle_orm_1.eq)(index_js_1.usersTable.email, 'organiser@paradox.com'));
    if (!organiser) {
        const hash = await bcryptjs_1.default.hash('password123', 10);
        [organiser] = await db.insert(index_js_1.usersTable).values({
            email: 'organiser@paradox.com',
            name: 'Paradox Organiser',
            passwordHash: hash,
            role: 'organiser'
        }).returning();
    }
    // 2. Venues
    const venuesData = [
        { name: "Jio World Drive", city: "Mumbai", address: "Bandra Kurla Complex", capacity: 72 },
        { name: "JLN Stadium", city: "Delhi", address: "Pragati Vihar", capacity: 72 },
        { name: "KTPO", city: "Bangalore", address: "Whitefield", capacity: 72 }
    ];
    const venues = [];
    for (const v of venuesData) {
        let [venue] = await db.select().from(index_js_1.venuesTable).where((0, drizzle_orm_1.eq)(index_js_1.venuesTable.name, v.name));
        if (!venue) {
            [venue] = await db.insert(index_js_1.venuesTable).values(v).returning();
        }
        venues.push(venue);
    }
    // 3. Categories and Layouts for venues
    for (const venue of venues) {
        let [premiumCat] = await db.select().from(index_js_1.seatCategoriesTable).where((0, drizzle_orm_1.eq)(index_js_1.seatCategoriesTable.venueId, venue.id));
        if (!premiumCat) {
            [premiumCat] = await db.insert(index_js_1.seatCategoriesTable).values({ venueId: venue.id, name: 'Premium' }).returning();
            const [standardCat] = await db.insert(index_js_1.seatCategoriesTable).values({ venueId: venue.id, name: 'Standard' }).returning();
            const layouts = [];
            const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
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
            await db.insert(index_js_1.seatLayoutsTable).values(layouts);
        }
    }
    // 4. Events
    const eventsData = [
        { title: 'Arijit Singh Live', type: 'concert', category: 'Music', description: 'Experience the magic.', image: 'https://images.unsplash.com/photo-1540039155732-d688126b8b0b?q=80&w=800&auto=format&fit=crop', rating: 5 },
        { title: 'Diljit Dosanjh: Dil-Luminati', type: 'concert', category: 'Music', description: 'The biggest tour of the year.', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop', rating: 5 },
    ];
    for (const e of eventsData) {
        let [event] = await db.select().from(index_js_1.eventsTable).where((0, drizzle_orm_1.eq)(index_js_1.eventsTable.title, e.title));
        if (!event) {
            [event] = await db.insert(index_js_1.eventsTable).values({
                ...e,
                organiserId: organiser.id
            }).returning();
            const targetVenue = e.title.includes('Arijit') ? venues[0] : venues[1];
            // Create a show
            await db.insert(index_js_1.showsTable).values({
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
