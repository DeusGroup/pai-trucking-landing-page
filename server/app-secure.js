const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const https = require('https');
const http = require('http');

// Load environment variables
require('dotenv').config();

// Import configurations
const securityConfig = require('./config/security');
const { httpsConfig } = require('./config/https');

// Import routes
const contactRoutes = require('./routes/contact');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const securityHeaders = require('./middleware/security');
const { generateCSRFToken, validateCSRFToken, getCSRFToken } = require('./middleware/csrf');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

// Trust proxy for rate limiting and HTTPS
app.set('trust proxy', 1);

// Cookie parser (must be before session)
app.use(cookieParser());

// Session configuration
app.use(session(securityConfig.session));

// HTTPS redirect middleware
app.use(httpsConfig.redirectToHTTPS);

// Let's Encrypt verification
app.use(httpsConfig.letsEncryptVerification);

// Enhanced security with Helmet
app.use(helmet(securityConfig.helmet));

// CORS configuration
app.use(cors(securityConfig.cors));

// Rate limiting
const limiter = rateLimit(securityConfig.rateLimiting.general);
app.use(limiter);

// Stricter rate limiting for contact form
const contactLimiter = rateLimit(securityConfig.rateLimiting.contact);

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom security headers
app.use((req, res, next) => {
    // Apply security headers from config
    Object.entries(securityConfig.securityHeaders).forEach(([header, value]) => {
        res.setHeader(header, value);
    });
    
    // Remove server signature
    res.removeHeader('X-Powered-By');
    
    next();
});

// CSRF protection
app.use(generateCSRFToken);

// Serve static files with security headers
app.use(express.static(path.join(__dirname, '..'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    etag: true,
    setHeaders: (res, filePath) => {
        // Set security headers for static files
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else if (filePath.match(/\.(js|css)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else if (filePath.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
}));

// Health check endpoint (no CSRF required)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        secure: req.secure || req.get('X-Forwarded-Proto') === 'https',
        memory: process.memoryUsage(),
        version: require('../package.json').version
    });
});

// CSRF token endpoint
app.get('/api/csrf-token', getCSRFToken);

// API routes with CSRF protection
app.use('/api/contact', contactLimiter, validateCSRFToken, contactRoutes);

// Security headers for API responses
app.use('/api/*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Create servers
const httpServer = http.createServer(app);

// Start servers
if (process.env.NODE_ENV === 'production' && httpsConfig.hasSSLCertificates()) {
    // Production with SSL
    const sslConfig = httpsConfig.getSSLConfig();
    if (sslConfig) {
        const httpsServer = https.createServer(sslConfig, app);
        
        // Start HTTPS server
        httpsServer.listen(HTTPS_PORT, () => {
            console.log(`🔒 P.A.I. Trucking HTTPS Server running on port ${HTTPS_PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Health check: https://localhost:${HTTPS_PORT}/api/health`);
        });
        
        // Start HTTP server for redirect
        httpServer.listen(PORT, () => {
            console.log(`🔄 HTTP redirect server running on port ${PORT}`);
        });
    } else {
        // Fallback to HTTP if SSL config fails
        startHTTPServer();
    }
} else {
    // Development or no SSL certificates
    startHTTPServer();
}

function startHTTPServer() {
    httpServer.listen(PORT, () => {
        console.log(`🚛 P.A.I. Trucking Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        
        if (process.env.NODE_ENV === 'production') {
            console.warn('⚠️  Running in production without SSL! Configure SSL certificates for security.');
        }
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        console.log('✅ HTTP server closed');
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    httpServer.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = app;