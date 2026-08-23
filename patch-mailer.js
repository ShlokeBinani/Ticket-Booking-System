const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

// Add static import
content = content.replace(
  'import { CreateBookingBody, CreateSeatHoldBody, JoinWaitlistBody } from "@workspace/api-zod";',
  'import { CreateBookingBody, CreateSeatHoldBody, JoinWaitlistBody } from "@workspace/api-zod";\nimport { sendEmail } from "../mailer.js";'
);

// Remove dynamic import
content = content.replace(
  'const { sendEmail } = await import("../mailer");',
  ''
);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', content);
console.log("Patched mailer import");
