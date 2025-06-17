const express = require('express');
const { body, validationResult } = require('express-validator');
const contactController = require('../controllers/contactController');

const router = express.Router();

// Validation rules for contact form
const contactValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s\-'\.]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),
    
    body('phone')
        .optional({ checkFalsy: true })
        .matches(/^[\+]?[1-9]?[\d\s\-\(\)]{10,}$/)
        .withMessage('Please provide a valid phone number'),
    
    body('company')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 200 })
        .withMessage('Company name must be less than 200 characters'),
    
    body('service')
        .optional({ checkFalsy: true })
        .isIn(['logistics', 'import-export', 'air-ocean', 'multimodal', 'supply-chain', 'bonded'])
        .withMessage('Please select a valid service type'),
    
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters'),
    
    // Honeypot field for spam detection
    body('bot-field')
        .optional()
        .custom((value) => {
            if (value && value.length > 0) {
                throw new Error('Spam detected');
            }
            return true;
        })
];

// POST /api/contact - Submit contact form
router.post('/', contactValidation, contactController.submitContact);

// GET /api/contact/test - Test endpoint (development only)
if (process.env.NODE_ENV === 'development') {
    router.get('/test', (req, res) => {
        res.json({
            message: 'Contact API is working',
            timestamp: new Date().toISOString()
        });
    });
}

module.exports = router;