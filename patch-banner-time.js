const fs = require('fs');
let file = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

const oldExpiresAt = `expiresAt: new Date(Date.now() + left * 1000).toISOString()`;
const newExpiresAt = `expiresAt: Date.now() + left * 1000`;

file = file.replace(oldExpiresAt, newExpiresAt);

// Also POST /shows/:id/holds returns:
// res.status(201).json({ id: holdId, seatIds: body.seatIds, expiresAt: holdResult.expiresAt?.toISOString(), total: seatIds.length * 500 });
// So we need to make sure the POST response is mapped properly, or just don't overwrite expiresAt if it's a string, or patch the backend to return number.
// Actually, `hold.mutate({ ... }, { onSuccess: r => ... })` overwrites it with the API response!
// The API response has `expiresAt: "2025-..."`.
// If I patch the backend to return time in MS, it will fix everything.

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', file);
console.log("App.tsx expiresAt fixed");
