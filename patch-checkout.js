const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// Replace the specific div content with regex to handle mangled characters
content = content.replace(
  /<div className="flex justify-between"><span className="text-foreground\/55">The Rivington<\/span><span>Jun 21.+?20:30<\/span><\/div>/g,
  '<div className="flex justify-between"><span className="text-foreground/55">{hold.venue || "The Rivington"}</span><span>{hold.date} &bull; {hold.time}</span></div>'
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched Checkout");
