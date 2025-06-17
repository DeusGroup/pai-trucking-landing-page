# Analytics Setup Guide for P.A.I. Trucking

## Overview
This guide covers setting up comprehensive analytics and tracking for the P.A.I. Trucking website, including Google Analytics 4, conversion tracking, and performance monitoring.

## 1. Google Analytics 4 Setup

### Step 1: Create GA4 Property
1. Go to [Google Analytics](https://analytics.google.com)
2. Click "Create Property"
3. Enter property details:
   - **Property name**: P.A.I. Trucking Corporation
   - **Reporting time zone**: Eastern Time (US & Canada)
   - **Currency**: US Dollar
4. Select "Web" for platform
5. Enter website URL: `https://paitrucking.com`
6. Copy your **Measurement ID** (starts with G-)

### Step 2: Configure Data Streams
1. In GA4, go to Admin → Data Streams
2. Select your web stream
3. Enable Enhanced measurement:
   - ✅ Page views
   - ✅ Scrolls
   - ✅ Outbound clicks
   - ✅ Site search
   - ✅ Video engagement
   - ✅ File downloads

### Step 3: Set Up Conversions
1. Go to Configure → Events
2. Mark these events as conversions:
   - `contact_form_submit`
   - `phone_click`
   - `email_click`
   - `quote_request` (for future)

### Step 4: Create Custom Dimensions
1. Go to Configure → Custom definitions
2. Create these custom dimensions:
   - **User Type**: Scope = User, Parameter = `user_type`
   - **Service Interest**: Scope = Event, Parameter = `service_interest`
   - **Lead Source**: Scope = Session, Parameter = `lead_source`

### Step 5: Configure Goals
1. Go to Configure → Conversions
2. Set up conversion values:
   - Contact form: $100
   - Phone click: $50
   - Email click: $25

## 2. Google Tag Manager Setup (Optional but Recommended)

### Step 1: Create GTM Container
1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Create new container:
   - **Container name**: P.A.I. Trucking
   - **Target platform**: Web
3. Copy your **Container ID** (starts with GTM-)

### Step 2: Install GTM Code
The code is already integrated in our analytics.js file.

### Step 3: Configure Tags
1. **Google Analytics 4 Configuration Tag**:
   - Tag type: Google Analytics: GA4 Configuration
   - Measurement ID: Your GA4 ID
   - Trigger: All Pages

2. **Contact Form Submission**:
   - Tag type: Google Analytics: GA4 Event
   - Event name: `contact_form_submit`
   - Trigger: Form submission

3. **Phone Click Tracking**:
   - Tag type: Google Analytics: GA4 Event
   - Event name: `phone_click`
   - Trigger: Click on phone links

## 3. Hotjar Setup (Heat Maps & Session Recording)

### Step 1: Create Hotjar Account
1. Go to [Hotjar](https://www.hotjar.com)
2. Sign up for account
3. Add site: `paitrucking.com`
4. Copy your **Site ID**

### Step 2: Configure Settings
1. **Recordings**:
   - Enable session recordings
   - Set sample rate: 10%
   - Privacy: Suppress sensitive elements

2. **Heatmaps**:
   - Track all pages
   - Minimum pageviews: 100
   - Track button clicks

3. **Feedback**:
   - Add feedback widget
   - Configure exit-intent survey

## 4. Environment Configuration

### Production Environment Variables
Add these to your hosting platform:

```bash
# Google Analytics
GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_ENABLED=true

# Google Tag Manager (optional)
GTM_CONTAINER_ID=GTM-XXXXXXX
GTM_ENABLED=true

# Hotjar (optional)
HOTJAR_SITE_ID=0000000
HOTJAR_ENABLED=true

# Performance monitoring
PERFORMANCE_MONITORING=true
```

### Update HTML Meta Tags
Replace placeholder values in index.html:
```html
<meta name="ga-measurement-id" content="G-XXXXXXXXXX">
<meta name="gtm-container-id" content="GTM-XXXXXXX">
<meta name="hotjar-site-id" content="0000000">
```

## 5. Testing Analytics Implementation

### Manual Testing Checklist
- [ ] Page views are tracked
- [ ] Contact form submissions tracked
- [ ] Phone number clicks tracked
- [ ] Scroll depth tracking works
- [ ] File downloads tracked
- [ ] External links tracked
- [ ] Performance metrics collected

### Testing in Browser Console
```javascript
// Check if analytics is loaded
console.log('Analytics loaded:', !!window.analytics);

// Test custom tracking
window.analytics.trackBusinessEvent('service_view', {
    service_name: 'air_freight'
});

// Test conversion tracking
window.analytics.trackConversion('test_conversion', 100);
```

### Real-Time Verification
1. Open GA4 → Reports → Realtime
2. Navigate your website
3. Verify events appear in real-time

## 6. Key Metrics to Monitor

### Business KPIs
- **Contact form conversion rate**: Target > 5%
- **Phone click rate**: Monitor engagement
- **Service page engagement**: Time on page, scroll depth
- **Return visitor percentage**: Brand awareness
- **Mobile vs desktop usage**: Optimize experience

### Technical KPIs
- **Page load time**: Target < 3 seconds
- **Largest Contentful Paint**: Target < 2.5 seconds
- **First Input Delay**: Target < 100ms
- **Cumulative Layout Shift**: Target < 0.1

### Lead Quality Metrics
- **Lead source performance**: Which channels drive quality leads
- **Service interest distribution**: Most popular services
- **Geographic distribution**: Service area insights
- **Device preferences**: Optimize for primary devices

## 7. Monthly Reporting

### Automated Reports
Set up automated reports in GA4:
1. Go to Library → Report Builder
2. Create custom reports for:
   - Lead generation performance
   - Service page analytics
   - Mobile performance
   - Conversion funnel analysis

### Key Questions to Answer
- Which marketing channels drive the highest quality leads?
- What services are customers most interested in?
- Where do users drop off in the contact process?
- How does mobile performance compare to desktop?
- What content keeps users engaged longest?

## 8. Privacy and Compliance

### GDPR Considerations
- Analytics configured to anonymize IP addresses
- No personal data collected without consent
- Clear privacy policy linked in footer

### Business-to-Business Context
- Less stringent requirements for B2B sites
- Focus on legitimate business interest
- Transparent data usage

## 9. Troubleshooting

### Common Issues
1. **Events not tracking**:
   - Check browser console for errors
   - Verify GA4 measurement ID
   - Test in incognito mode

2. **Slow loading**:
   - Scripts are loaded with `defer` attribute
   - Analytics load asynchronously
   - No impact on page performance

3. **Blocked by ad blockers**:
   - Expected behavior
   - Analytics degrades gracefully
   - Core functionality unaffected

## 10. Future Enhancements

### Phase 2 Analytics
- Enhanced ecommerce for quote tracking
- Customer journey mapping
- A/B testing implementation
- Advanced segmentation

### Integration Opportunities
- CRM integration for lead scoring
- Email marketing analytics
- Social media tracking
- Offline conversion import

---

**Implementation Status**: Ready for deployment
**Estimated Setup Time**: 2-3 hours
**Testing Time**: 1 hour
**Go-Live**: After GA4 property creation