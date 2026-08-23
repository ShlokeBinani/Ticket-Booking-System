const fs = require('fs');
let file = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

file = file.replace(
  "from: 'Paradox Tickets <tickets@resend.dev>',",
  "from: 'Paradox Tickets <onboarding@resend.dev>',"
);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', file);
console.log("Resend email from-address updated!");
