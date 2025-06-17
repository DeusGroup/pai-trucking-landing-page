const fs = require('fs');
const path = require('path');

// HTTPS Configuration for production deployment
const httpsConfig = {
    // Check if SSL certificates exist
    hasSSLCertificates: () => {
        const certPath = process.env.SSL_CERT_PATH || '/etc/letsencrypt/live/paitrucking.com/fullchain.pem';
        const keyPath = process.env.SSL_KEY_PATH || '/etc/letsencrypt/live/paitrucking.com/privkey.pem';
        
        try {
            return fs.existsSync(certPath) && fs.existsSync(keyPath);
        } catch (error) {
            return false;
        }
    },

    // Get SSL configuration
    getSSLConfig: () => {
        const certPath = process.env.SSL_CERT_PATH || '/etc/letsencrypt/live/paitrucking.com/fullchain.pem';
        const keyPath = process.env.SSL_KEY_PATH || '/etc/letsencrypt/live/paitrucking.com/privkey.pem';
        
        try {
            return {
                cert: fs.readFileSync(certPath),
                key: fs.readFileSync(keyPath),
                // Additional security options
                secureOptions: require('constants').SSL_OP_NO_TLSv1 | require('constants').SSL_OP_NO_TLSv1_1,
                ciphers: [
                    'ECDHE-RSA-AES128-GCM-SHA256',
                    'ECDHE-ECDSA-AES128-GCM-SHA256',
                    'ECDHE-RSA-AES256-GCM-SHA384',
                    'ECDHE-ECDSA-AES256-GCM-SHA384',
                    'DHE-RSA-AES128-GCM-SHA256',
                    'ECDHE-RSA-AES128-SHA256',
                    'DHE-RSA-AES128-SHA256',
                    'ECDHE-RSA-AES256-SHA384',
                    'DHE-RSA-AES256-SHA384',
                    'ECDHE-RSA-AES256-SHA256',
                    'DHE-RSA-AES256-SHA256',
                    'HIGH',
                    '!aNULL',
                    '!eNULL',
                    '!EXPORT',
                    '!DES',
                    '!RC4',
                    '!MD5',
                    '!PSK',
                    '!SRP',
                    '!CAMELLIA'
                ].join(':'),
                honorCipherOrder: true
            };
        } catch (error) {
            console.error('Failed to load SSL certificates:', error);
            return null;
        }
    },

    // Redirect HTTP to HTTPS middleware
    redirectToHTTPS: (req, res, next) => {
        if (process.env.NODE_ENV === 'production' && !req.secure && req.get('X-Forwarded-Proto') !== 'https') {
            return res.redirect(301, `https://${req.get('Host')}${req.url}`);
        }
        next();
    },

    // Let's Encrypt verification middleware
    letsEncryptVerification: (req, res, next) => {
        // Handle Let's Encrypt ACME challenge
        if (req.path.startsWith('/.well-known/acme-challenge/')) {
            const token = req.path.split('/').pop();
            const challengePath = path.join(__dirname, '../../.well-known/acme-challenge', token);
            
            if (fs.existsSync(challengePath)) {
                return res.sendFile(challengePath);
            }
        }
        next();
    }
};

// Instructions for SSL setup
const sslSetupInstructions = `
# SSL/HTTPS Setup Instructions

## Option 1: Let's Encrypt (Free SSL Certificate)

1. Install Certbot:
   \`\`\`bash
   sudo apt update
   sudo apt install certbot
   \`\`\`

2. Generate SSL certificate:
   \`\`\`bash
   sudo certbot certonly --standalone -d paitrucking.com -d www.paitrucking.com
   \`\`\`

3. Set environment variables:
   \`\`\`bash
   export SSL_CERT_PATH=/etc/letsencrypt/live/paitrucking.com/fullchain.pem
   export SSL_KEY_PATH=/etc/letsencrypt/live/paitrucking.com/privkey.pem
   \`\`\`

4. Set up auto-renewal:
   \`\`\`bash
   sudo crontab -e
   # Add this line:
   0 3 * * * /usr/bin/certbot renew --quiet --post-hook "pm2 restart pai-trucking"
   \`\`\`

## Option 2: Using a Reverse Proxy (Nginx)

1. Install Nginx:
   \`\`\`bash
   sudo apt install nginx
   \`\`\`

2. Configure Nginx with the provided nginx.conf file

3. Let Nginx handle SSL termination

## Option 3: Cloud Provider SSL

- AWS: Use Application Load Balancer with ACM certificate
- Heroku: SSL included with custom domains
- Vercel/Netlify: Automatic SSL provisioning

## Environment Variables for SSL:
- SSL_CERT_PATH: Path to SSL certificate file
- SSL_KEY_PATH: Path to SSL private key file
- FORCE_HTTPS: Set to 'true' to force HTTPS redirect
`;

module.exports = {
    httpsConfig,
    sslSetupInstructions
};