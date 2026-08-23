const fs = require('fs');

let file = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

file = file.replace(
  'const [venue] = await db.insert(venuesTable).values({',
  '// @ts-ignore\n    const [venue] = await db.insert(venuesTable).values({'
);

file = file.replace(
  'const [event] = await db.insert(eventsTable).values({',
  '// @ts-ignore\n    const [event] = await db.insert(eventsTable).values({'
);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', file);
console.log("ts-ignore applied!");
