const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(async () => {
        const Item = mongoose.model('Item', new mongoose.Schema({}, { strict: false }));
        const items = await Item.find({});
        console.log(JSON.stringify(items.map(i => ({ title: i.title, location: i.location, loc: i.loc })), null, 2));
        process.exit(0);
    })
    .catch(console.log);
