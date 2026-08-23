const fs = require('fs');

let file = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

// Replace the hardcoded price in POST /bookings
const oldTransaction = `
    await db.transaction(async (tx) => {
      // Insert booking
      const [booking] = await tx.insert(bookingsTable).values({
        userId: req.user!.id,
        showId: validSeats[0].showId,
        bookingReference: reference,
        totalAmount: validSeats.length * 500 + (body.foodItems?.length ?? 0) * 240,
        status: body.paymentMethod === "venue" ? "Pay at venue" : "Confirmed"
      }).returning();
`;

const newTransaction = `
    await db.transaction(async (tx) => {
      // Fetch real price
      const pricing = await tx.select().from(showPricingTable).where(eq(showPricingTable.showId, validSeats[0].showId));
      const seatPrice = pricing.length > 0 ? pricing[0].price : 500;

      // Insert booking
      const [booking] = await tx.insert(bookingsTable).values({
        userId: req.user!.id,
        showId: validSeats[0].showId,
        bookingReference: reference,
        totalAmount: validSeats.length * seatPrice + (body.foodItems?.length ?? 0) * 240,
        status: body.paymentMethod === "venue" ? "Pay at venue" : "Confirmed"
      }).returning();
`;

file = file.replace(oldTransaction, newTransaction);
file = file.replace(
  'import { eventsTable, showsTable, venuesTable, showSeatsTable, seatLayoutsTable, bookingsTable, bookingSeatsTable, waitlistTable, seatCategoriesTable } from "@workspace/db/schema";',
  'import { eventsTable, showsTable, venuesTable, showSeatsTable, seatLayoutsTable, bookingsTable, bookingSeatsTable, waitlistTable, seatCategoriesTable, showPricingTable } from "@workspace/db/schema";'
)

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', file);
console.log("Price patched!");
