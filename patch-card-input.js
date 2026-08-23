const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

content = content.replace(
  '<label className="mt-6 block text-xs text-foreground/55">Card number<input placeholder="4242 4242 4242 4242" className="mt-2 w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none focus:border-accent" data-testid="input-card" /></label>',
  '{payment === "card" && <label className="mt-6 block text-xs text-foreground/55">Card number<input placeholder="4242 4242 4242 4242" required className="mt-2 w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none focus:border-accent" data-testid="input-card" /></label>}'
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched card input hiding");
