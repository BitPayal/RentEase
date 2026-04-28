const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, bookingController.bookItem);
router.get('/my-bookings', authMiddleware, bookingController.getMyBookings);
router.get('/owner-bookings', authMiddleware, bookingController.getOwnerBookings);

module.exports = router;
