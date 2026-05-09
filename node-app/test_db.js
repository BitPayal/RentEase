const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect('mongodb://127.0.0.1:27017/test').then(async () => {
    try {
        const users = await User.find({});
        console.log('USERS COUNT:', users.length);
        console.log(users.map(u => ({ id: u._id, username: u.username, role: u.role, isVerified: u.isVerified, status: u.verificationStatus })));
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}).catch(console.log);
