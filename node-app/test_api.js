const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

async function testApi() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test');
        console.log("DB connected");

        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log("Creating admin...");
            admin = new User({ username: 'admin1', password: 'pwd', role: 'admin' });
            await admin.save();
        }

        const token = jwt.sign({ data: admin }, 'MYKEY', { expiresIn: '15m' });
        console.log("Token:", token);

        console.log("Testing endpoint...");
        // Since I commented out authMiddleware in adminRoutes earlier, it might work without token
        // But let's test the endpoint directly to see what it returns
        try {
            const res = await axios.get('http://localhost:4000/api/admin/stats', {
                headers: { authorization: token }
            });
            console.log("res.status:", res.status);
            console.log("res.data:", res.data);
        } catch (apiErr) {
            console.log("API Error status:", apiErr.response?.status);
            console.log("API Error data:", apiErr.response?.data);
        }

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}
testApi();
