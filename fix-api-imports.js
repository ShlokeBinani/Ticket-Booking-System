const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('artifacts/api-server/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Replace relative imports: import ... from "./something" -> "./something.js"
  // Note: we only want to append .js if it doesn't already have it, and only for local files.
  // Also handles export ... from "./something"
  content = content.replace(/(import|export)\s+(?:.+?\s+from\s+)?['"](\.[^'"]+?)['"]/g, (match, p1, p2) => {
    if (p2.endsWith('.js') || p2.endsWith('.ts')) return match;
    // Check if it's a directory (needs /index.js) or a file (needs .js)
    const absolutePath = path.resolve(path.dirname(file), p2);
    let resolved = p2;
    if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
      resolved = p2 + '/index.js';
    } else {
      resolved = p2 + '.js';
    }
    return match.replace(p2, resolved);
  });
  fs.writeFileSync(file, content);
});
console.log("Imports fixed!");
