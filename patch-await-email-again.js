const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

content = content.replace(
  'sendEmail(body.email',
  'await sendEmail(body.email'
);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', content);
console.log("Restored await email");
