const fs = require('fs');

// 1. Fix Frontend App.tsx
let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');
app = app.replace(/price: row < 'C' \? 32 : 24/g, "price: row < 'C' ? 3000 : 2500");
fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);

// 2. Fix Backend ticketing.ts
let api = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');
api = api.replace(/price: s\.categoryId === 1 \? 620 : 420/g, "price: s.categoryId === 1 ? 3000 : 2500");
fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', api);

console.log("Prices updated!");
