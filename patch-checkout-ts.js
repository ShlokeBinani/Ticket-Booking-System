const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

content = content.replace(
  'as { seatIds: string[]; total: number }',
  'as { seatIds: string[]; total: number; eventTitle?: string; venue?: string; date?: string; time?: string; }'
);
content = content.replace(
  'return { seatIds: [\'C-6\', \'C-7\'], total: 48 };',
  'return { seatIds: [\'C-6\', \'C-7\'], total: 48, eventTitle: "", venue: "", date: "", time: "" };'
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched checkout ts");
