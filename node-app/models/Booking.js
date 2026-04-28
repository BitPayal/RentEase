const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true }, // Deprecated but kept for safety
    rentAmount: { type: Number, required: true, default: 0 },
    depositAmount: { type: Number, required: true, default: 0 },
    platformFee: { type: Number, required: true, default: 0 },
    ownerEarning: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['Pending', 'Active', 'Completed', 'Cancelled'], default: 'Pending' },
    paymentStatus: { type: String, enum: ['Pending', 'Held', 'Refunded', 'Payout_Processed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
