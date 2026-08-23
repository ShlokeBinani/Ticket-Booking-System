const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

content = content.replace(`if (validSeats.length === 0) {
    res.status(410).json({ error: "Your seat hold expired. Please choose seats again." });
  }`, `if (validSeats.length === 0) {
    res.status(410).json({ error: "Your seat hold expired. Please choose seats again." });
    return;
  }`);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', content);
console.log("Added return statement!");
