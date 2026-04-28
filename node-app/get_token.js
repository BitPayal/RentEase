const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test');
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log("No admin found, creating one...");
            admin = new User({ username: 'testadmin', password: 'testpassword', role: 'admin' });
            await admin.save();
        }
        const token = jwt.sign({ data: admin }, 'MYKEY', { expiresIn: '15m' });
        console.log(token);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
run();
