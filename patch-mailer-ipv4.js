const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/mailer.ts', 'utf8');

content = content.replace(
  'service: "gmail",',
  'service: "gmail",\n  host: "smtp.gmail.com",\n  port: 465,\n  secure: true,\n  family: 4,' // Force IPv4 to prevent Node DNS hangs
);

fs.writeFileSync('artifacts/api-server/src/mailer.ts', content);
console.log("Patched IPv4");
