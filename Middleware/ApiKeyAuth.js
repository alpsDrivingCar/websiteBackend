const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.APIS_ACCESS_KEY) {
        return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
    }
    
    next();
};

module.exports = apiKeyAuth;
