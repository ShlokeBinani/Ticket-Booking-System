const fs = require('fs');

let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

app = app.replace(/\(\(a, id\) => a \+ \(list\.find\(s => s\.id === id\)\?\.price \|\| 0\), 0\);/g, "");

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Cleaned up the dead expression!");
