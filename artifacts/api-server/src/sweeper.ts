import { db } from "@workspace/db";
import { showSeatsTable, waitlistTable, usersTable } from "@workspace/db/schema";
import { eq, and, lt, isNull } from "drizzle-orm";

export async function runSweeper() {
  console.log("[Sweeper] Running expired hold cleanup...");
  const now = new Date();
  
  // 1. Release expired holds
  // We can just set status='available' and heldUntil=null
  await db.update(showSeatsTable)
    .set({ status: "available", heldBy: null, heldUntil: null })
    .where(and(
      eq(showSeatsTable.status, "held"),
      lt(showSeatsTable.heldUntil, now)
    ));

  // 2. Process waitlist for available seats
  // Find seats that are available
  const availableSeats = await db.select().from(showSeatsTable).where(eq(showSeatsTable.status, "available"));
  
  for (const seat of availableSeats) {
    // Find first waiting person for this seat's category/show
    const [waitlistEntry] = await db.select().from(waitlistTable)
      .where(and(
        eq(waitlistTable.status, "waiting"),
        eq(waitlistTable.showId, seat.showId)
      ))
      .orderBy(waitlistTable.joinedAt)
      .limit(1);

    if (waitlistEntry) {
      console.log(`[Sweeper] Waitlist assigned! Seat ${seat.id} offered to waitlist entry ${waitlistEntry.id}`);
      
      const offerExpiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour to claim

      await db.transaction(async (tx) => {
        // Hold seat for this user
        await tx.update(showSeatsTable)
          .set({ status: "held", heldBy: waitlistEntry.userId, heldUntil: offerExpiry })
          .where(eq(showSeatsTable.id, seat.id));
          
        // Update waitlist entry
        await tx.update(waitlistTable)
          .set({ status: "offered", offeredSeatId: seat.id, offerExpiresAt: offerExpiry })
          .where(eq(waitlistTable.id, waitlistEntry.id));
      });
      
      // Simulate sending email
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, waitlistEntry.userId));
      if (user) {
        const { sendEmail } = await import("./mailer");
        await sendEmail(
          user.email,
          "Your Paradox Ticket Waitlist Seat is Available!",
          `<p>A seat has opened up for you! Claim it within 1 hour before it expires.</p>`
        );
      }
    }
  }
}
