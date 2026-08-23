const fs = require('fs');

let file = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

file = file.replace(
  "const { getToken } = useAuth();", 
  "const { token } = useAuth();"
);
file = file.replace(
  "headers: { 'Authorization': `Bearer ${getToken()}` }", 
  "headers: { 'Authorization': `Bearer ${token}` }"
);
file = file.replace(
  "/organiser/stats", 
  "/api/organiser/stats"
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', file);
console.log("Metrics fixed!");
