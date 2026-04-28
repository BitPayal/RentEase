const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

router.post('/send-message', authMiddleware, chatController.sendMessage);
router.get('/:itemId/:chatUserId', authMiddleware, chatController.getMessages);

module.exports = router;
