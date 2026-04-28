const mongoose = require('mongoose');

const approvalTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false }
}, { timestamps: true });

// Optional: Automatically remove expired tokens from DB after some time
approvalTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ApprovalToken', approvalTokenSchema);
