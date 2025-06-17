const crypto = require('crypto');

// CSRF Token generation and validation
class CSRFProtection {
    constructor() {
        this.tokens = new Map();
        this.tokenExpiry = 60 * 60 * 1000; // 1 hour
    }

    generateToken(sessionId) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + this.tokenExpiry;
        
        this.tokens.set(token, {
            sessionId,
            expiry
        });
        
        // Clean up expired tokens
        this.cleanupExpiredTokens();
        
        return token;
    }

    validateToken(token, sessionId) {
        const tokenData = this.tokens.get(token);
        
        if (!tokenData) {
            return false;
        }
        
        if (tokenData.expiry < Date.now()) {
            this.tokens.delete(token);
            return false;
        }
        
        if (tokenData.sessionId !== sessionId) {
            return false;
        }
        
        // Token is valid, delete it (one-time use)
        this.tokens.delete(token);
        return true;
    }

    cleanupExpiredTokens() {
        const now = Date.now();
        for (const [token, data] of this.tokens.entries()) {
            if (data.expiry < now) {
                this.tokens.delete(token);
            }
        }
    }
}

const csrfProtection = new CSRFProtection();

// Middleware to generate CSRF token
const generateCSRFToken = (req, res, next) => {
    if (req.session) {
        req.csrfToken = () => csrfProtection.generateToken(req.sessionID);
    }
    next();
};

// Middleware to validate CSRF token
const validateCSRFToken = (req, res, next) => {
    // Skip CSRF check for GET requests
    if (req.method === 'GET') {
        return next();
    }

    // Skip for API health check
    if (req.path === '/api/health') {
        return next();
    }

    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!token) {
        return res.status(403).json({
            success: false,
            message: 'CSRF token missing'
        });
    }

    if (!csrfProtection.validateToken(token, req.sessionID)) {
        return res.status(403).json({
            success: false,
            message: 'Invalid CSRF token'
        });
    }

    next();
};

// Endpoint to get CSRF token
const getCSRFToken = (req, res) => {
    if (!req.session) {
        return res.status(500).json({
            success: false,
            message: 'Session not configured'
        });
    }

    const token = req.csrfToken();
    res.json({
        success: true,
        csrfToken: token
    });
};

module.exports = {
    generateCSRFToken,
    validateCSRFToken,
    getCSRFToken
};