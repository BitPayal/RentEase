const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });

router.post('/create', authMiddleware, upload.single('image'), itemController.createItem);

router.get('/', itemController.getItems);
router.get('/my-items', authMiddleware, itemController.getMyItems);
router.get('/search', itemController.searchItems);
router.get('/price-action', itemController.getPriceActionItem);
router.post('/price-action', itemController.handlePriceAction);
router.get('/:id', itemController.getItemById);
router.put('/:id', authMiddleware, itemController.updateItem);
router.put('/:id/accept-price', authMiddleware, itemController.acceptPrice);
router.put('/:id/reject-price', authMiddleware, itemController.rejectPrice);
router.delete('/:id', authMiddleware, itemController.deleteItem);

module.exports = router;
