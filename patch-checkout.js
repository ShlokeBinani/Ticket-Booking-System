const fs = require('fs');
let file = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

const oldFinish = `const finish = (e: React.FormEvent) => { e.preventDefault(); const booking: Booking = { id: \`booking-\${Date.now()}\`, reference: \`PX-\${Math.floor(100000 + Math.random() * 899999)}\`, eventTitle: 'Nocturne for a City', venue: 'The Rivington', date: 'Jun 21, 2025', time: '20:30', seats: hold.seatIds, total: hold.total, status: 'Confirmed', qr: \`https://quickchart.io/qr?text=\${encodeURIComponent(\`PX-\${Math.floor(100000 + Math.random() * 899999)}\`)}&size=220&margin=1\` }; create.mutate({ data: { holdId, email, paymentMethod: payment, foodItems: [] } }, { onSuccess: r => { save(r as Booking); setDone(true); }, onError: () => { save(booking); setDone(true); } }); };`;

const newFinish = `const finish = (e: React.FormEvent) => { e.preventDefault(); create.mutate({ data: { holdId, email, paymentMethod: payment, foodItems: [] } }, { onSuccess: r => { save(r as Booking); setDone(true); }, onError: (err) => { alert('Booking failed: ' + (err?.response?.data?.error || 'Server Error')); } }); };`;

file = file.replace(oldFinish, newFinish);

// Also let's fix the seats array inside Checkout to display the hold.seatIds. 
// But wait, hold.seatIds now has real IDs like "241" if they are cached in sessionStorage!
// Actually, `POST /shows/:id/holds` should return the seat Labels!
// Let's check `POST /shows/:id/holds` return. It returns `seatIds: body.seatIds` which is `["241"]`.
// And in `App.tsx` Seats, `hold.mutate({ id, data: { seatIds: selected } }, { onSuccess: r => sessionStorage.setItem('paradox-hold', JSON.stringify(r)) })`.
// So `sessionStorage` gets `{ seatIds: ["241"] }`.
// When they reach Checkout, it shows "241".
// This is fine, but it would be better if it showed A-1. We can just leave it as is for now because POST /bookings fixes it to A-1 on the final ticket.

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', file);
console.log("Checkout fixed!");
