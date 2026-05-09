const User = require('../models/User');
const Item = require('../models/Item');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalItems = await Item.countDocuments();
        const totalBookings = await Booking.countDocuments();
        
        const transactions = await Transaction.find({ status: 'Completed' });
        const totalRevenue = transactions.reduce((acc, t) => acc + (t.platformFee || 0), 0);
        
        res.send({ message: 'success', stats: { totalUsers, totalItems, totalBookings, totalRevenue } });
    } catch(err) { 
        console.error("ADMIN STATS ERROR:", err);
        res.status(500).send({ message: 'Server error', error: err.message }); 
    }
};

exports.getUsers = async (req, res) => {
    try {
        console.log("GET /admin/users called. User query running...");
        const users = await User.find({ $or: [{role: 'user'}, {role: {$exists: false}}] }, '-password');
        if (!users || users.length === 0) {
            return res.send({ message: 'No users found', users: [] });
        }
        res.send({ message: 'success', users });
    } catch(err) { res.status(500).send({ message: 'Server error' }); }
};

exports.banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if(!user) return res.status(404).send({message: 'Not found'});
        user.status = user.status === 'banned' ? 'active' : 'banned';
        await user.save();
        res.send({ message: 'success', user });
    } catch(err) { res.status(500).send({ message: 'Server error' }); }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if(!user) return res.status(404).send({ message: 'User not found' });
        
        await User.findByIdAndDelete(id);
        res.send({ message: 'User deleted successfully' });
    } catch(err) { 
        console.error("Delete user error:", err);
        res.status(500).send({ message: 'Server error' }); 
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // active or banned
        
        if (!['active', 'banned'].includes(status)) {
            return res.status(400).send({ message: 'Invalid status' });
        }
        
        const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
        if(!user) return res.status(404).send({ message: 'User not found' });
        
        res.send({ message: `User status updated to ${status}`, user });
    } catch (err) { 
        console.error("Update user status error:", err);
        res.status(500).send({ message: 'Server error' }); 
    }
};

exports.getPendingVerifications = async (req, res) => {
    try {
        const users = await User.find({ verificationStatus: 'pending' }).select('-password');
        res.send({ message: 'success', users });
    } catch (err) { res.status(500).send({ message: 'Server error' }); }
};

exports.updateVerificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).send({ message: 'Invalid status' });
        }

        const updateData = { verificationStatus: status };
        if (status === 'approved') updateData.isVerified = true;
        
        const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        res.send({ message: `Verification status updated to ${status}`, user });
    } catch (err) { res.status(500).send({ message: 'Server error' }); }
};

exports.getPendingItems = async (req, res) => {
    try {
        const items = await Item.find({ status: { $in: ['pending', 'price_pending', 'final_review'] } }).populate('ownerId', 'username email');
        res.send({ message: 'success', items });
    } catch(err) { res.status(500).send({ message: 'Server error' }); }
};

exports.updateAdminItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        if (req.file) {
            updates.image = req.file.path.replace(/\\/g, "/");
        }
        const item = await Item.findByIdAndUpdate(id, updates, { new: true });
        res.send({ message: 'Item updated successfully', item });
    } catch(err) { 
        console.error("updateAdminItem ERROR:", err);
        res.status(500).send({ message: 'Server error: ' + err.message }); 
    }
};

exports.updateItemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        const item = await Item.findByIdAndUpdate(id, { status }, { new: true });
        res.send({ message: 'success', item });
    } catch(err) { res.status(500).send({ message: 'Server error' }); }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('itemId', 'title')
            .populate('userId', 'username email');
        res.send({ message: 'success', bookings });
    } catch(err) { res.status(500).send({ message: 'Server error' }); }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByIdAndUpdate(id, { status: 'Cancelled' }, { new: true });
        res.send({ message: 'success', booking });
    } catch(err) { res.status(500).send({ message: 'Server error' }); }
};

exports.releaseEscrow = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate('itemId');
        if (!booking || booking.paymentStatus !== 'Held') {
            return res.status(400).send({ message: 'Invalid booking state for payout.' });
        }

        // Mock Razorpay Payout (transfer to owner, refund deposit to renter)
        // Production: Call razorpay.transfers.create({account: user.razorpayAccountId, amount:...})
        
        booking.paymentStatus = 'Payout_Processed';
        booking.status = 'Completed';
        
        // Log transaction payout
        await Transaction.create({
            userId: booking.userId,
            bookingId: booking._id,
            type: 'payout',
            totalAmount: booking.ownerEarning,
            platformFee: booking.platformFee,
            ownerAmount: booking.ownerEarning,
            status: 'Completed',
            razorpayPaymentId: 'tr_mock_payout123'
        });

        const owner = await User.findById(booking.itemId.ownerId);
        if (owner) {
            owner.pendingEarnings -= booking.ownerEarning;
            owner.completedPayouts += booking.ownerEarning;
            await owner.save();
        }

        await booking.save();
        res.send({ message: 'Funds released to owner and deposit refunded successfully!', booking });
    } catch(err) { 
        console.error(err);
        res.status(500).send({ message: 'Server error' }); 
    }
};

exports.refundEscrow = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate('itemId');
        if (!booking || booking.paymentStatus !== 'Held') {
            return res.status(400).send({ message: 'Invalid booking state for refund.' });
        }

        // Mock Razorpay Full Refund due to dispute
        booking.paymentStatus = 'Refunded';
        booking.status = 'Cancelled';
        
        // Remove pending earnings from owner
        const owner = await User.findById(booking.itemId.ownerId);
        if (owner) {
            owner.pendingEarnings -= booking.ownerEarning;
            await owner.save();
        }

        await booking.save();
        res.send({ message: 'Full amount refunded to renter.', booking });
    } catch(err) { 
        console.error(err);
        res.status(500).send({ message: 'Server error' }); 
    }
};

const sendPriceChangeEmail = require('../utils/email');
const crypto = require('crypto');
const ApprovalToken = require('../models/ApprovalToken');

exports.suggestPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { suggestedPrice } = req.body;
        
        const item = await Item.findById(id).populate('ownerId', 'username email');
        if (!item) return res.status(404).send({ message: 'Item not found' });
        
        item.suggestedPrice = suggestedPrice;
        item.status = 'price_pending';
        await item.save();

        if (item.ownerId && item.ownerId.email) {
            // Generate a secure token
            const tokenStr = crypto.randomBytes(32).toString('hex');
            
            // Expiration in 1 hour
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);

            const tokenRecord = new ApprovalToken({
                token: tokenStr,
                itemId: item._id,
                userId: item.ownerId._id,
                expiresAt,
                used: false
            });
            await tokenRecord.save();

            await sendPriceChangeEmail(item.ownerId.email, item.title, item.originalPrice, suggestedPrice, tokenStr);
        }

        res.send({ message: 'Price suggested successfully', item });
    } catch(err) { 
        console.error("Suggest Price Error:", err);
        res.status(500).send({ message: 'Server error' }); 
    }
};
