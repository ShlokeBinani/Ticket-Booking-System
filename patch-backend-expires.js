const fs = require('fs');
let file = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

const oldLine = `expiresAt: holdResult.expiresAt?.toISOString()`;
const newLine = `expiresAt: holdResult.expiresAt ? holdResult.expiresAt.getTime() : (Date.now() + 10 * 60 * 1000)`;

file = file.replace(oldLine, newLine);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', file);
console.log("Backend expiresAt fixed");
