const mongoose = require('mongoose');
const User = require('./models/User');
const Item = require('./models/Item');

console.log("Connecting...");
mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(async () => {
        console.log("DB Connected.");
        const users = await User.find();
        console.log("Users total:", users.length);
        console.log(users.map(u => ({ username: u.username, role: u.role, status: u.status })));
        
        const items = await Item.find();
        console.log("Items total:", items.length);
        console.log(items.map(i => ({ title: i.title, status: i.status })));
        
        process.exit();
    })
    .catch(err => {
        console.log("DB error:", err);
        process.exit();
    });
