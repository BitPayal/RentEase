const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const pagesDir = path.join(srcDir, 'pages');
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir);

const filesToMove = ['Home.jsx', 'Login.jsx', 'Signup.jsx', 'ProductDetail.jsx', 'AddProduct.jsx', 'MyProfile.jsx', 'Chat.jsx'];

filesToMove.forEach(file => {
    const oldPath = path.join(srcDir, 'components', file);
    const newPath = path.join(pagesDir, file);
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Successfully moved ${file} to pages/`);
    } else {
        console.log(`${file} not found in components/`);
    }
});
