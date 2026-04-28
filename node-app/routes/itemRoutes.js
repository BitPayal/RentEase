const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
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

router.post('/', authMiddleware, upload.single('image'), itemController.addItem);
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
