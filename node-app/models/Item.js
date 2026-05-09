const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: String, 
    description: String, 
    pricePerDay: Number, 
    originalPrice: Number,
    suggestedPrice: Number,
    finalPrice: Number,
    category: String, 
    image: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deposit: Number,
    location: String,
    status: { type: String, enum: ['pending', 'price_pending', 'final_review', 'approved', 'rejected'], default: 'pending' },
    priceSuggestionStatus: { type: String, enum: ['pending', 'accepted', 'rejected'] }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
