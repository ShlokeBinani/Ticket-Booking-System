const fs = require('fs');

let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

app = app.replace(/\/\/(\(\(a, id\)[^\n]+)/g, "$1");

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Restored the commented line!");
