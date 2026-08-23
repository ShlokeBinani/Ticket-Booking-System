const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

content = content.replace(
  'hold.mutate({ id, data: { seatIds: selected, total } }',
  'hold.mutate({ id, data: { seatIds: selected, total } as any }'
);

content = content.replace(
  'create.mutate({ data: { holdId, email, paymentMethod: payment, foodItems: [], total: hold.total } }',
  'create.mutate({ data: { holdId, email, paymentMethod: payment, foodItems: [], total: hold.total } as any }'
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched App.tsx as any");
