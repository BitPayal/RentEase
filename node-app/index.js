const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const Favorite = require('./models/Favorite');


// Import Routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authMiddleware = require('./middleware/auth');

const app = express();
const port = 4000;

// Connect to DB
mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(() => console.log('DB Connected'))
    .catch(err => console.log(err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/book', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send("Welcome to RentEase API");
});


app.post('/api/like-product', async (req, res) => {
    try {
        const { userId, productId } = req.body;
        
        let existing = await Favorite.findOne({ userId, itemId: productId });
        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            return res.send({ message: 'Unliked.' });
        }
        
        const like = new Favorite({ userId, itemId: productId });
        await like.save();
        res.send({ message: 'Liked.' });
    } catch (err) {
        res.status(500).send({ message: 'Server Err.' });
    }
});

app.get('/api/liked-items', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const favorites = await Favorite.find({ userId }).populate('itemId');
        const products = favorites.map(f => f.itemId).filter(item => item !== null);
        res.send({ message: 'success', products });
    } catch (err) {
        console.error("Liked Items Error:", err);
        res.status(500).send({ message: err.message || 'Server Err.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});