# HTTPS/SSL Setup Guide for P.A.I. Trucking

## Overview
This guide covers setting up HTTPS/SSL for the P.A.I. Trucking website across different deployment scenarios.

## Prerequisites
- Domain name configured (paitrucking.com)
- Server with root/sudo access (for VPS deployments)
- Node.js 18+ installed
- PM2 for process management (optional but recommended)

## Option 1: VPS with Let's Encrypt (Recommended for Full Control)

### Step 1: Install Certbot
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot

# CentOS/RHEL
sudo yum install certbot
```

### Step 2: Generate SSL Certificate
```bash
# Stop any services on port 80
sudo systemctl stop nginx  # if nginx is running

# Generate certificate
sudo certbot certonly --standalone \
  -d paitrucking.com \
  -d www.paitrucking.com \
  --non-interactive \
  --agree-tos \
  --email admin@paitrucking.com
```

### Step 3: Configure Environment Variables
```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=80
HTTPS_PORT=443
SSL_CERT_PATH=/etc/letsencrypt/live/paitrucking.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/paitrucking.com/privkey.pem
SESSION_SECRET=$(openssl rand -base64 32)
FORCE_HTTPS=true
EOF
```

### Step 4: Set Permissions
```bash
# Allow Node.js to bind to ports 80 and 443
sudo setcap 'cap_net_bind_service=+ep' $(which node)

# Or run with PM2 as root (not recommended)
# sudo pm2 start server/app-secure.js --name pai-trucking
```

### Step 5: Start the Secure Server
```bash
# Using PM2 (recommended)
pm2 start server/app-secure.js --name pai-trucking
pm2 save
pm2 startup

# Or using systemd service
sudo nano /etc/systemd/system/pai-trucking.service
```

### Step 6: Auto-Renewal Setup
```bash
# Add to crontab
sudo crontab -e

# Add this line
0 3 * * * /usr/bin/certbot renew --quiet --post-hook "pm2 restart pai-trucking"
```

## Option 2: Nginx Reverse Proxy (Recommended for Multiple Sites)

### Step 1: Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

### Step 2: Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/paitrucking.com
```

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name paitrucking.com www.paitrucking.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name paitrucking.com www.paitrucking.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/paitrucking.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/paitrucking.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Let's Encrypt verification
    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
}
```

### Step 3: Enable Site and Restart
```bash
sudo ln -s /etc/nginx/sites-available/paitrucking.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Option 3: Cloud Platforms

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# SSL is automatic with custom domains
```

### Netlify
1. Connect GitHub repository
2. Add custom domain in Netlify settings
3. SSL is automatically provisioned

### Heroku
```bash
# Install Heroku CLI
# Deploy app
git push heroku main

# Add custom domain
heroku domains:add paitrucking.com

# SSL included with paid dynos
```

### AWS with Application Load Balancer
1. Create ALB in AWS Console
2. Request certificate in ACM
3. Configure target group for EC2/ECS
4. Update Route 53 to point to ALB

## Security Headers Verification

After deployment, verify security headers:

```bash
# Check headers
curl -I https://paitrucking.com

# Use online tools
# - https://securityheaders.com
# - https://www.ssllabs.com/ssltest/
```

## Environment Variables for Production

```bash
# Required for secure deployment
NODE_ENV=production
PORT=3000  # or 80 if not using reverse proxy
HTTPS_PORT=443
SESSION_SECRET=<generate-secure-random-string>
FORCE_HTTPS=true

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@paitrucking.com
SMTP_PASS=<app-specific-password>

# Optional
ALLOWED_ORIGINS=https://paitrucking.com,https://www.paitrucking.com
LOG_LEVEL=info
```

## Testing HTTPS Configuration

```bash
# Test SSL certificate
openssl s_client -connect paitrucking.com:443 -servername paitrucking.com

# Test redirect
curl -I http://paitrucking.com

# Test API with HTTPS
curl https://paitrucking.com/api/health

# Load test with SSL
artillery quick --count 50 --num 10 https://paitrucking.com
```

## Monitoring and Maintenance

### Certificate Expiry Monitoring
```bash
# Check certificate expiry
echo | openssl s_client -servername paitrucking.com -connect paitrucking.com:443 2>/dev/null | openssl x509 -noout -dates

# Set up monitoring alerts
# - UptimeRobot
# - Pingdom
# - AWS CloudWatch
```

### Performance Monitoring
- Enable HTTP/2 for better performance
- Use CDN for static assets
- Monitor SSL handshake time
- Check for mixed content warnings

## Troubleshooting

### Common Issues

1. **Certificate not trusted**
   - Ensure using fullchain.pem not just cert.pem
   - Check certificate matches domain

2. **Mixed content warnings**
   - Update all resource URLs to use HTTPS
   - Check for hardcoded HTTP URLs

3. **Redirect loops**
   - Check CloudFlare SSL settings if using
   - Verify X-Forwarded-Proto header handling

4. **Permission denied on ports**
   - Use setcap or run on high port with reverse proxy
   - Don't run Node.js as root

## Security Checklist

- [ ] SSL certificate installed and valid
- [ ] HTTP redirects to HTTPS
- [ ] HSTS header enabled
- [ ] Security headers configured
- [ ] Session cookies marked as secure
- [ ] CSRF protection enabled
- [ ] Rate limiting active
- [ ] Auto-renewal configured
- [ ] Monitoring alerts set up
- [ ] Backup of certificates

## Next Steps

1. Deploy using chosen method
2. Verify SSL configuration
3. Test all functionality over HTTPS
4. Update DNS records if needed
5. Monitor for issues
6. Document deployment process

---

**Last Updated**: 2025-06-17
**Version**: 1.0.0