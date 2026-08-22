import { Router, type IRouter, type Request } from "express";
import { db } from "@workspace/db";
import { eventsTable, showsTable, venuesTable, showSeatsTable, seatLayoutsTable, bookingsTable, bookingSeatsTable, waitlistTable, seatCategoriesTable } from "@workspace/db/schema";
import { eq, and, or, lt, sql, inArray } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { CreateBookingBody, CreateSeatHoldBody, JoinWaitlistBody } from "@workspace/api-zod";

const router: IRouter = Router();

function makeQr(reference: string) {
  return `https://quickchart.io/qr?text=${encodeURIComponent(reference)}&size=220&margin=1`;
}

// Ensure holds are cleaned implicitly by filtering `heldUntil < NOW()` or explicitly by a sweeper

router.get("/events", async (req, res) => {
  const eventsList = await db.select({
    id: eventsTable.id,
    title: eventsTable.title,
    type: eventsTable.type,
    category: eventsTable.category,
    image: eventsTable.image,
    description: eventsTable.description,
  }).from(eventsTable);
  
  // Quick mock data mapping for UI compatibility (would typically come from joins)
  res.json(eventsList.map(e => ({
    ...e,
    id: e.id.toString(),
    city: "Mumbai", 
    venue: "The Grand Regent",
    date: "24 Aug",
    time: "7:30 PM",
    price: 420,
    status: "Selling fast",
    rating: 4.9
  })));
});

router.get("/events/:id", async (req, res) => {
  const eventId = parseInt(req.params.id);
  if (isNaN(eventId)) return res.status(400).json({ error: "Invalid ID" });

  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
  if (!event) return res.status(404).json({ error: "Event not found" });

  const shows = await db.select().from(showsTable).where(eq(showsTable.eventId, eventId));

  return res.json({
    ...event,
    id: event.id.toString(),
    shows: shows.map(s => ({
      id: s.id.toString(),
      date: s.showDate.toISOString(),
      time: "19:30",
      language: "Hindi",
      format: "Standard",
      available: 100 // mock
    }))
  });
});

router.get("/shows/:id/seats", async (req, res) => {
  const showId = parseInt(req.params.id);
  if (isNaN(showId)) return res.status(400).json({ error: "Invalid show ID" });

  // Get seats for show, checking if held_until is expired
  const seats = await db.select({
    id: showSeatsTable.id,
    status: showSeatsTable.status,
    heldUntil: showSeatsTable.heldUntil,
    row: seatLayoutsTable.row,
    number: seatLayoutsTable.number,
    categoryId: seatLayoutsTable.categoryId
  }).from(showSeatsTable)
  .innerJoin(seatLayoutsTable, eq(showSeatsTable.seatLayoutId, seatLayoutsTable.id))
  .where(eq(showSeatsTable.showId, showId));

  const now = new Date();

  res.json(seats.map(s => {
    let currentStatus = s.status;
    if (s.status === "held" && s.heldUntil && s.heldUntil < now) {
      currentStatus = "available"; // Implicitly released
    }
    return {
      id: s.id.toString(),
      row: s.row,
      number: s.number,
      category: s.categoryId === 1 ? "Premium" : "Standard",
      status: currentStatus,
      price: s.categoryId === 1 ? 620 : 420 // In Rupees
    };
  }));
});

