const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath));
        } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walkDir(directory);

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // For template literals: `http://localhost:8080/identity/endpoint` -> `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/endpoint`
    content = content.replace(/`http:\/\/localhost:8080\/identity/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:8080/identity\'}');
    
    // For double quotes: "http://localhost:8080/identity/endpoint" -> `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/endpoint`
    content = content.replace(/"http:\/\/localhost:8080\/identity([^"]*)"/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:8080/identity\'}$1`');
    
    // For single quotes: 'http://localhost:8080/identity/endpoint' -> `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/endpoint`
    content = content.replace(/'http:\/\/localhost:8080\/identity([^']*)'/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:8080/identity\'}$1`');

    if (content !== original) {
        console.log(`Updated API URL in: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log('Done replacing URLs!');
