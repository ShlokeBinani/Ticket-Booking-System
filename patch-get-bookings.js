const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

const getBookingsCode = `
router.get("/bookings", requireAuth, async (req: AuthRequest, res) => {
  const userBookings = await db.select().from(bookingsTable).where(eq(bookingsTable.userId, req.user!.id)).orderBy(desc(bookingsTable.createdAt));
  
  const response = [];
  for (const b of userBookings) {
    // Get seats
    const seatRels = await db.select().from(bookingSeatsTable).where(eq(bookingSeatsTable.bookingId, b.id));
    const seatIds = seatRels.map(r => r.showSeatId.toString());
    
    // Get show and event for details
    const showInfo = await db.select().from(showsTable).where(eq(showsTable.id, b.showId));
    if (!showInfo.length) continue;
    const show = showInfo[0];
    
    const eventInfo = await db.select().from(eventsTable).where(eq(eventsTable.id, show.eventId));
    if (!eventInfo.length) continue;
    const event = eventInfo[0];
    
    response.push({
      id: b.id.toString(),
      reference: b.bookingReference,
      eventTitle: event.title,
      venue: event.venue,
      date: show.date,
      time: show.time,
      seats: seatIds,
      total: b.totalAmount,
      status: b.status,
      qr: makeQr(b.bookingReference)
    });
  }
  
  res.json(response);
});
`;

content = content.replace(
  'router.post("/bookings",',
  getBookingsCode + '\nrouter.post("/bookings",'
);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', content);
console.log("Added GET /bookings");
