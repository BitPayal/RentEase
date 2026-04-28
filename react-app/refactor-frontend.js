const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const pagesDir = path.join(srcDir, 'pages');
const componentsDir = path.join(srcDir, 'components');

const replacements = [
    { from: /import Header from "\.\/Header";/g, to: 'import Header from "../components/Header";' },
    { from: /import Categories from "\.\/Categories";/g, to: 'import Categories from "../components/Categories";' },
    { from: /API_URL \+ '\/get-products'/g, to: 'API_URL + "/items"' },
    { from: /API_URL \+ '\/add-product'/g, to: 'API_URL + "/items"' },
    { from: /\$\{\s*API_URL\s*\}\\?\/search/g, to: '${API_URL}/items/search' },
    { from: /\$\{\s*API_URL\s*\}\\?\/get-product\//g, to: '${API_URL}/items/' },
    { from: /API_URL \+ '\/signup'/g, to: 'API_URL + "/auth/register"' },
    { from: /API_URL \+ '\/login'/g, to: 'API_URL + "/auth/login"' },
    { from: /API_URL \+ '\/my-profile'/g, to: 'API_URL + "/auth/my-profile"' },
    { from: /API_URL \+ '\/upgrade-premium'/g, to: 'API_URL + "/auth/upgrade-premium"' },
    { from: /API_URL \+ '\/book-product'/g, to: 'API_URL + "/book"' },
    { from: /\$\{\s*API_URL\s*\}\\?\/send-message/g, to: '${API_URL}/chat/send-message' },
    { from: /\$\{\s*API_URL\s*\}\\?\/get-messages\//g, to: '${API_URL}/chat/' }
];

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.jsx')) {
            const filePath = path.join(dir, file);
            let content = fs.readFileSync(filePath, 'utf-8');
            for (const r of replacements) {
                content = content.replace(r.from, r.to);
            }
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`Updated ${filePath}`);
        }
    }
}

processDir(pagesDir);
processDir(componentsDir);

// Update constants.js
const constantsPath = path.join(srcDir, 'constants.js');
let constantsContent = fs.readFileSync(constantsPath, 'utf-8');
constantsContent = constantsContent.replace(/http:\/\/localhost:4000/g, 'http://localhost:4000/api');
fs.writeFileSync(constantsPath, constantsContent, 'utf-8');
console.log('Updated constants.js');
