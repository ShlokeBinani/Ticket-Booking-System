import { Router, type IRouter, type Request } from "express";
import {
  CreateBookingBody,
  CreateSeatHoldBody,
  CreateSupportRequestBody,
  GetShowSeatsParams,
  JoinWaitlistBody,
  ListEventsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

type EventRecord = {
  id: string; title: string; type: string; city: string; venue: string;
  date: string; time: string; price: number; image: string; status: string;
  category: string; rating: number; description: string;
};

const events: EventRecord[] = [
  {
    id: "midnight-paris", title: "Midnight in Paris", type: "Movie", city: "Mumbai",
    venue: "The Grand Regent", date: "24 Aug", time: "7:30 PM", price: 420,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=85",
    status: "Selling fast", category: "Cinema", rating: 4.9,
    description: "A restored 35mm screening beneath the chandeliers. Come early for the live score and stay for the city after dark.",
  },
  {
    id: "echoes-live", title: "Echoes / Live", type: "Concert", city: "Bengaluru",
    venue: "The Foundry", date: "31 Aug", time: "8:00 PM", price: 1850,
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1000&q=85",
    status: "Almost gone", category: "Live music", rating: 4.8,
    description: "An intimate, full-volume night with Echoes. Limited floor capacity, immaculate sound, no encore promises.",
  },
  {
    id: "the-last-lantern", title: "The Last Lantern", type: "Theatre", city: "Delhi",
    venue: "Aranya Playhouse", date: "07 Sep", time: "6:00 PM", price: 950,
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1000&q=85",
    status: "New", category: "Stage", rating: 4.7,
    description: "A new play about memory, migration, and the objects we carry between homes.",
  },
  {
    id: "orbit-2049", title: "Orbit 2049", type: "Movie", city: "Pune",
    venue: "Nova IMAX", date: "14 Sep", time: "9:15 PM", price: 520,
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1000&q=85",
    status: "Book now", category: "Cinema", rating: 4.6,
    description: "A sci-fi epic shown in IMAX with an intermission designed for the full-scale sound mix.",
  },
];

const seatRows = ["A", "B", "C", "D", "E", "F", "G", "H"];
const seats = seatRows.flatMap((row, rowIndex) =>
  Array.from({ length: 10 }, (_, index) => ({
    id: `${row}${index + 1}`, row, number: index + 1,
    category: rowIndex < 2 ? "Premium" : rowIndex < 5 ? "Standard" : "Economy",
    status: (["A3", "A4", "D7", "H2"].includes(`${row}${index + 1}`) ? "booked" : "available"),
    price: rowIndex < 2 ? 620 : rowIndex < 5 ? 420 : 280,
  })),
);

const holds = new Map<string, { seatIds: string[]; expiresAt: number; total: number }>();
const bookings = new Map<string, any>([
  ["b-1", {
    id: "b-1", reference: "PX7K2M", eventTitle: "Midnight in Paris", venue: "The Grand Regent",
    date: "24 Aug", time: "7:30 PM", seats: ["C4", "C5"], total: 1040, status: "Confirmed",
    qr: "PX7K2M",
  }],
]);

function makeQr(reference: string) {
  return `https://quickchart.io/qr?text=${encodeURIComponent(reference)}&size=220&margin=1`;
}

function cleanExpiredHolds() {
  const now = Date.now();
  for (const [id, hold] of holds) if (hold.expiresAt <= now) holds.delete(id);
}

function requestBody(req: Request) {
  return req.body as Record<string, unknown>;
}

router.get("/events", (req, res) => {
  const query = ListEventsQueryParams.parse(req.query);
  const search = query.search?.toLowerCase();
  const filtered = events.filter((event) =>
    (!query.city || event.city === query.city) &&
    (!query.type || event.type === query.type) &&
    (!search || `${event.title} ${event.venue} ${event.city}`.toLowerCase().includes(search)),
  );
  res.json(filtered);
});

router.get("/events/:id", (req, res) => {
  const event = events.find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  return res.json({
    ...event,
    shows: [
      { id: `${event.id}-1`, date: event.date, time: "5:00 PM", language: "English", format: "Standard", available: 18 },
      { id: `${event.id}-2`, date: event.date, time: event.time, language: "English", format: "IMAX", available: 7 },
      { id: `${event.id}-3`, date: event.date, time: "10:15 PM", language: "English", format: "Dolby Atmos", available: 42 },
    ],
  });
});

router.get("/shows/:id/seats", (req, res) => {
  cleanExpiredHolds();
  const params = GetShowSeatsParams.parse(req.params);
  const held = new Set([...holds.values()].flatMap((hold) => hold.seatIds));
  res.json(seats.map((seat) => ({ ...seat, status: held.has(seat.id) ? "held" : seat.status })));
});

router.post("/shows/:id/holds", (req, res) => {
  cleanExpiredHolds();
  const body = CreateSeatHoldBody.parse(requestBody(req));
  const occupied = new Set([
    ...seats.filter((seat) => seat.status === "booked").map((seat) => seat.id),
    ...[...holds.values()].flatMap((hold) => hold.seatIds),
  ]);
  if (body.seatIds.some((id) => occupied.has(id))) return res.status(409).json({ error: "One or more seats were just taken" });
  const selected = seats.filter((seat) => body.seatIds.includes(seat.id));
  if (selected.length !== body.seatIds.length || body.seatIds.length === 0) return res.status(400).json({ error: "Select at least one valid seat" });
  const id = `hold-${Date.now()}`;
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const total = selected.reduce((sum, seat) => sum + seat.price, 0);
  holds.set(id, { seatIds: body.seatIds, expiresAt, total });
  return res.status(201).json({ id, seatIds: body.seatIds, expiresAt: new Date(expiresAt).toISOString(), total });
});

router.get("/bookings", (_req, res) => res.json([...bookings.values()]));

router.post("/bookings", (req, res) => {
  cleanExpiredHolds();
  const body = CreateBookingBody.parse(requestBody(req));
  const hold = holds.get(body.holdId);
  if (!hold) return res.status(410).json({ error: "Your seat hold expired. Please choose seats again." });
  const reference = `PX${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const booking = {
    id: `b-${Date.now()}`, reference, eventTitle: "Midnight in Paris", venue: "The Grand Regent",
    date: "24 Aug", time: "7:30 PM", seats: hold.seatIds, total: hold.total + (body.foodItems?.length ?? 0) * 240,
    status: body.paymentMethod === "venue" ? "Pay at venue" : "Confirmed", qr: makeQr(reference),
  };
  bookings.set(booking.id, booking);
  for (const seat of seats) if (hold.seatIds.includes(seat.id)) seat.status = "booked";
  holds.delete(body.holdId);
  return res.status(201).json(booking);
});

router.post("/bookings/:id/cancel", (req, res) => {
  const booking = bookings.get(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  booking.status = "Cancelled";
  for (const seat of seats) if (booking.seats.includes(seat.id)) seat.status = "available";
  return res.json(booking);
});

router.post("/waitlist", (req, res) => {
  const body = JoinWaitlistBody.parse(requestBody(req));
  res.status(201).json({ id: `wait-${Date.now()}`, position: 3, category: body.category, status: "Watching" });
});

router.post("/support", (req, res) => {
  const body = CreateSupportRequestBody.parse(requestBody(req));
  res.status(201).json({ id: `support-${Date.now()}`, status: "Received" });
  req.log.info({ email: body.email }, "Support request received");
});

export default router;