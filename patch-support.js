const fs = require('fs');
let code = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

code += `\n
// Mock support endpoint
router.post("/support", async (req, res) => {
  res.status(201).json({ success: true, message: "Support ticket created" });
});
`;
fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', code);
