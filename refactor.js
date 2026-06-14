const fs = require('fs');
const path = require('path');

const directory = 'd:\\nailform3d be-fe\\identity-service (be-root)\\src\\main\\java\\com\\restapi\\identityservice';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath));
        } else if (filePath.endsWith('.java')) {
            results.push(filePath);
        }
    });
    return results;
}

const javaFiles = walkDir(directory);

javaFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('SubscriptionPlan') && 
        !content.includes('SubscriptionPlanEntity') && 
        !content.includes('SubscriptionPlanRepository')) {
        
        console.log(`Processing: ${filePath}`);
        
        content = content.replace(/import com\.restapi\.identityservice\.entity\.SubscriptionPlan;\r?\n/g, '');
        content = content.replace(/SubscriptionPlan\.FREE/g, '"FREE"');
        content = content.replace(/SubscriptionPlan\.PRO/g, '"PRO"');
        content = content.replace(/SubscriptionPlan\.PREMIUM/g, '"PREMIUM"');
        content = content.replace(/SubscriptionPlan\.STUDIO_5/g, '"STUDIO_5"');
        content = content.replace(/SubscriptionPlan\.STUDIO_10/g, '"STUDIO_10"');
        content = content.replace(/SubscriptionPlan\.ACADEMY_20/g, '"ACADEMY_20"');
        content = content.replace(/SubscriptionPlan\.values\(\)/g, '["FREE", "PRO", "PREMIUM", "STUDIO_5", "STUDIO_10", "ACADEMY_20"]');
        content = content.replace(/\(SubscriptionPlan /g, '(String ');
        content = content.replace(/ SubscriptionPlan /g, ' String ');
        content = content.replace(/com\.restapi\.identityservice\.entity\.SubscriptionPlan/g, 'String');
        
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log('Done!');
