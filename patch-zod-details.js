const fs = require('fs');
let content = fs.readFileSync('lib/api-zod/src/generated/api.ts', 'utf8');

content = content.replace(
  '"total": zod.number().optional(),',
  '"total": zod.number().optional(),\n  "eventTitle": zod.string().optional(),\n  "venue": zod.string().optional(),\n  "date": zod.string().optional(),\n  "time": zod.string().optional(),'
);

fs.writeFileSync('lib/api-zod/src/generated/api.ts', content);
console.log("Patched Zod schema details");
