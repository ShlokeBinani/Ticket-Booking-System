const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// Replace the list calculation in Bookings component
content = content.replace(
  'const list = (data as Booking[] | undefined)?.length ? [...data as Booking[], ...local] : local;',
  'const list = (data as Booking[] | undefined) || [];'
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched Bookings frontend");
