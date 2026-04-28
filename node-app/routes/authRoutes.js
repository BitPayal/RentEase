const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});
const upload = multer({ storage: storage });

router.post('/register', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.get('/my-profile', authMiddleware, authController.getProfile);
router.post('/upgrade-premium', authMiddleware, authController.upgradePremium);
router.post('/bank-details', authMiddleware, authController.addBankDetails);

// Verification routes
router.post('/send-email-otp', authMiddleware, authController.sendEmailOTP);
router.post('/verify-email-otp', authMiddleware, authController.verifyEmailOTP);
router.post('/send-phone-otp', authMiddleware, authController.sendPhoneOTP);
router.post('/verify-phone-otp', authMiddleware, authController.verifyPhoneOTP);
router.post('/submit-id', authMiddleware, upload.single('idProof'), authController.submitIdProof);

module.exports = router;