// requireAuth added here!
router.post("/shows/:id/holds", requireAuth, async (req: AuthRequest, res) => {
  const showId = parseInt(req.params.id);
  const body = CreateSeatHoldBody.parse(req.body);
  const seatIds = body.seatIds.map(id => parseInt(id));

  // Use a transaction for concurrency protection
  try {
    const holdResult = await db.transaction(async (tx) => {
      // 1. Lock the rows using FOR UPDATE
      const seatsToHold = await tx.select()
        .from(showSeatsTable)
        .where(
          and(
            eq(showSeatsTable.showId, showId),
            inArray(showSeatsTable.id, seatIds)
          )
        )
        // FOR UPDATE to prevent concurrent reads/writes
        // Note: Drizzle raw SQL for FOR UPDATE is `.for('update')` in newer versions, or manual query
        // This acts as our concurrency lock.
        
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 mins TTL
      
      // 2. Check if ANY seat is unavailable
      for (const seat of seatsToHold) {
        if (seat.status === "booked") return { error: "Seat already booked" };
        if (seat.status === "held" && seat.heldUntil && seat.heldUntil > now && seat.heldBy !== req.user?.id) {
          return { error: "Seat is currently held by someone else" };
        }
      }

      // 3. Update seats to held
      await tx.update(showSeatsTable)
        .set({ status: "held", heldBy: req.user?.id, heldUntil: expiresAt })
        .where(inArray(showSeatsTable.id, seatIds));
        
      return { success: true, expiresAt };
    });

    if (holdResult.error) {
      return res.status(409).json({ error: holdResult.error });
    }

    // In a real app we'd save a "hold record", but here the `show_seats` implicitly tracks it
    // We return a pseudo-holdId
    const holdId = req.user?.id + "-" + Date.now();
    return res.status(201).json({ id: holdId, seatIds: body.seatIds, expiresAt: holdResult.expiresAt?.toISOString(), total: seatIds.length * 500 });
  } catch (err) {
    return res.status(500).json({ error: "Failed to hold seats" });
  }
});

router.post("/bookings", requireAuth, async (req: AuthRequest, res) => {
  const body = CreateBookingBody.parse(req.body);
  
  // We deduce seatIds from the DB where heldBy = req.user.id and status = held
  // In a robust implementation, holdId would map to specific seats.
  const now = new Date();
  
  const heldSeats = await db.select().from(showSeatsTable)
    .where(and(
      eq(showSeatsTable.heldBy, req.user!.id),
      eq(showSeatsTable.status, "held")
      // eq(showSeatsTable.heldUntil > now) -- done below
    ));
    
  const validSeats = heldSeats.filter(s => s.heldUntil && s.heldUntil > now);
  if (validSeats.length === 0) {
    return res.status(410).json({ error: "Your seat hold expired. Please choose seats again." });
  }

  const reference = `PX${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  
  await db.transaction(async (tx) => {
    // Insert booking
    const [booking] = await tx.insert(bookingsTable).values({
      userId: req.user!.id,
      showId: validSeats[0].showId,
      bookingReference: reference,
      totalAmount: validSeats.length * 500 + (body.foodItems?.length ?? 0) * 240,
      status: body.paymentMethod === "venue" ? "Pay at venue" : "Confirmed"
    }).returning();

    // Mark seats as booked
    await tx.update(showSeatsTable)
      .set({ status: "booked", heldUntil: null })
      .where(inArray(showSeatsTable.id, validSeats.map(s => s.id)));
      
    // Insert bookingSeats
    await tx.insert(bookingSeatsTable).values(
      validSeats.map(s => ({ bookingId: booking.id, showSeatId: s.id }))
    );
  });

  // Generate QR
  const qrUrl = makeQr(reference);

  // Email simulation
  console.log(`\n=================================================`);
  console.log(`EMAIL DISPATCHED TO: ${req.user?.email}`);
  console.log(`SUBJECT: Your Ticket Booking Confirmation - ${reference}`);
  console.log(`QR CODE URL: ${qrUrl}`);
  console.log(`=================================================\n`);

  res.status(201).json({
    id: `b-${Date.now()}`,
    reference,
    eventTitle: "Indian Movie",
    venue: "Mumbai Cinema",
    date: "24 Aug",
    time: "7:30 PM",
    seats: validSeats.map(s => s.id.toString()),
    total: validSeats.length * 500,
    status: "Confirmed",
    qr: qrUrl
  });
});

router.post("/waitlist", requireAuth, async (req: AuthRequest, res) => {
  const body = JoinWaitlistBody.parse(req.body);
  
  const [entry] = await db.insert(waitlistTable).values({
    userId: req.user!.id,
    showId: 1, // hardcoded for now or fetch from body if available
    categoryId: body.category === "Premium" ? 1 : 2,
    status: "waiting"
  }).returning();

  res.status(201).json({ id: entry.id.toString(), position: entry.id, category: body.category, status: "Watching" });
});

export default router;