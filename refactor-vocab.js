const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log("NOT FOUND: " + filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    replacements.forEach(([search, replace]) => {
        content = content.split(search).join(replace);
    });
    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + filePath);
    }
}

const ROOT = __dirname;
const NODE_APP = path.join(ROOT, 'node-app');
const REACT_APP = path.join(ROOT, 'react-app');

// 1. Backend Models
replaceInFile(path.join(NODE_APP, 'models', 'Item.js'), [
    ['pname: ', 'title: '],
    ['pdesc: ', 'description: '],
    ['pimage: ', 'image: ']
]);

// 2. Backend Controllers
replaceInFile(path.join(NODE_APP, 'controllers', 'itemController.js'), [
    ['pname', 'title'],
    ['pdesc', 'description'],
    ['pimage', 'image']
]);

// 3. Backend Routes
replaceInFile(path.join(NODE_APP, 'routes', 'itemRoutes.js'), [
    ["single('pimage')", "single('image')"]
]);

// --- Rename Frontend Files FIRST (we'll run this via node so fs.renameSync works) ---
const pagesDir = path.join(REACT_APP, 'src', 'pages');
function safeRename(oldName, newName) {
    const oldP = path.join(pagesDir, oldName);
    const newP = path.join(pagesDir, newName);
    if (fs.existsSync(oldP)) {
        fs.renameSync(oldP, newP);
        console.log(`Renamed ${oldName} to ${newName}`);
    }
}
safeRename('AddProduct.jsx', 'AddItem.jsx');
safeRename('ProductDetail.jsx', 'ItemDetail.jsx');

// 4. React App (Routes)
replaceInFile(path.join(REACT_APP, 'src', 'index.js'), [
    ['AddProduct', 'AddItem'],
    ['ProductDetail', 'ItemDetail'],
    ['/add-product', '/add-item'],
    ['/product/:productId', '/item/:itemId']
]);

// 5. Header Links
replaceInFile(path.join(REACT_APP, 'src', 'components', 'Header.jsx'), [
    ['/add-product', '/add-item'],
    ['ADD PRODUCT', 'ADD ITEM']
]);

// 6. Home UI
replaceInFile(path.join(REACT_APP, 'src', 'pages', 'Home.jsx'), [
    ['item.pname', 'item.title'],
    ['item.pdesc', 'item.description'],
    ['item.pimage', 'item.image'],
    ['handleProduct', 'handleItem'],
    ['/product/', '/item/']
]);

// 7. AddItem UI (formerly AddProduct)
replaceInFile(path.join(pagesDir, 'AddItem.jsx'), [
    ['pname', 'title'],
    ['pdesc', 'description'],
    ['pimage', 'image'],
    ['AddProduct', 'AddItem'],
    ['PRODUCT', 'ITEM'],
    ['Product Name', 'Item Title'],
    ['Product Description', 'Item Description'],
    ['Product Price', 'Item Price'],
    ['Product Category', 'Item Category'],
    ['Product Image', 'Item Image'],
    ['Product Second Image', 'Item Second Image']
]);

// 8. ItemDetail UI
replaceInFile(path.join(pagesDir, 'ItemDetail.jsx'), [
    ['pname', 'title'],
    ['pdesc', 'description'],
    ['pimage', 'image'],
    ['ProductDetail', 'ItemDetail'],
    ['productId', 'itemId']
]);

console.log('Vocabulary Refactor Complete.');
