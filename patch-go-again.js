const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

content = content.replace(
  'eventTitle: event.title || "Paradox Ticket",',
  'eventTitle: params.get("title") || "Paradox Ticket",'
);
content = content.replace(
  'venue: event.venue || "The Rivington",',
  'venue: params.get("venue") || "The Rivington",'
);
content = content.replace(
  'date: event.date || "Jun 21",',
  'date: params.get("date") || "Jun 21",'
);
content = content.replace(
  'time: event.time || "20:30"',
  'time: params.get("time") || "20:30"'
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched go() again");
