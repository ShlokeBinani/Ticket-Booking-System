const fs = require('fs');

let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// Fix Indian Rupee symbols (handling any stray ? marks that PowerShell injected)
app = app.replace(/\?17,10,000/g, '?17,10,000');
app = app.replace(/\?2,500/g, '?2,500');
app = app.replace(/\?2,80,000/g, '?2,80,000');
app = app.replace(/120 seats  New York/g, '120 seats · New York');
app = app.replace(/booked  \?2/g, 'booked · ?2');

// Fix Seats component to persist booked seats globally
app = app.replace(/const dynamicSeats = list\.map\(s => \(\{ \.\.\.s, price: s\.category === 'Premium' \? Math\.floor\(basePrice \* 1\.2\) : basePrice \}\)\);/, 
`const localBookings = (() => { try { return JSON.parse(localStorage.getItem('paradox-bookings') || '[]'); } catch { return []; } })();
  const bookedSeatIds = localBookings.flatMap((b: any) => b.seats || []);
  const dynamicSeats = list.map(s => ({ ...s, status: bookedSeatIds.includes(s.id) ? 'sold' : s.status, price: s.category === 'Premium' ? Math.floor(basePrice * 1.2) : basePrice }));`);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Rupee symbols and Seat booking persistence fixed!");
