// Analytics Configuration for P.A.I. Trucking

const analyticsConfig = {
    // Google Analytics 4 Configuration
    googleAnalytics: {
        measurementId: process.env.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
        enabled: process.env.GA_ENABLED !== 'false',
        
        // Enhanced ecommerce settings (for future quote tracking)
        enhancedEcommerce: {
            enabled: true,
            currencyCode: 'USD'
        },
        
        // Privacy settings
        privacy: {
            anonymizeIP: true,
            allowGoogleSignals: false,
            allowAdPersonalization: false,
            cookieExpires: 63072000, // 2 years in seconds
            cookieUpdate: true,
            cookieFlags: 'SameSite=None;Secure'
        },
        
        // Custom dimensions (to be configured in GA4)
        customDimensions: {
            userType: 'custom_dimension_1',
            serviceInterest: 'custom_dimension_2',
            trafficSource: 'custom_dimension_3',
            deviceType: 'custom_dimension_4'
        }
    },
    
    // Google Tag Manager Configuration
    googleTagManager: {
        containerId: process.env.GTM_CONTAINER_ID || 'GTM-XXXXXXX',
        enabled: process.env.GTM_ENABLED === 'true',
        
        // Data layer configuration
        dataLayer: {
            name: 'dataLayer',
            gtmAuth: process.env.GTM_AUTH || '',
            gtmPreview: process.env.GTM_PREVIEW || ''
        }
    },
    
    // Hotjar Configuration (Heat mapping)
    hotjar: {
        siteId: process.env.HOTJAR_SITE_ID || '0000000',
        enabled: process.env.HOTJAR_ENABLED === 'true',
        
        // Hotjar settings
        settings: {
            suppressConsoleLogs: process.env.NODE_ENV === 'production',
            suppressUserAgent: true
        }
    },
    
    // Performance Monitoring
    performance: {
        enabled: true,
        
        // Core Web Vitals tracking
        coreWebVitals: {
            enabled: true,
            thresholds: {
                lcp: 2500,  // Largest Contentful Paint (ms)
                fid: 100,   // First Input Delay (ms)
                cls: 0.1    // Cumulative Layout Shift
            }
        },
        
        // Custom performance metrics
        customMetrics: {
            pageLoadTime: true,
            timeToFirstByte: true,
            domContentLoaded: true,
            firstPaint: true,
            firstContentfulPaint: true
        }
    },
    
    // Conversion Tracking
    conversions: {
        // Contact form submission
        contactForm: {
            eventName: 'contact_form_submit',
            value: 100, // Estimated lead value
            currency: 'USD'
        },
        
        // Quote request (future)
        quoteRequest: {
            eventName: 'quote_request',
            value: 500, // Estimated quote value
            currency: 'USD'
        },
        
        // Phone number clicks
        phoneClick: {
            eventName: 'phone_click',
            value: 50,
            currency: 'USD'
        },
        
        // Email clicks
        emailClick: {
            eventName: 'email_click',
            value: 25,
            currency: 'USD'
        }
    },
    
    // Business-specific tracking
    business: {
        // Service interest tracking
        services: [
            'air_freight',
            'ocean_freight', 
            'ground_transportation',
            'warehousing',
            'customs_clearance',
            'distribution'
        ],
        
        // Customer journey stages
        journeyStages: [
            'awareness',      // First visit
            'consideration',  // Viewing services
            'intent',        // Contact form interaction
            'conversion',    // Form submission
            'retention'      // Return visits
        ],
        
        // Lead scoring events
        leadScoring: {
            pageView: 1,
            serviceView: 5,
            contactFormStart: 10,
            contactFormSubmit: 50,
            phoneClick: 25,
            emailClick: 15,
            returnVisit: 10
        }
    },
    
    // Privacy and Compliance
    privacy: {
        // GDPR compliance
        gdpr: {
            enabled: true,
            consentRequired: false, // B2B site, less strict
            cookieBanner: false     // Not required for B2B
        },
        
        // CCPA compliance
        ccpa: {
            enabled: true,
            doNotSellLink: false    // Not applicable for B2B
        },
        
        // Do Not Track respect
        doNotTrack: {
            respect: true,
            fallbackToSessionOnly: true
        }
    },
    
    // Development and Testing
    development: {
        debug: process.env.NODE_ENV !== 'production',
        testMode: process.env.ANALYTICS_TEST_MODE === 'true',
        
        // Local development settings
        local: {
            disableTracking: false,  // Set to true to disable in dev
            mockData: false,         // Use mock analytics data
            verbose: true            // Detailed console logging
        }
    }
};

// Setup instructions for each service
const setupInstructions = {
    googleAnalytics: `
# Google Analytics 4 Setup

1. Create GA4 Property:
   - Go to https://analytics.google.com
   - Create new property for paitrucking.com
   - Set up data streams for website

2. Configure Enhanced Ecommerce:
   - Enable enhanced ecommerce events
   - Set up conversion goals:
     * Contact form submissions
     * Phone number clicks
     * Quote requests

3. Set Custom Dimensions:
   - User Type (New/Returning)
   - Service Interest
   - Traffic Source
   - Device Type

4. Environment Variables:
   GA_MEASUREMENT_ID=G-XXXXXXXXXX
   GA_ENABLED=true
`,

    googleTagManager: `
# Google Tag Manager Setup

1. Create GTM Container:
   - Go to https://tagmanager.google.com
   - Create new container for paitrucking.com
   - Configure workspace

2. Set up Tags:
   - Google Analytics 4 tag
   - Conversion tracking tags
   - Custom event tags

3. Configure Triggers:
   - Page view trigger
   - Form submission trigger
   - Button click triggers
   - Scroll depth triggers

4. Environment Variables:
   GTM_CONTAINER_ID=GTM-XXXXXXX
   GTM_ENABLED=true
`,

    hotjar: `
# Hotjar Setup

1. Create Hotjar Account:
   - Go to https://www.hotjar.com
   - Add paitrucking.com site
   - Get site ID

2. Configure Recordings:
   - Set up session recordings
   - Configure privacy settings
   - Set recording filters

3. Set up Heatmaps:
   - Configure page tracking
   - Set up conversion funnels
   - Create feedback polls

4. Environment Variables:
   HOTJAR_SITE_ID=0000000
   HOTJAR_ENABLED=true
`
};

module.exports = {
    analyticsConfig,
    setupInstructions
};