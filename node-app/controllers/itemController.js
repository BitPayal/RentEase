const Item = require('../models/Item');
const ApprovalToken = require('../models/ApprovalToken');
const applyDynamicPricing = require('../utils/dynamicPricing');

exports.createItem = async (req, res) => {
    try {
        const title = req.body.title || req.body.pname;
        const description = req.body.description || req.body.pdesc;
        const pricePerDay = req.body.pricePerDay || req.body.price;
        const location = req.body.location || req.body.loc;
        const { category, deposit } = req.body;
        const image = req.file ? req.file.path.replace(/\\/g, "/") : '';
        const ownerId = req.user._id;

        const UserObj = require('../models/User');
        const currentUser = await UserObj.findById(ownerId);
        
        if (!currentUser || !currentUser.emailVerified || !currentUser.phoneVerified || currentUser.verificationStatus !== 'approved') {
            return res.status(403).send({ message: 'User not verified. Please complete email, phone, and ID verification.' });
        }

        const product = new Item({ 
            title, description, pricePerDay, category, image, ownerId, 
            deposit: deposit || '0', location, status: 'pending',
            originalPrice: pricePerDay, finalPrice: pricePerDay
        });
        await product.save();
        res.send({ message: 'saved success.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message || 'server err' });
    }
};

exports.getItems = async (req, res) => {
    try {
        const location = req.query.location || '';
        let query = {
            $or: [{ status: 'approved' }, { status: { $exists: false } }]
        };
        
        if (location && location !== 'undefined' && location !== 'null' && location !== 'All Locations') {
            query.$and = [{
                $or: [
                    { location: { $regex: location, $options: 'i' } },
                    { loc: { $regex: location, $options: 'i' } }
                ]
            }];
        }

        const products = await Item.find(query).populate('ownerId', 'username email phone');
        const dynamicResult = applyDynamicPricing(products);
        res.send({ message: 'success', products: dynamicResult });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const product = await Item.findById(req.params.id).populate('ownerId', 'username email phone');
        const dynamicResult = applyDynamicPricing(product);
        res.send({ message: 'success', product: dynamicResult });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.getMyItems = async (req, res) => {
    try {
        const products = await Item.find({ ownerId: req.user._id });
        res.send({ message: 'success', products });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.searchItems = async (req, res) => {
    try {
        const search = req.query.search || '';
        const location = req.query.location || req.query.loc || '';
        const category = req.query.category || '';
        
        let query = {
            $and: [
                { $or: [{ status: 'approved' }, { status: { $exists: false } }] }
            ]
        };

        if (search) {
            query.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { pname: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { pdesc: { $regex: search, $options: 'i' } }
                ]
            });
        }
        
        if (location && location !== 'undefined' && location !== 'null') {
            query.$and.push({
                $or: [
                    { location: { $regex: location, $options: 'i' } },
                    { loc: { $regex: location, $options: 'i' } }
                ]
            });
        }
        
        if (category && category !== 'All Categories' && category !== 'undefined' && category !== 'null') {
            query.$and.push({
                category: category
            });
        }

        const products = await Item.find(query).populate('ownerId', 'username email phone');
        
        const dynamicResult = applyDynamicPricing(products);
        res.send({ message: 'success', products: dynamicResult });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const product = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send({ message: 'updated success', product });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.send({ message: 'deleted success' });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.acceptPrice = async (req, res) => {
    try {
        const item = await Item.findOne({ _id: req.params.id, ownerId: req.user._id });
        if (!item) return res.status(404).send({ message: 'Item not found' });
        if (item.status !== 'price_pending') return res.status(400).send({ message: 'Item not pending price approval' });

        item.pricePerDay = item.suggestedPrice;
        item.finalPrice = item.suggestedPrice;
        item.status = 'final_review';
        await item.save();

        res.send({ message: 'Price accepted, waiting for final admin review', item });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.rejectPrice = async (req, res) => {
    try {
        const item = await Item.findOne({ _id: req.params.id, ownerId: req.user._id });
        if (!item) return res.status(404).send({ message: 'Item not found' });
        if (item.status !== 'price_pending') return res.status(400).send({ message: 'Item not pending price approval' });

        item.status = 'rejected';
        await item.save();

        res.send({ message: 'Price rejected', item });
    } catch (err) {
        res.send({ message: 'server err' });
    }
};

exports.getPriceActionItem = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).send({ message: 'Token is required' });

        const tokenRecord = await ApprovalToken.findOne({ token }).populate('itemId');
        if (!tokenRecord) return res.status(404).send({ message: 'Invalid token' });
        
        if (tokenRecord.used) return res.status(400).send({ message: 'This token has already been used' });
        
        if (new Date() > tokenRecord.expiresAt) return res.status(400).send({ message: 'This link has expired' });

        const item = tokenRecord.itemId;
        if (!item) return res.status(404).send({ message: 'Item not found' });

        res.send({ message: 'success', item });
    } catch (err) {
        console.error("Price Action GET Error:", err);
        res.status(500).send({ message: 'Server error' });
    }
};

exports.handlePriceAction = async (req, res) => {
    try {
        const { token, action } = req.body; // action = 'accept' or 'reject'
        if (!token || !action) return res.status(400).send({ message: 'Token and action are required' });

        const tokenRecord = await ApprovalToken.findOne({ token }).populate('itemId');
        if (!tokenRecord) return res.status(404).send({ message: 'Invalid token' });
        if (tokenRecord.used) return res.status(400).send({ message: 'This token has already been used' });
        if (new Date() > tokenRecord.expiresAt) return res.status(400).send({ message: 'This link has expired' });

        const item = tokenRecord.itemId;
        if (!item) return res.status(404).send({ message: 'Item not found' });
        if (item.status !== 'price_pending') return res.status(400).send({ message: 'Item is not waiting for price approval' });

        if (action === 'accept') {
            item.pricePerDay = item.suggestedPrice;
            item.finalPrice = item.suggestedPrice;
            item.status = 'final_review';
        } else if (action === 'reject') {
            item.status = 'rejected';
        } else {
            return res.status(400).send({ message: 'Invalid action' });
        }

        await item.save();

        // Mark token as used
        tokenRecord.used = true;
        await tokenRecord.save();

        res.send({ message: `Price ${action}ed successfully`, item });
    } catch (err) {
        console.error("Price Action POST Error:", err);
        res.status(500).send({ message: 'Server error' });
    }
};
