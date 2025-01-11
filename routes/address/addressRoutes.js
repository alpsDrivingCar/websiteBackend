const express = require('express');
const router = express.Router();
const axios = require("axios");
const apiKeyAuth = require('../../Middleware/ApiKeyAuth');
const rateLimit = require('express-rate-limit');
const { body, query, validationResult } = require('express-validator');
const mcache = require('memory-cache');

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Cache middleware
const cache = duration => {
    return (req, res, next) => {
        const key = 'postcode-' + req.query.postcode;
        const cachedBody = mcache.get(key);
        if (cachedBody) {
            return res.json(cachedBody);
        } else {
            res.sendResponse = res.json;
            res.json = (body) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
};

// Validation middleware
const validatePostcode = [
    query('postcode')
        .trim()
        .notEmpty().withMessage('Postcode is required')
        .matches(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i)
        .withMessage('Invalid UK postcode format'),
];

const OS_API_BASE_URL = 'https://api.os.uk/search/places/v1';

router.get("/search",
    limiter,
    apiKeyAuth,
    validatePostcode,
    cache(300), // Cache for 5 minutes
    async (req, res) => {
        // Validation check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.errors[0].msg });
        }

        try {
            const { postcode } = req.query;
            const response = await axios.get(`${OS_API_BASE_URL}/postcode`, {
                params: {
                    postcode: postcode.replace(/\s/g, ''),
                    key: process.env.OS_API_KEY
                },
                timeout: 5000 // 5 second timeout
            });

            const addresses = response.data.results || [];
            const formattedAddresses = addresses.map(address => address.DPA.ADDRESS);

            res.json({ 
                data: formattedAddresses,
                message: 'Addresses retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching addresses:', error);
            res.status(error.response?.status || 500).json({ 
                message: 'Error retrieving addresses',
                error: error.response?.data?.error || error.message 
            });
        }
    }
);

module.exports = router;
