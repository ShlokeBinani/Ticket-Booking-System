const fs = require('fs');
let content = fs.readFileSync('lib/api-zod/src/generated/api.ts', 'utf8');

content = content.replace(
  '"paymentMethod": zod.string(),',
  '"paymentMethod": zod.string(),\n  "total": zod.number().optional(),'
);

content = content.replace(
  'export const CreateSeatHoldBody = zod.object({\n  "seatIds": zod.array(zod.string())\n})',
  'export const CreateSeatHoldBody = zod.object({\n  "seatIds": zod.array(zod.string()),\n  "total": zod.number().optional()\n})'
);

fs.writeFileSync('lib/api-zod/src/generated/api.ts', content);
console.log("Patched Zod schema");
