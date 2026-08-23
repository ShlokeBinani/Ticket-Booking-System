const fs = require('fs');

let schemas = fs.readFileSync('lib/api-client-react/src/generated/api.schemas.ts', 'utf8');

// Replace HoldInput
schemas = schemas.replace(
  'export type HoldInput = {\n    seatIds: string[];\n};',
  'export type HoldInput = {\n    seatIds: string[];\n    total?: number;\n};'
);

// Replace BookingInput
schemas = schemas.replace(
  'export type BookingInput = {\n    holdId: string;\n    email: string;\n    paymentMethod: string;\n    foodItems?: string[];\n};',
  'export type BookingInput = {\n    holdId: string;\n    email: string;\n    paymentMethod: string;\n    foodItems?: string[];\n    total?: number;\n    eventTitle?: string;\n    venue?: string;\n    date?: string;\n    time?: string;\n};'
);

fs.writeFileSync('lib/api-client-react/src/generated/api.schemas.ts', schemas);
console.log("Patched React client schemas");
