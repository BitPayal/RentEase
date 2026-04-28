const mongoose = require('mongoose');
const fs = require('fs');
mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(async () => {
        try {
            const Item = require('./models/Item');
            const items = await Item.find({ status: { $in: ['pending', 'price_pending', 'final_review'] } });
            fs.writeFileSync('out_items.txt', JSON.stringify(items.map(x => x.status)));
        } catch (e) {
            fs.writeFileSync('out_items.txt', 'Error: ' + e.toString());
        }
        process.exit(0);
    });
