// Google Analytics 4 and Enhanced Tracking Implementation

class AnalyticsManager {
    constructor(config = {}) {
        this.config = {
            gtag: config.gtag || 'GA_MEASUREMENT_ID', // Replace with actual GA4 ID
            gtm: config.gtm || 'GTM_CONTAINER_ID', // Replace with actual GTM ID
            hotjar: config.hotjar || 'HOTJAR_SITE_ID',
            debug: config.debug || false,
            ...config
        };
        
        this.initialized = false;
        this.queue = [];
        
        // Initialize analytics
        this.init();
    }
    
    async init() {
        try {
            // Initialize Google Analytics 4
            await this.initGoogleAnalytics();
            
            // Initialize Google Tag Manager (optional)
            if (this.config.gtm !== 'GTM_CONTAINER_ID') {
                await this.initGoogleTagManager();
            }
            
            // Initialize Hotjar (optional)
            if (this.config.hotjar !== 'HOTJAR_SITE_ID') {
                await this.initHotjar();
            }
            
            // Set up enhanced tracking
            this.setupEnhancedTracking();
            
            this.initialized = true;
            
            // Process queued events
            this.processQueue();
            
            this.log('Analytics initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize analytics:', error);
        }
    }
    
    // Initialize Google Analytics 4
    async initGoogleAnalytics() {
        return new Promise((resolve) => {
            // Load gtag script
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.gtag}`;
            document.head.appendChild(script);
            
            script.onload = () => {
                // Initialize gtag
                window.dataLayer = window.dataLayer || [];
                window.gtag = function() {
                    dataLayer.push(arguments);
                };
                
                gtag('js', new Date());
                gtag('config', this.config.gtag, {
                    // Enhanced ecommerce settings
                    send_page_view: true,
                    // Privacy settings
                    anonymize_ip: true,
                    allow_google_signals: false,
                    allow_ad_personalization_signals: false
                });
                
                this.log('Google Analytics 4 loaded');
                resolve();
            };
        });
    }
    
    // Initialize Google Tag Manager
    async initGoogleTagManager() {
        return new Promise((resolve) => {
            // Load GTM script
            const script = document.createElement('script');
            script.innerHTML = `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${this.config.gtm}');
            `;
            document.head.appendChild(script);
            
            // Add noscript fallback
            const noscript = document.createElement('noscript');
            noscript.innerHTML = `
                <iframe src="https://www.googletagmanager.com/ns.html?id=${this.config.gtm}"
                        height="0" width="0" style="display:none;visibility:hidden"></iframe>
            `;
            document.body.insertBefore(noscript, document.body.firstChild);
            
            this.log('Google Tag Manager loaded');
            resolve();
        });
    }
    
    // Initialize Hotjar
    async initHotjar() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.innerHTML = `
                (function(h,o,t,j,a,r){
                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                    h._hjSettings={hjid:${this.config.hotjar},hjsv:6};
                    a=o.getElementsByTagName('head')[0];
                    r=o.createElement('script');r.async=1;
                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                    a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `;
            document.head.appendChild(script);
            
            this.log('Hotjar loaded');
            resolve();
        });
    }
    
    // Set up enhanced tracking
    setupEnhancedTracking() {
        // Track page views for SPAs
        this.trackPageView();
        
        // Track scroll depth
        this.trackScrollDepth();
        
        // Track form interactions
        this.trackFormInteractions();
        
        // Track button clicks
        this.trackButtonClicks();
        
        // Track file downloads
        this.trackFileDownloads();
        
        // Track external links
        this.trackExternalLinks();
        
        // Track search functionality
        this.trackSearch();
        
        // Track performance metrics
        this.trackPerformance();
    }
    
    // Track page views
    trackPageView(path = null, title = null) {
        const data = {
            page_path: path || window.location.pathname,
            page_title: title || document.title,
            page_location: window.location.href
        };
        
        this.track('page_view', data);
    }
    
    // Track scroll depth
    trackScrollDepth() {
        const thresholds = [25, 50, 75, 90, 100];
        const tracked = new Set();
        
        const checkScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !tracked.has(threshold)) {
                    tracked.add(threshold);
                    this.track('scroll', {
                        percent_scrolled: threshold
                    });
                }
            });
        };
        
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    checkScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    // Track form interactions
    trackFormInteractions() {
        // Contact form tracking
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            // Form start
            contactForm.addEventListener('focusin', (e) => {
                if (e.target.matches('input, textarea, select')) {
                    this.track('form_start', {
                        form_name: 'contact_form'
                    });
                }
            }, { once: true });
            
            // Form submission
            contactForm.addEventListener('submit', () => {
                this.track('form_submit', {
                    form_name: 'contact_form'
                });
            });
            
            // Field completion tracking
            const fields = contactForm.querySelectorAll('input[required], textarea[required]');
            fields.forEach(field => {
                field.addEventListener('blur', () => {
                    if (field.value.trim()) {
                        this.track('form_field_complete', {
                            form_name: 'contact_form',
                            field_name: field.name || field.id
                        });
                    }
                });
            });
        }
    }
    
    // Track button clicks
    trackButtonClicks() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn, [role="button"]')) {
                const buttonText = e.target.textContent.trim().slice(0, 50);
                const buttonId = e.target.id || 'unnamed';
                
                this.track('button_click', {
                    button_text: buttonText,
                    button_id: buttonId
                });
            }
        });
    }
    
    // Track file downloads
    trackFileDownloads() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const fileExtensions = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z)$/i;
                if (fileExtensions.test(link.href)) {
                    this.track('file_download', {
                        file_name: link.href.split('/').pop(),
                        file_url: link.href
                    });
                }
            }
        });
    }
    
    // Track external links
    trackExternalLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.hostname !== window.location.hostname) {
                this.track('external_link_click', {
                    link_url: link.href,
                    link_text: link.textContent.trim().slice(0, 50)
                });
            }
        });
    }
    
    // Track search functionality
    trackSearch() {
        // If you add search functionality later
        const searchForms = document.querySelectorAll('form[role="search"], .search-form');
        searchForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const searchInput = form.querySelector('input[type="search"], input[name*="search"]');
                if (searchInput) {
                    this.track('search', {
                        search_term: searchInput.value.trim()
                    });
                }
            });
        });
    }
    
    // Track performance metrics
    trackPerformance() {
        window.addEventListener('load', () => {
            // Use Performance Observer if available
            if ('PerformanceObserver' in window) {
                // Track Largest Contentful Paint
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    this.track('performance_metric', {
                        metric_name: 'largest_contentful_paint',
                        metric_value: Math.round(lastEntry.startTime)
                    });
                }).observe({ type: 'largest-contentful-paint', buffered: true });
                
                // Track First Input Delay
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.track('performance_metric', {
                            metric_name: 'first_input_delay',
                            metric_value: Math.round(entry.processingStart - entry.startTime)
                        });
                    });
                }).observe({ type: 'first-input', buffered: true });
            }
            
            // Fallback to Navigation Timing
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    this.track('performance_metric', {
                        metric_name: 'page_load_time',
                        metric_value: Math.round(navigation.loadEventEnd - navigation.fetchStart)
                    });
                }
            }, 1000);
        });
    }
    
    // Generic event tracking
    track(eventName, parameters = {}) {
        if (!this.initialized) {
            this.queue.push({ eventName, parameters });
            return;
        }
        
        try {
            // Google Analytics 4
            if (window.gtag) {
                gtag('event', eventName, parameters);
            }
            
            // Custom event for other tracking
            window.dispatchEvent(new CustomEvent('analytics_track', {
                detail: { eventName, parameters }
            }));
            
            this.log('Tracked event:', eventName, parameters);
            
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    }
    
    // Process queued events
    processQueue() {
        while (this.queue.length > 0) {
            const { eventName, parameters } = this.queue.shift();
            this.track(eventName, parameters);
        }
    }
    
    // Custom conversion tracking
    trackConversion(type, value = null) {
        const conversionData = {
            conversion_type: type,
            timestamp: new Date().toISOString()
        };
        
        if (value) {
            conversionData.value = value;
        }
        
        this.track('conversion', conversionData);
    }
    
    // Track business-specific events
    trackBusinessEvent(action, details = {}) {
        const businessEvents = {
            quote_request: 'Quote Request Started',
            contact_form: 'Contact Form Submitted', 
            phone_click: 'Phone Number Clicked',
            service_view: 'Service Page Viewed'
        };
        
        this.track('business_action', {
            action_type: action,
            action_name: businessEvents[action] || action,
            ...details
        });
    }
    
    // Debug logging
    log(...args) {
        if (this.config.debug) {
            console.log('[Analytics]', ...args);
        }
    }
}

// Initialize analytics when DOM is ready
if (typeof window !== 'undefined') {
    let analytics;
    
    const initAnalytics = () => {
        // Check for Do Not Track
        if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
            console.log('Analytics disabled due to Do Not Track setting');
            return;
        }
        
        // Get configuration from environment or meta tags
        const config = {
            gtag: document.querySelector('meta[name="ga-measurement-id"]')?.content || 'GA_MEASUREMENT_ID',
            gtm: document.querySelector('meta[name="gtm-container-id"]')?.content || 'GTM_CONTAINER_ID',
            hotjar: document.querySelector('meta[name="hotjar-site-id"]')?.content || 'HOTJAR_SITE_ID',
            debug: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        };
        
        analytics = new AnalyticsManager(config);
        window.analytics = analytics;
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnalytics);
    } else {
        initAnalytics();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}