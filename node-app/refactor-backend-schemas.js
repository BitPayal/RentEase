const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(([search, replace]) => {
        content = content.split(search).join(replace);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

// 1. Update itemController.js
replaceInFile(path.join(__dirname, 'controllers', 'itemController.js'), [
    ["require('../models/Product')", "require('../models/Item')"],
    ["const Product =", "const Item ="],
    ["new Product", "new Item"],
    ["Product.find", "Item.find"],
    ["Product.findOne", "Item.findOne"]
]);

// 2. Update bookingController.js
replaceInFile(path.join(__dirname, 'controllers', 'bookingController.js'), [
    ["productId:", "itemId:"],
    ["renterId:", "userId:"],
    ["populate('productId')", "populate('itemId')"],
    ["productId.", "itemId."]
]);

// 3. Update chatController.js and routes if needed
replaceInFile(path.join(__dirname, 'controllers', 'chatController.js'), [
    ["productId:", "itemId:"],
    ["req.body.productId", "req.body.itemId"],
    ["req.params.productId", "req.params.itemId"]
]);
replaceInFile(path.join(__dirname, 'routes', 'chatRoutes.js'), [
    [":productId", ":itemId"]
]);

console.log('Backend references successfully refactored to align with the new Item and Rental schemas.');
