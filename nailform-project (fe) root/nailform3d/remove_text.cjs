const fs = require('fs');
const file = 'd:/nailform3d be-fe/nailform-project (fe) root/nailform3d/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<span className="admin-stat-meta positive">\s*<i className="fa-solid fa-bolt"><\/i> Real-time DB\s*<\/span>/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully removed Real-time DB text from AdminDashboard.jsx');
