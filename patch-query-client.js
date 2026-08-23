const fs = require('fs');
let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');
app = app.replace('const client = new QueryClient();', 'const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });');
fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Patched QueryClient!");
