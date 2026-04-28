const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'banned'], default: 'active' },
    totalEarnings: { type: Number, default: 0 },
    pendingEarnings: { type: Number, default: 0 },
    completedPayouts: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    razorpayAccountId: { type: String }, // For Razorpay Route Escrow payouts
    bankDetailsAdded: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['unverified', 'pending', 'approved', 'rejected'], default: 'unverified' },
    isVerified: { type: Boolean, default: false },
    govIdUploaded: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    idProofImage: { type: String },
    emailOTP: { type: String },
    phoneOTP: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
