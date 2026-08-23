const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// In Seats component
content = content.replace(
  'hold.mutate({ id, data: { seatIds: selected } }',
  'hold.mutate({ id, data: { seatIds: selected, total } }'
);

// In Checkout component
content = content.replace(
  'create.mutate({ data: { holdId, email, paymentMethod: payment, foodItems: [] } }',
  'create.mutate({ data: { holdId, email, paymentMethod: payment, foodItems: [], total: hold.total } }'
);

// Also remove hold from localStorage on successful booking
content = content.replace(
  'onSuccess: r => { save(r as Booking); setDone(true); },',
  'onSuccess: r => { save(r as Booking); localStorage.removeItem("paradox-active-hold"); setDone(true); },'
);

// Also preserve total in localStorage
content = content.replace(
  '...r,',
  '...r,\n          total: total || r.total,'
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched App.tsx for total and clearing hold");
