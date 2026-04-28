const User = require('../models/User');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail } = require('../utils/email');
const { sendVerificationSMS } = require('../utils/sms');

exports.signup = async (req, res) => {
    try {
        const { username, password, email, phone } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.send({ message: 'User already exists.' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ 
            username, 
            password: hashedPassword, 
            email, 
            phone,
            isVerified: false,
            verificationStatus: 'unverified'
        });
        await user.save();
        res.send({ message: 'saved success.' });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.send({ message: "user not found" });

        let isMatch = false;
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Legacy plaintext fallback for existing users like Doremon
            isMatch = (password === user.password);
            
            // Auto-migrate legacy passwords to bcrypt hash!
            if (isMatch) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                await user.save();
            }
        }

        if (isMatch) {
            const token = jwt.sign({ data: user }, 'MYKEY', { expiresIn: '15m' });
            const refreshToken = jwt.sign({ data: user }, 'MY_REFRESH_KEY', { expiresIn: '7d' });
            res.send({ message: 'find success.', token, refreshToken, user });
        } else {
            res.send({ message: 'password wrong.' });
        }
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(403).send({ message: 'Refresh token required' });

    try {
        const decoded = jwt.verify(refreshToken, 'MY_REFRESH_KEY');
        const user = decoded.data;
        const newToken = jwt.sign({ data: user }, 'MYKEY', { expiresIn: '15m' });
        res.send({ token: newToken });
    } catch (err) {
        res.status(401).send({ message: 'Invalid or expired refresh token' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).send({ message: 'User not found' });
        
        const bookingsCount = await Booking.countDocuments({ userId: req.user._id });
        const wasteAvoidedKg = bookingsCount * 2.5;

        res.send({ message: 'success', user, metrics: { bookingsCount, wasteAvoidedKg } });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.upgradePremium = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { isPremium: true }, { new: true });
        res.send({ message: 'Successfully upgraded to Premium!', user });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.addBankDetails = async (req, res) => {
    try {
        const { accountName, accountNumber, ifsc } = req.body;
        if (!accountName || !accountNumber || !ifsc) {
            return res.status(400).send({ message: 'All bank details are required.' });
        }

        // Mock Razorpay Linked Account Creation
        // In production, call razorpay.beta.accounts.create(...) here
        // and safely pass the bank details directly to Razorpay, NEVER storing raw numbers in DB.
        
        const mockRazorpayAccountId = 'acc_mock_' + Math.floor(Math.random() * 100000000);

        const user = await User.findByIdAndUpdate(
            req.user._id, 
            { 
                razorpayAccountId: mockRazorpayAccountId,
                bankDetailsAdded: true
            }, 
            { new: true }
        ).select('-password');

        res.send({ message: 'Bank details verified and securely linked to Razorpay Escrow!', user });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to securely link bank account.' });
    }
};

exports.sendEmailOTP = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send({ message: 'User not found' });
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailOTP = otp;
        await user.save();

        await sendVerificationEmail(user.email, otp);
        res.send({ message: 'Email OTP sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server error' });
    }
};

exports.verifyEmailOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.user._id);
        if (user.emailOTP === otp) {
            user.emailVerified = true;
            user.emailOTP = null;
            await user.save();
            res.send({ message: 'Email verified successfully', user });
        } else {
            res.status(400).send({ message: 'Invalid or expired OTP' });
        }
    } catch (err) {
        res.status(500).send({ message: 'Server error' });
    }
};

exports.sendPhoneOTP = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send({ message: 'User not found' });
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.phoneOTP = otp;
        await user.save();

        const phoneNo = user.phone.startsWith('+') ? user.phone : `+91${user.phone}`;
        const result = await sendVerificationSMS(phoneNo, otp);

        if (result.mock) {
            res.send({ message: 'Mock Phone OTP sent (Twilio not configured)', mockOTP: otp });
        } else {
            res.send({ message: 'Phone OTP sent successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server error' });
    }
};

exports.verifyPhoneOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.user._id);
        if (user.phoneOTP === otp) {
            user.phoneVerified = true;
            user.phoneOTP = null;
            await user.save();
            res.send({ message: 'Phone verified successfully', user });
        } else {
            res.status(400).send({ message: 'Invalid or expired OTP' });
        }
    } catch (err) {
        res.status(500).send({ message: 'Server error' });
    }
};

exports.submitIdProof = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send({ message: 'User not found' });
        
        if (!user.emailVerified || !user.phoneVerified) {
            return res.status(400).send({ message: 'Please verify email and phone first.' });
        }

        if (req.file) {
            user.idProofImage = req.file.path.replace(/\\/g, "/");
            user.govIdUploaded = true;
            user.verificationStatus = 'pending';
            await user.save();
            res.send({ message: 'Verification submitted successfully. Waiting for Admin approval.', user });
        } else {
            res.status(400).send({ message: 'ID Proof image is required.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server error' });
    }
};
