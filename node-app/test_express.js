const mongoose = require('mongoose');
const adminController = require('./controllers/adminController');

async function runTest() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test');
        console.log("DB connected");

        const req = {};
        const res = {
            status: function(code) { 
                console.log("Status called:", code); 
                return this; 
            },
            send: function(data) {
                console.log("Send called:", data);
            }
        };

        await adminController.getStats(req, res);

    } catch (e) {
        console.error("Uncaught exception:", e);
    } finally {
        mongoose.disconnect();
    }
}

runTest();
