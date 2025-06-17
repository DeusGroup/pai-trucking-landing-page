// Security configuration for production deployment

const securityConfig = {
    // Session configuration
    session: {
        secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
        name: 'pai_session',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'strict'
        }
    },

    // Enhanced Helmet configuration
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 
                    "https://www.googletagmanager.com", 
                    "https://www.google-analytics.com",
                    "https://www.google.com/recaptcha/",
                    "https://www.gstatic.com/recaptcha/"
                ],
                imgSrc: ["'self'", "data:", "https:", "http:"],
                connectSrc: ["'self'", 
                    "https://www.google-analytics.com",
                    "https://www.google.com/recaptcha/",
                    "https://analytics.google.com"
                ],
                fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
                frameSrc: ["'self'", "https://www.google.com/recaptcha/"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                manifestSrc: ["'self'"],
                workerSrc: ["'self'"],
                formAction: ["'self'"],
                frameAncestors: ["'none'"],
                baseUri: ["'self'"],
                upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
            }
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        referrerPolicy: {
            policy: 'strict-origin-when-cross-origin'
        }
    },

    // CORS configuration
    cors: {
        origin: function(origin, callback) {
            const allowedOrigins = process.env.NODE_ENV === 'production' 
                ? [
                    'https://deusgroup.github.io',
                    'https://paitrucking.com',
                    'https://www.paitrucking.com'
                  ]
                : [
                    'http://localhost:8000',
                    'http://127.0.0.1:8000',
                    'http://localhost:3000'
                  ];
            
            // Allow requests with no origin (mobile apps, postman, etc)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        optionsSuccessStatus: 200,
        maxAge: 86400 // 24 hours
    },

    // Rate limiting configurations
    rateLimiting: {
        general: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                res.status(429).json({
                    success: false,
                    message: 'Too many requests, please try again later.',
                    retryAfter: req.rateLimit.resetTime
                });
            }
        },
        contact: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // limit each IP to 5 contact form submissions
            skipSuccessfulRequests: false,
            message: 'Too many contact form submissions, please try again later.',
            standardHeaders: true,
            legacyHeaders: false
        },
        auth: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10, // limit each IP to 10 auth attempts
            skipSuccessfulRequests: true,
            message: 'Too many authentication attempts, please try again later.'
        }
    },

    // Security headers
    securityHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'X-DNS-Prefetch-Control': 'off',
        'X-Download-Options': 'noopen',
        'X-Permitted-Cross-Domain-Policies': 'none',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
    },

    // Input validation rules
    validation: {
        maxFieldLength: 2000,
        maxEmailLength: 255,
        maxNameLength: 100,
        maxPhoneLength: 20,
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        maxFileSize: 5 * 1024 * 1024 // 5MB
    },

    // Monitoring and logging
    monitoring: {
        logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        logRequests: true,
        logErrors: true,
        logSecurityEvents: true
    }
};

module.exports = securityConfig;