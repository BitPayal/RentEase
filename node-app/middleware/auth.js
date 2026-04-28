const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) return res.status(401).send({ message: 'No token provided.' });
    
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }
    
    jwt.verify(token, 'MYKEY', (err, decoded) => {
        if (err) return res.status(403).send({ message: 'Failed to authenticate token.' });
        req.user = decoded.data;
        next();
    });
};

module.exports = authMiddleware;
