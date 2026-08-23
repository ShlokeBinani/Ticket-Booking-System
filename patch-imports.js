const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

content = content.replace(
  'import { eq, and, or, lt, sql, inArray } from "drizzle-orm";',
  'import { eq, and, or, lt, sql, inArray, desc } from "drizzle-orm";'
);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', content);
console.log("Patched imports");
