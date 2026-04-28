const mongoose = require('mongoose');
const Item = require('./models/Item');
const User = require('./models/User');
const sendPriceChangeEmail = require('./utils/email');

async function test() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test');
        console.log("Connected to DB");
        
        // get one pending item
        const item = await Item.findOne({ status: 'pending' }).populate('ownerId', 'username email');
        if (!item) {
            console.log("No pending items found");
            process.exit(0);
        }
        console.log("Found item:", item._id, "title:", item.title, "owner:", item.ownerId);

        const suggestedPrice = 90;
        item.suggestedPrice = suggestedPrice;
        item.status = 'price_pending';
        await item.save();
        console.log("Item saved!");

        if (item.ownerId && item.ownerId.email) {
            console.log("Sending email to:", item.ownerId.email);
            await sendPriceChangeEmail(item.ownerId.email, item.title, item.originalPrice, suggestedPrice);
            console.log("Email sent!");
        } else {
             console.log("No owner email found");
        }

    } catch (err) {
        console.error("ERROR CAUGHT:");
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

test();
