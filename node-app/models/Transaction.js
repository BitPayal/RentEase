const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    type: { type: String, enum: ['payment', 'refund', 'payout'], required: true, default: 'payment' },
    totalAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    ownerAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
    razorpayPaymentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
