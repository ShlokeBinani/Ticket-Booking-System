const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

// Replace hardcoded values in POST /bookings
content = content.replace(
  'eventTitle: "Indian Movie",',
  'eventTitle: body.eventTitle || "Paradox Event",'
);
content = content.replace(
  'venue: "Mumbai Cinema",',
  'venue: body.venue || "Paradox Venue",'
);
content = content.replace(
  'date: "24 Aug",',
  'date: body.date || "Unknown Date",'
);
content = content.replace(
  'time: "7:30 PM",',
  'time: body.time || "Unknown Time",'
);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', content);
console.log("Patched bookings response");
