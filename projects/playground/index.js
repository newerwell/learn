const fs = require('node:fs');
const [, , file] = process.argv;
console.log('argv:', process.argv);
console.log('内容:', fs.readFileSync(file, 'utf8'));