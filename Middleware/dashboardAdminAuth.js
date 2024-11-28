const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET); // Match TOKEN_SECRET
        if (decoded.roles.includes('admin')  || decoded.roles.includes('supervisor')) { // Ensure the user is an admin
            console.log("RAN THROUGH AUTHENTICATE ADMIN")
            next();
        } else {
            return res.status(403).json({ message: 'Forbidden: Invalid role' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = authenticateAdmin;
