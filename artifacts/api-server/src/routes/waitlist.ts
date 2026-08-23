import { Router } from "express";
import { db } from "@workspace/db";
import { waitlistTable, showSeatsTable, bookingsTable, bookingSeatsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "../mailer.js";

const router = Router();

router.post("/waitlist/claim", async (req, res) => {
  const { token, email } = req.body;
  const waitlistId = parseInt(token);
  if (isNaN(waitlistId)) return res.status(400).json({ error: "Invalid token" });

  const [waitlister] = await db.select().from(waitlistTable).where(eq(waitlistTable.id, waitlistId));
  if (!waitlister || waitlister.status !== "offered" || !waitlister.offeredSeatId) {
    return res.status(400).json({ error: "Offer invalid or expired" });
  }
  
  if (waitlister.offerExpiresAt && new Date() > waitlister.offerExpiresAt) {
    await db.update(waitlistTable).set({ status: "expired" }).where(eq(waitlistTable.id, waitlistId));
    await db.update(showSeatsTable).set({ status: "available", heldUntil: null }).where(eq(showSeatsTable.id, waitlister.offeredSeatId));
    return res.status(400).json({ error: "Offer expired" });
  }

  // Create booking
  await db.transaction(async (tx) => {
    const [booking] = await tx.insert(bookingsTable).values({
      userId: waitlister.userId,
      showId: waitlister.showId,
      bookingReference: `WL${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      totalAmount: 2500, // Hardcoded standard price for now
      status: "confirmed"
    }).returning();
    
    await tx.insert(bookingSeatsTable).values({
      bookingId: booking.id,
      showSeatId: waitlister.offeredSeatId!
    });
    
    await tx.update(showSeatsTable).set({ status: "booked", heldBy: null, heldUntil: null }).where(eq(showSeatsTable.id, waitlister.offeredSeatId!));
    await tx.update(waitlistTable).set({ status: "claimed" }).where(eq(waitlistTable.id, waitlistId));
  });

  if (email) {
    await sendEmail(email, "Your seat is confirmed!", "You have successfully claimed your waitlist seat.");
  }
  
  res.json({ success: true });
});

export default router;
