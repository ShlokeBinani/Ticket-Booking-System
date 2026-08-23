const fs = require('fs');
let file = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

file = file.replace(/sessionStorage\.setItem\('paradox-hold'/g, "localStorage.setItem('paradox-active-hold'");
file = file.replace(/sessionStorage\.getItem\('paradox-hold'/g, "localStorage.getItem('paradox-active-hold'");

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', file);
console.log("Hold banner fixed!");
