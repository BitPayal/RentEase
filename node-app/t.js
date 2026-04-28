const mongoose = require('mongoose');
const User = require('./models/User');

async function test() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/test');
    const users = await User.find();
    console.log("Users Array Length:", users.length);
  } catch(e) { console.error(e) }
  process.exit(0);
}
test();
