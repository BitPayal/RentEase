const Booking = require('../models/Booking');
const Item = require('../models/Item');

exports.bookItem = async (req, res) => {
    try {
        const { itemId, startDate, endDate } = req.body;
        const userId = req.user._id;

        if (!startDate || !endDate) return res.status(400).send({ message: 'Dates are required' });

        const item = await Item.findById(itemId);
        if (!item) return res.status(404).send({ message: 'Item not found' });

        const dbUser = await require('../models/User').findById(req.user._id);
        if (dbUser.verificationStatus !== 'approved') {
            return res.status(403).send({ message: 'User verification is required to book items. Please complete verification and wait for admin approval.' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) return res.status(400).send({ message: 'Invalid dates' });

        const priceNum = parseFloat(item.pricePerDay || item.price) || 0;
        const rentAmount = diffDays * priceNum;
        const depositAmount = parseFloat(item.deposit) || 0;
        
        // 10% Commission deducted from Rent
        const platformFee = rentAmount * 0.10;
        const ownerEarning = rentAmount - platformFee;
        
        const totalPrice = rentAmount + depositAmount; // total paid by user

        const booking = new Booking({
            itemId: itemId, 
            userId,
            startDate: start,
            endDate: end,
            totalPrice, 
            rentAmount,
            depositAmount,
            platformFee,
            ownerEarning,
            status: 'Pending',
            paymentStatus: 'Pending'
        });

        await booking.save();
        res.send({ message: 'Booking confirmed successfully!', booking });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Booking failed.', error: err });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).populate('itemId');
        res.send({ message: 'success', rentals: bookings });
    } catch (err) {
        res.status(500).send({ message: 'Error fetching bookings', error: err });
    }
};

exports.getOwnerBookings = async (req, res) => {
    try {
        // Find all items owned by the current user
        const items = await Item.find({ ownerId: req.user._id }).select('_id');
        const itemIds = items.map(item => item._id);

        // Find all bookings mapped to those items
        const bookings = await Booking.find({ itemId: { $in: itemIds } })
            .populate('itemId', 'title image pricePerDay deposit pimage') // Support new and legacy image field
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });

        res.send({ message: 'success', bookings });
    } catch (err) {
        console.error("Error fetching owner bookings:", err);
        res.status(500).send({ message: 'Server error' });
    }
};
