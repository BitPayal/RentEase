const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    pname: String, 
    pdesc: String, 
    price: String, 
    category: String, 
    pimage: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deposit: String,
    availabilityStatus: { type: String, default: 'Available' }
});

module.exports = mongoose.model('Product', productSchema);
