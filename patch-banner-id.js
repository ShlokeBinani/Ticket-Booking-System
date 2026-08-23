const fs = require('fs');
let file = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

file = file.replace(/hold\.eventId/g, "hold.id");

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', file);
console.log("Hold banner checkout route fixed!");
