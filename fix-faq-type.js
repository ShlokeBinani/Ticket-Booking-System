const fs = require('fs');
let code = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');
code = code.replace(/const handleFaq = \(faq\) => \{/, 'const handleFaq = (faq: { q: string, a: string }) => {');
fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', code);
