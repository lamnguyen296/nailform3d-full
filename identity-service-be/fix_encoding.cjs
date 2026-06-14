const fs = require('fs');
const file = 'd:/nailform3d be-fe/identity-service (be-root)/src/main/resources/application.properties';
const content = fs.readFileSync(file, 'utf16le');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed application.properties encoding');
