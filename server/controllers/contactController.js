const { validationResult } = require('express-validator');
const emailService = require('../utils/emailService');
const logger = require('../utils/logger');

const contactController = {
    /**
     * Submit contact form
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async submitContact(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { name, email, phone, company, service, message } = req.body;

            // Log the contact submission (remove sensitive data for production)
            logger.info('Contact form submission', {
                name,
                email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email for privacy
                company,
                service,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Prepare email data
            const emailData = {
                name,
                email,
                phone: phone || 'Not provided',
                company: company || 'Not provided',
                service: service ? getServiceName(service) : 'General Inquiry',
                message,
                submittedAt: new Date().toISOString(),
                userAgent: req.get('User-Agent'),
                ip: req.ip
            };

            // Send email notification
            await emailService.sendContactFormEmail(emailData);

            // Send auto-reply to customer
            await emailService.sendAutoReply(email, name);

            // Success response
            res.status(200).json({
                success: true,
                message: 'Thank you for your inquiry! We will contact you within 24 hours.',
                data: {
                    submittedAt: emailData.submittedAt,
                    referenceId: generateReferenceId()
                }
            });

        } catch (error) {
            logger.error('Contact form submission error', error);
            
            res.status(500).json({
                success: false,
                message: 'Sorry, there was an error submitting your request. Please try again or call us directly at (718) 712-2700.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

/**
 * Convert service code to readable name
 * @param {string} serviceCode - Service code from form
 * @returns {string} - Human readable service name
 */
function getServiceName(serviceCode) {
    const serviceMap = {
        'logistics': 'Complex Logistics Solutions',
        'import-export': 'Imports & Exports',
        'air-ocean': 'Air & Ocean Freight',
        'multimodal': 'Multimodal Transportation',
        'supply-chain': 'Supply Chain Management',
        'bonded': 'Bonded Container Station'
    };
    
    return serviceMap[serviceCode] || 'General Inquiry';
}

/**
 * Generate a unique reference ID for the inquiry
 * @returns {string} - Reference ID
 */
function generateReferenceId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `PAI-${timestamp}-${randomPart}`.toUpperCase();
}

module.exports = contactController;