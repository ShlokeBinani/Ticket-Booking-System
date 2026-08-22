const fs = require('fs');
let code = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

code = code.replace(/\?14,58,462/g, '?14,58,462');
code = code.replace(/\?2,500/g, '?2,500');
code = code.replace(/\?2,53,440/g, '?2,53,440');

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', code);
