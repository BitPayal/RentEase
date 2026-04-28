const mongoose = require('mongoose');
const User = require('./models/User');
const Item = require('./models/Item');
const Booking = require('./models/Booking');
const Transaction = require('./models/Transaction');

async function run() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test');
        console.log('DB Connected');
        
        console.log('Counting users...');
        const totalUsers = await User.countDocuments({ role: 'user' });
        console.log({totalUsers});
        
        console.log('Counting items...');
        const totalItems = await Item.countDocuments();
        console.log({totalItems});
        
        console.log('Counting bookings...');
        const totalBookings = await Booking.countDocuments();
        console.log({totalBookings});
        
        console.log('Finding transactions...');
        const transactions = await Transaction.find({ paymentStatus: 'Completed' });
        const totalRevenue = transactions.reduce((acc, t) => acc + (t.platformFee || 0), 0);
        console.log({totalRevenue});
        
        console.log('Success!');
    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        await mongoose.disconnect();
    }
}
run();
