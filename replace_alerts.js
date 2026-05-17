const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'react-app/src');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('alert(') && !fullPath.includes('index.js')) {
                // Ensure import toast from 'react-hot-toast'
                if (!content.includes("from 'react-hot-toast'") && !content.includes('from "react-hot-toast"')) {
                    const lines = content.split('\n');
                    let lastImport = -1;
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].trim().startsWith('import ')) {
                            lastImport = i;
                        }
                    }
                    if (lastImport !== -1) {
                        lines.splice(lastImport + 1, 0, "import { toast } from 'react-hot-toast';");
                    } else {
                        lines.unshift("import { toast } from 'react-hot-toast';");
                    }
                    content = lines.join('\n');
                }
                
                content = content.replace(/alert\((.*?)\)/g, (match, p1) => {
                    const str = p1.toLowerCase();
                    if (str.includes('err') || str.includes('fail') || str.includes('please') || str.includes('wrong') || str.includes('warning') || str.includes('not found') || str.includes('must')) {
                        return `toast.error(${p1})`;
                    } else if (str.includes('success') || str.includes('approv') || str.includes('accept') || str.includes('delete')) {
                        return `toast.success(${p1})`;
                    }
                    return `toast.info(${p1})`;
                });

                fs.writeFileSync(fullPath, content);
                console.log('Updated', fullPath);
            }
        }
    }
}

processDir(srcDir);
