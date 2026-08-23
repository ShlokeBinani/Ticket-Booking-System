const fs = require('fs');

let file = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

file = file.replace(/\{tab === 'Overview' && !admin && \(\s*<OrganiserMetrics \/>\s*<div className="mt-10 border border-foreground\/15 bg-card p-8">[\s\S]*?<\/>\s*\)\}/, 
"{tab === 'Overview' && !admin && <OrganiserMetrics />}");

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', file);
console.log("JSX fixed with regex!");
