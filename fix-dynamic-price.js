const fs = require('fs');

let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// Update Detail component Link
app = app.replace(/<Link href=\{`\/shows\/\$\{s\.id\}\/seats`\} /g, "<Link href={`/shows/${s.id}/seats?price=${event.price || 2500}`} ");

// Update Seats component to read price
app = app.replace(/const total = selected\.reduce/g, `
  const params = new URLSearchParams(window.location.search);
  const basePrice = parseInt(params.get('price') || '2500', 10);
  const dynamicSeats = list.map(s => ({ ...s, price: s.category === 'Premium' ? Math.floor(basePrice * 1.2) : basePrice }));
  const total = selected.reduce((a, id) => a + (dynamicSeats.find(s => s.id === id)?.price || 0), 0);
  const rows = useMemo(() => Object.entries(Object.groupBy(dynamicSeats, s => s.row)), [dynamicSeats]);
//`);

// Clean up the replaced code slightly to fit the original variable names
app = app.replace(/\/\/.*?\n.*const total = selected\.reduce/g, 'const total = selected.reduce');
app = app.replace(/const rows = useMemo\(\(\) => Object\.entries\(Object\.groupBy\(list, s => s\.row\)\), \[list\]\);/g, ''); // we redefined it above!

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Dynamism injected!");
