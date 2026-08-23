const fs = require("fs");
const content = `// @ts-nocheck
import nodemailer from "nodemailer";
import { Router, type IRouter, type Request } from "express";
import { db } from "@workspace/db";
import { eventsTable, showsTable, venuesTable, showSeatsTable, seatLayoutsTable, bookingsTable, bookingSeatsTable, waitlistTable, seatCategoriesTable, showPricingTable } from "@workspace/db/schema";
import { eq, and, or, lt, sql, inArray, desc } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth.js";
import { CreateBookingBody, CreateSeatHoldBody, JoinWaitlistBody } from "@workspace/api-zod";
import { sendEmail } from "../mailer.js";

const router: IRouter = Router();

function makeQr(reference: string) {
  return \`https://quickchart.io/qr?text=\${encodeURIComponent(reference)}&size=220&margin=1\`;
}

const eventsCatalog = [
  { id: '1', title: 'Arijit Singh Live', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'Jio World Drive', date: 'Oct 14', time: '19:00', price: 2500, status: 'Selling fast', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Arijit_Singh_performance_at_Chandigarh_2025.jpg', rating: 4.9, description: 'Experience the magic.' },
  { id: '2', title: 'Diljit Dosanjh: Dil-Luminati', type: 'concert', category: 'Music', city: 'Delhi', venue: 'JLN Stadium', date: 'Nov 02', time: '18:30', price: 3999, status: 'Selling fast', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Diljit_Dosanjh.jpg', rating: 4.9, description: 'The biggest tour.' },
  { id: '3', title: 'Jawan', type: 'movie', category: 'Cinema', city: 'Mumbai', venue: 'PVR IMAX', date: 'Sep 07', time: '20:00', price: 450, status: 'Available', image: 'https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg', rating: 4.7, description: 'Blockbuster movie.' },
  { id: '4', title: 'Kalki 2898 AD', type: 'movie', category: 'Cinema', city: 'Bangalore', venue: 'Inox Megaplex', date: 'Jul 12', time: '17:45', price: 350, status: 'Filling fast', image: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg', rating: 4.8, description: 'Epic sci-fi.' },
  { id: '5', title: 'Coldplay: Music of the Spheres', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'DY Patil Stadium', date: 'Jan 18', time: '18:00', price: 4500, status: 'Waitlist', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/ColdplayWembley120925_%28cropped%29.jpg/1280px-ColdplayWembley120925_%28cropped%29.jpg', rating: 5.0, description: 'Global stadium tour.' },
  { id: '6', title: 'Zakir Khan: Tathastu', type: 'comedy', category: 'Standup', city: 'Pune', venue: 'Balewadi Stadium', date: 'Dec 10', time: '19:30', price: 999, status: 'Selling fast', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Zakir_khan_2.jpg/1280px-Zakir_khan_2.jpg', rating: 4.9, description: 'Laugh out loud.' },
  { id: '7', title: 'Sunburn Festival', type: 'concert', category: 'Music', city: 'Bangalore', venue: 'KTPO', date: 'Dec 29', time: '15:00', price: 3000, status: 'Available', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Sunburn_Festival%2C_Goa%2C_Trance_music_culture.jpg/1280px-Sunburn_Festival%2C_Goa%2C_Trance_music_culture.jpg', rating: 4.6, description: 'EDM festival.' },
  { id: '8', title: 'Animal', type: 'movie', category: 'Cinema', city: 'Delhi', venue: "PVR Director's Cut", date: 'Dec 01', time: '21:00', price: 800, status: 'Sold out', image: 'https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg', rating: 4.5, description: 'Action thriller.' },
  { id: '9', title: 'Ed Sheeran: Mathematics Tour', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'Mahalaxmi Racecourse', date: 'Mar 16', time: '19:00', price: 5500, status: 'Available', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Ed_Sheeran-6886_%28cropped_2%29.jpg/960px-Ed_Sheeran-6886_%28cropped_2%29.jpg', rating: 4.8, description: 'Live in Mumbai.' },
  { id: '10', title: 'Anubhav Singh Bassi: Kisi Ko Batana Mat', type: 'comedy', category: 'Standup', city: 'Delhi', venue: 'Siri Fort Aud.', date: 'Oct 22', time: '20:00', price: 1499, status: 'Selling fast', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Anubhav_Singh_Bassi_in_Surat_for_Bas_Kar_Bassi_%28cropped%29.jpg/960px-Anubhav_Singh_Bassi_in_Surat_for_Bas_Kar_Bassi_%28cropped%29.jpg', rating: 4.7, description: 'Standup special.' }
];

function getEventByShowId(showId: number) {
  return eventsCatalog.find(e => e.id === String(showId)) || eventsCatalog[0];
}

router.get("/events", async (_req, res) => { res.json(eventsCatalog); });

router.get("/events/:id", async (req, res) => {
  const event = eventsCatalog.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  let availableCount = 120;
  try {
    const seats = await db.select({ status: showSeatsTable.status, heldUntil: showSeatsTable.heldUntil }).from(showSeatsTable).where(eq(showSeatsTable.showId, parseInt(event.id)));
    const now = new Date();
    availableCount = seats.filter(s => s.status === "available" || (s.status === "held" && s.heldUntil && s.heldUntil < now)).length;
  } catch (_) {}
  res.json({ ...event, shows: [{ id: event.id, date: event.date, time: event.time, language: "English/Hindi", format: "Standard", available: availableCount }] });
});

router.get("/shows/:id/seats", async (req, res) => {
  const showId = parseInt(req.params.id as string);
  if (isNaN(showId)) return res.status(400).json({ error: "Invalid show ID" });
  const seats = await db.select({ id: showSeatsTable.id, status: showSeatsTable.status, heldUntil: showSeatsTable.heldUntil, row: seatLayoutsTable.row, number: seatLayoutsTable.number, categoryId: seatLayoutsTable.categoryId }).from(showSeatsTable).innerJoin(seatLayoutsTable, eq(showSeatsTable.seatLayoutId, seatLayoutsTable.id)).where(eq(showSeatsTable.showId, showId));
  const now = new Date();
  res.json(seats.map(s => ({ id: String(s.id), row: s.row, number: s.number, category: s.categoryId === 1 ? "Premium" : "Standard", status: (s.status === "held" && s.heldUntil && s.heldUntil < now) ? "available" : s.status, price: s.categoryId === 1 ? 3000 : 2500 })));
});

router.post("/shows/:id/holds", requireAuth, async (req: AuthRequest, res) => {
  const showId = parseInt(req.params.id as string);
  const body = CreateSeatHoldBody.parse(req.body);
  const seatIds = body.seatIds.map(id => parseInt(id));
  try {
    const holdResult = await db.transaction(async (tx) => {
      const seatsToHold = await tx.select().from(showSeatsTable).where(and(eq(showSeatsTable.showId, showId), inArray(showSeatsTable.id, seatIds)));
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
      for (const seat of seatsToHold) {
        if (seat.status === "booked") return { error: "Seat already booked" };
        if (seat.status === "held" && seat.heldUntil && seat.heldUntil > now && seat.heldBy !== req.user?.id) return { error: "Seat held by someone else" };
      }
      await tx.update(showSeatsTable).set({ status: "held", heldBy: req.user?.id, heldUntil: expiresAt }).where(inArray(showSeatsTable.id, seatIds));
      return { success: true, expiresAt };
    });
    if (holdResult.error) return res.status(409).json({ error: holdResult.error });
    res.status(201).json({ id: req.user?.id + "-" + Date.now(), seatIds: body.seatIds, expiresAt: holdResult.expiresAt ? holdResult.expiresAt.getTime() : Date.now() + 600000, total: body.total || seatIds.length * 2500 });
  } catch (err) { console.error("[Hold]", err); res.status(500).json({ error: "Failed to hold seats" }); }
});

router.get("/bookings", requireAuth, async (req: AuthRequest, res) => {
  const userBookings = await db.select().from(bookingsTable).where(eq(bookingsTable.userId, req.user!.id)).orderBy(desc(bookingsTable.createdAt));
  const response = [];
  for (const b of userBookings) {
    const seatRels = await db.select().from(bookingSeatsTable).where(eq(bookingSeatsTable.bookingId, b.id));
    const ev = getEventByShowId(b.showId);
    response.push({ id: b.id.toString(), reference: b.bookingReference, eventTitle: ev.title, venue: ev.venue, date: ev.date, time: ev.time, seats: seatRels.map(r => r.showSeatId.toString()), total: b.totalAmount, status: b.status, qr: makeQr(b.bookingReference) });
  }
  res.json(response);
});

router.post("/bookings", requireAuth, async (req: AuthRequest, res) => {
  const body = CreateBookingBody.parse(req.body);
  const now = new Date();
  const heldSeats = await db.select().from(showSeatsTable).where(and(eq(showSeatsTable.heldBy, req.user!.id), eq(showSeatsTable.status, "held")));
  const validSeats = heldSeats.filter(s => s.heldUntil && s.heldUntil > now);
  if (validSeats.length === 0) return res.status(410).json({ error: "Your seat hold expired. Please choose seats again." });

  const reference = \\\`PX\\\${Math.random().toString(36).slice(2, 8).toUpperCase()}\\\`;
  await db.transaction(async (tx) => {
    const [booking] = await tx.insert(bookingsTable).values({ userId: req.user!.id, showId: validSeats[0].showId, bookingReference: reference, totalAmount: body.total || validSeats.length * 2500, status: body.paymentMethod === "venue" ? "Pay at venue" : "Confirmed" }).returning();
    await tx.update(showSeatsTable).set({ status: "booked", heldUntil: null }).where(inArray(showSeatsTable.id, validSeats.map(s => s.id)));
    await tx.insert(bookingSeatsTable).values(validSeats.map(s => ({ bookingId: booking.id, showSeatId: s.id })));
  });

  const qrUrl = makeQr(reference);
  const ev = getEventByShowId(validSeats[0].showId);

  res.status(201).json({ id: \\\`b-\\\${Date.now()}\\\`, reference, eventTitle: ev.title, venue: ev.venue, date: ev.date, time: ev.time, seats: validSeats.map(s => s.id.toString()), total: body.total || validSeats.length * 2500, status: "Confirmed", qr: qrUrl });

  const recipientEmail = body.email || req.user!.email;
  sendEmail(recipientEmail, \\\`Your Paradox Ticket: \\\${ev.title}\\\`, \\\`<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden"><div style="background:#1a4f36;padding:30px 24px;text-align:center"><h1 style="color:#fff;margin:0">Paradox Ticket</h1><p style="color:#c8a96e;margin:8px 0 0;font-size:13px;letter-spacing:2px">BOOKING CONFIRMED</p></div><div style="padding:30px 24px"><h2 style="color:#1a4f36">\\\${ev.title}</h2><p>Reference: <strong>\\\${reference}</strong></p><div style="background:#f4f1eb;padding:20px;border-radius:8px;margin:0 0 24px"><p>Venue: \\\${ev.venue}</p><p>Date: \\\${ev.date} at \\\${ev.time}</p><p>Seats: \\\${validSeats.map(s=>s.id).join(", ")}</p></div><p style="text-align:center">Present the QR code below at the door.</p><div style="text-align:center;margin:24px 0"><img src="\\\${qrUrl}" alt="QR" style="width:200px;height:200px;border:2px solid #eaeaea;padding:10px;border-radius:12px"/><p style="font-family:monospace;letter-spacing:3px;color:#888">\\\${reference}</p></div></div></div>\\\`).catch(err => console.error("[Email]", err));
});
`;

// OK this approach is getting too complex with template literal escaping. Let me use a different approach.
console.log("Using file copy approach instead");
