const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Item = require('../models/Item');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey',
    key_secret: process.env.RAZORPAY_SECRET || 'mocksecret'
});

exports.createOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).send({ message: 'Booking not found' });

        const options = {
            amount: booking.totalPrice * 100, // paise
            currency: 'INR',
            receipt: `receipt_order_${bookingId}`
        };

        let order;
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_mockkey') {
            order = await razorpay.orders.create(options);
        } else {
            // Mock order creation for development
            order = {
                id: 'order_mock_' + crypto.randomBytes(8).toString('hex'),
                amount: options.amount,
                currency: options.currency,
                receipt: options.receipt,
                status: 'created'
            };
        }

        let transaction = await Transaction.findOne({ bookingId });
        if (!transaction) {
            transaction = new Transaction({
                userId: req.user._id,
                bookingId: bookingId,
                totalAmount: booking.totalPrice,
                platformFee: booking.platformFee,
                ownerAmount: booking.ownerEarning,
                status: 'Pending',
                razorpayPaymentId: order.id
            });
            await transaction.save();
        } else {
            transaction.razorpayPaymentId = order.id;
            await transaction.save();
        }

        res.send({ 
            message: 'Order created', 
            order, 
            key_id: process.env.RAZORPAY_KEY_ID // Supply key to frontend safely
        });
    } catch (err) {
        res.status(500).send({ message: 'Error creating order', error: err.message || err });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const secret = process.env.RAZORPAY_SECRET;
        if (!secret) {
            return res.status(500).send({ message: 'Razorpay secret missing on backend configuration.' });
        }

        // Generate expected HMAC signature properly
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        // Strictly verify signature equality
        if (expectedSignature === razorpay_signature) {
            const transaction = await Transaction.findOne({ razorpayPaymentId: razorpay_order_id });
            if (transaction) {
                transaction.status = 'Completed';
                await transaction.save();

                const booking = await Booking.findById(transaction.bookingId);
                if (booking) {
                    booking.status = 'Active';
                    booking.paymentStatus = 'Held'; // Lock funds in escrow
                    await booking.save();

                    const item = await Item.findById(booking.itemId);
                    const owner = await User.findById(item.ownerId);
                    if (owner) {
                        owner.pendingEarnings += booking.ownerEarning;
                        await owner.save();
                    }
                }
            }
            res.send({ message: 'Payment verified successfully' });
        } else {
            res.status(400).send({ message: 'Invalid payment signature' });
        }
    } catch (err) {
        console.error("Verification error: ", err);
        res.status(500).send({ message: 'Error verifying payment', error: err.message || err });
    }
};

exports.demoPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).send({ message: 'Booking not found' });
        
        booking.status = 'Active';
        booking.paymentStatus = 'Held';
        booking.isDemoPayment = true;
        await booking.save();

        let transaction = await Transaction.findOne({ bookingId });
        if (!transaction) {
            transaction = new Transaction({
                userId: req.user._id,
                bookingId: bookingId,
                totalAmount: booking.totalPrice || 0,
                platformFee: booking.platformFee || 0,
                ownerAmount: booking.ownerEarning || 0,
                status: 'Completed',
                razorpayPaymentId: 'demo_txn_' + Date.now()
            });
        } else {
            transaction.status = 'Completed';
            transaction.razorpayPaymentId = 'demo_txn_' + Date.now();
        }
        await transaction.save();

        const item = await Item.findById(booking.itemId);
        const owner = await User.findById(item.ownerId);
        if (owner) {
            owner.pendingEarnings += booking.ownerEarning;
            await owner.save();
        }

        res.send({ message: 'Demo Payment Successful', booking });
    } catch (err) {
        console.error("Demo Payment error: ", err);
        res.status(500).send({ message: 'Error processing demo payment', error: err.message || err });
    }
};
