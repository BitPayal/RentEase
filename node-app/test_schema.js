const mongoose = require('mongoose');
const Item = require('./models/Item');

async function checkSchema() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test');
        console.log("Connected");
        const item = new Item({
            title: "Test",
            description: "Test",
            pricePerDay: 100,
            originalPrice: 100,
            suggestedPrice: 90,
            finalPrice: 90,
            ownerId: new mongoose.Types.ObjectId(),
            status: 'price_pending'
        });
        const err = item.validateSync();
        if (err) {
            console.log("Validation Error:", err.message);
        } else {
            console.log("Validation Success. Schema allows price_pending.");
        }
    } catch(e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
checkSchema();
