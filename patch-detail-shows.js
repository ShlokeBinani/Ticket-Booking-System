const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

content = content.replace(
  '{(event.shows || shows).map(s =>',
  '{((event as any).shows || shows).map((s: any) =>'
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched Detail shows TS");
