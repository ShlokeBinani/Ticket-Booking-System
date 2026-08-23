const fs = require('fs');
let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

const oldFallbackStr = `const fallbackSeats: Seat[] = [];
['A','B','C'].forEach(r => {
  for(let i=1; i<=10; i++) {
    fallbackSeats.push({ id: \`\${r}-\${i}\`, row: r, number: i, status: 'available', category: i <= 2 ? 'Premium' : 'Standard', price: i <= 2 ? 3000 : 2500 } as any);
  }
});`;

const newFallbackStr = `const fallbackSeats: Seat[] = Array.from({ length: 72 }, (_, i) => {
  const row = String.fromCharCode(65 + Math.floor(i / 12)); const number = i % 12 + 1;
  return { id: \`\${row}-\${number}\`, row, number, category: row < 'C' ? 'Premium' : 'Standard', status: [3, 4, 14, 15, 26, 38, 39, 51, 64, 65].includes(i) ? 'sold' : 'available', price: row < 'C' ? 32 : 24 } as any;
});`;

app = app.replace(oldFallbackStr, newFallbackStr);
fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Fallback patched!");
