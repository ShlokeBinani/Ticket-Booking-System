const fs = require('fs');
let code = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');
code = code.replace("const baseUrl = import.meta.env.VITE_API_URL || ''; const baseUrl = import.meta.env.VITE_API_URL || '';", "const baseUrl = import.meta.env.VITE_API_URL || '';");
fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', code);
