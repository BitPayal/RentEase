const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, productId, text } = req.body;
        const message = new Message({
            senderId: req.user._id, receiverId, productId, text
        });
        await message.save();
        res.send({ message: 'sent' });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, chatUserId } = req.params;

        const messages = await Message.find({
            productId,
            $or: [
                { senderId: userId, receiverId: chatUserId },
                { senderId: chatUserId, receiverId: userId }
            ]
        }).sort('createdAt');
        res.send({ messages });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};
