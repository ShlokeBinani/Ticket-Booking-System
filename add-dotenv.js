const fs = require('fs');

let file = fs.readFileSync('artifacts/api-server/src/app.ts', 'utf8');

if (!file.includes('dotenv')) {
  file = `import dotenv from "dotenv";\ndotenv.config();\n` + file;
  fs.writeFileSync('artifacts/api-server/src/app.ts', file);
  console.log("dotenv added to app.ts");
}
