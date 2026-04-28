const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
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

// Add an inline middleware to check if user isAdmin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send({ message: 'Admin access required.' });
    }
};

router.use(authMiddleware);
router.use(isAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.post('/users/:id/ban', adminController.banUser);
router.get('/items/pending', adminController.getPendingItems);
router.post('/items/:id/status', adminController.updateItemStatus);
router.post('/items/:id/suggest-price', adminController.suggestPrice);
router.put('/items/:id', upload.single('image'), adminController.updateAdminItem);

// Verifications
router.get('/verifications/pending', adminController.getPendingVerifications);
router.post('/verifications/:id/status', adminController.updateVerificationStatus);

router.get('/bookings', adminController.getAllBookings);
router.post('/bookings/:id/cancel', adminController.cancelBooking);
router.post('/bookings/:id/release', adminController.releaseEscrow);
router.post('/bookings/:id/refund', adminController.refundEscrow);

module.exports = router;
