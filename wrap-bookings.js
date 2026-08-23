const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

// We will replace the entire route body with a try-catch block
const startMatch = 'router.post("/bookings", requireAuth, async (req: AuthRequest, res) => {\n';
const endMatch = '  res.json({ grossRevenue, ticketsMoved, avgTicket, sellThrough });\n});';

const parts = content.split(startMatch);
if (parts.length === 2) {
  const subParts = parts[1].split(endMatch);
  if (subParts.length === 2) {
    const newBody = `  try {\n${subParts[0]}  res.json({ grossRevenue, ticketsMoved, avgTicket, sellThrough });\n  } catch (err: any) {\n    console.error("BOOKING ERROR", err);\n    res.status(500).json({ error: "Booking crashed: " + err.message + "\\n" + err.stack });\n  }\n});`;
    fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', parts[0] + startMatch + newBody + subParts[1]);
    console.log("Wrapped in try-catch");
  }
}
