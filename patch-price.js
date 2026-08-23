const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

// In POST /shows/:id/holds
content = content.replace(
  'total: seatIds.length * 500',
  'total: body.total || seatIds.length * 500' // If frontend sends total, use it
);

// In POST /bookings
content = content.replace(
  'totalAmount: validSeats.length * 500 + (body.foodItems?.length ?? 0) * 240,',
  'totalAmount: body.total || (validSeats.length * 500 + (body.foodItems?.length ?? 0) * 240),' // Use body.total if sent
);

content = content.replace(
  'total: validSeats.length * 500,',
  'total: body.total || (validSeats.length * 500),'
);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', content);
console.log("Patched price in backend");
