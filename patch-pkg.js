const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('artifacts/api-server/package.json', 'utf8'));

pkg.dependencies = pkg.dependencies || {};
pkg.dependencies['nodemailer'] = '^6.9.14';

pkg.devDependencies = pkg.devDependencies || {};
pkg.devDependencies['@types/nodemailer'] = '^6.4.15';

fs.writeFileSync('artifacts/api-server/package.json', JSON.stringify(pkg, null, 2));
console.log("package.json updated!");
