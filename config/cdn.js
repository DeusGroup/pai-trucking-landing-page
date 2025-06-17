// CDN Configuration for P.A.I. Trucking

const cdnConfig = {
    // CloudFlare CDN settings (recommended)
    cloudflare: {
        enabled: process.env.CLOUDFLARE_ENABLED === 'true',
        zone: process.env.CLOUDFLARE_ZONE,
        apiToken: process.env.CLOUDFLARE_API_TOKEN,
        baseUrl: 'https://cdn.paitrucking.com'
    },
    
    // AWS CloudFront settings (alternative)
    cloudfront: {
        enabled: process.env.CLOUDFRONT_ENABLED === 'true',
        distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
        baseUrl: process.env.CLOUDFRONT_BASE_URL
    },
    
    // Local development fallback
    local: {
        baseUrl: '/images/optimized'
    },
    
    // Image serving configuration
    images: {
        // Responsive image breakpoints
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1920
        },
        
        // Default image quality settings
        quality: {
            thumbnail: 70,
            default: 85,
            hero: 90
        },
        
        // Lazy loading configuration
        lazyLoad: {
            rootMargin: '50px 0px',
            threshold: 0.01
        }
    },
    
    // Cache control headers
    cacheControl: {
        images: 'public, max-age=31536000, immutable',  // 1 year
        css: 'public, max-age=604800',                  // 1 week
        js: 'public, max-age=604800',                   // 1 week
        html: 'public, max-age=3600'                    // 1 hour
    }
};

// Helper function to get CDN URL
function getCDNUrl(path) {
    if (cdnConfig.cloudflare.enabled) {
        return `${cdnConfig.cloudflare.baseUrl}${path}`;
    } else if (cdnConfig.cloudfront.enabled) {
        return `${cdnConfig.cloudfront.baseUrl}${path}`;
    }
    return `${cdnConfig.local.baseUrl}${path}`;
}

// Generate srcset for responsive images
function generateSrcSet(imageName, sizes = ['small', 'medium', 'large']) {
    const srcset = [];
    const sizeMap = {
        small: '300w',
        medium: '600w',
        large: '1200w',
        hero: '1920w'
    };
    
    for (const size of sizes) {
        // WebP version
        srcset.push(`${getCDNUrl(`/${size}/${imageName}-${size}.webp`)} ${sizeMap[size]}`);
    }
    
    return srcset.join(', ');
}

// Generate picture element HTML
function generatePictureElement(imageName, alt, sizes = ['small', 'medium', 'large'], className = '') {
    const baseUrl = getCDNUrl('');
    
    return `
<picture class="${className}">
    <!-- WebP format for modern browsers -->
    <source 
        type="image/webp" 
        srcset="${generateSrcSet(imageName, sizes)}"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
    >
    
    <!-- JPEG fallback -->
    <source 
        type="image/jpeg" 
        srcset="${sizes.map(size => `${baseUrl}/${size}/${imageName}-${size}.jpg ${size === 'small' ? '300w' : size === 'medium' ? '600w' : '1200w'}`).join(', ')}"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
    >
    
    <!-- Fallback img element -->
    <img 
        src="${baseUrl}/medium/${imageName}-medium.jpg" 
        alt="${alt}"
        loading="lazy"
        decoding="async"
        class="responsive-img"
    >
</picture>`.trim();
}

// CloudFlare setup instructions
const cloudflareSetup = `
# CloudFlare CDN Setup

1. Sign up for CloudFlare (free plan available)
2. Add your domain: paitrucking.com
3. Update nameservers as instructed
4. Configure Page Rules:
   - Cache Level: Cache Everything for /images/*
   - Browser Cache TTL: 1 year for /images/*
5. Enable Auto Minify for CSS and JS
6. Enable Brotli compression
7. Set up custom subdomain: cdn.paitrucking.com

## Environment Variables:
CLOUDFLARE_ENABLED=true
CLOUDFLARE_ZONE=your-zone-id
CLOUDFLARE_API_TOKEN=your-api-token
`;

// AWS CloudFront setup instructions
const cloudfrontSetup = `
# AWS CloudFront CDN Setup

1. Create S3 bucket for static assets
2. Create CloudFront distribution
3. Configure origins to point to S3
4. Set cache behaviors:
   - /images/* - Cache for 1 year
   - /*.css, /*.js - Cache for 1 week
5. Enable compression
6. Configure custom domain (optional)

## Environment Variables:
CLOUDFRONT_ENABLED=true
CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
CLOUDFRONT_BASE_URL=https://your-distribution.cloudfront.net
`;

module.exports = {
    cdnConfig,
    getCDNUrl,
    generateSrcSet,
    generatePictureElement,
    cloudflareSetup,
    cloudfrontSetup
};