const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// 1. In Detail component, change the shows map to use event.shows || shows
content = content.replace(
  '<div>{shows.map(s => <div key={s.id}',
  '<div>{(event.shows || shows).map(s => <div key={s.id}'
);

// 2. In Seats component, change fallbackSeats string IDs to integer IDs just in case they are used!
content = content.replace(
  'return { id: `${row}-${number}`',
  'return { id: i + 1'
);

// 3. Remove "Nocturne for a City" hardcoded in Checkout
content = content.replace(
  '<h2 className="display-font mt-5 text-4xl">Nocturne for<br />a City</h2>',
  '<h2 className="display-font mt-5 text-4xl">{hold.eventTitle || "Checkout"}</h2>'
);

// 4. Change The Rivington hardcoded in Checkout
content = content.replace(
  '<span className="text-foreground/55">The Rivington</span><span>Jun 21 A 20:30</span>',
  '<span className="text-foreground/55">{hold.venue}</span><span>{hold.date} &bull; {hold.time}</span>'
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched App.tsx");
