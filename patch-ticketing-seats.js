const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

// Convert DB returned IDs to strings so frontend Zod types are happy
content = content.replace(
  'res.json(seats.map(s => {',
  'res.json(seats.map(s => {\n    s.id = String(s.id);'
);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', content);
console.log("Patched ticketing.ts IDs");
