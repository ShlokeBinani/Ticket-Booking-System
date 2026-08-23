const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

content = content.replace(
  'href={`/shows/${s.id}/seats?price=${event.price || 2500}`}',
  'href={`/shows/${s.id}/seats?price=${event.price || 2500}&title=${encodeURIComponent(event.title || "")}&venue=${encodeURIComponent(event.venue || "")}&date=${encodeURIComponent(event.date || "")}&time=${encodeURIComponent(event.time || "")}`}'
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched Detail link");
