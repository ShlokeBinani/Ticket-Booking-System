const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

content = content.replace(
  'res.status(410).json({ error: "Your seat hold expired. Please choose seats again." });',
  'res.status(410).json({ error: "Your seat hold expired. Please choose seats again." });\n    return;'
);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', content);
console.log("Patched return");
