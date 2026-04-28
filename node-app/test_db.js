const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(async () => {
        const User = require('./models/User');
        const Item = require('./models/Item');
        const u = await User.find({});
        const i = await Item.find({});
        console.log('Users:', u.length);
        console.log('Items:', i.length);
        if(u.length > 0) console.log('Sample User:', u[u.length-1].username, u[u.length-1].role);
        if(i.length > 0) console.log('Sample Item status:', i[i.length-1].status);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
