const fs = require('fs');

let hold = fs.readFileSync('lib/api-zod/src/generated/types/holdInput.ts', 'utf8');
hold = hold.replace('seatIds: string[];', 'seatIds: string[];\n  total?: number;');
fs.writeFileSync('lib/api-zod/src/generated/types/holdInput.ts', hold);

let booking = fs.readFileSync('lib/api-zod/src/generated/types/bookingInput.ts', 'utf8');
booking = booking.replace('foodItems?: string[];', 'foodItems?: string[];\n  total?: number;\n  eventTitle?: string;\n  venue?: string;\n  date?: string;\n  time?: string;');
fs.writeFileSync('lib/api-zod/src/generated/types/bookingInput.ts', booking);

console.log("Patched TS interfaces");
