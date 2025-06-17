const nodemailer = require('nodemailer');
const logger = require('./logger');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    /**
     * Initialize email transporter
     */
    initializeTransporter() {
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            logger.warn('Email service not configured - missing SMTP credentials');
            return;
        }

        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection
        this.transporter.verify((error, success) => {
            if (error) {
                logger.error('Email transporter verification failed', error);
            } else {
                logger.info('Email transporter ready');
            }
        });
    }

    /**
     * Send contact form email to P.A.I. Trucking
     * @param {Object} data - Contact form data
     */
    async sendContactFormEmail(data) {
        if (!this.transporter) {
            logger.warn('Email service not available - contact form data logged only');
            return;
        }

        const htmlContent = this.generateContactFormHTML(data);
        const textContent = this.generateContactFormText(data);

        const mailOptions = {
            from: `"P.A.I. Trucking Website" <${process.env.SMTP_USER}>`,
            to: process.env.EMAIL_TO || 'info@paitrucking.com',
            subject: `New Quote Request from ${data.name} - ${data.service}`,
            text: textContent,
            html: htmlContent,
            replyTo: data.email
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            logger.info('Contact form email sent successfully', { messageId: result.messageId });
            return result;
        } catch (error) {
            logger.error('Failed to send contact form email', error);
            throw error;
        }
    }

    /**
     * Send auto-reply to customer
     * @param {string} customerEmail - Customer's email address
     * @param {string} customerName - Customer's name
     */
    async sendAutoReply(customerEmail, customerName) {
        if (!this.transporter) {
            return;
        }

        const htmlContent = this.generateAutoReplyHTML(customerName);
        const textContent = this.generateAutoReplyText(customerName);

        const mailOptions = {
            from: `"P.A.I. Trucking Corporation" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: 'Thank you for your inquiry - P.A.I. Trucking Corporation',
            text: textContent,
            html: htmlContent
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            logger.info('Auto-reply email sent successfully', { 
                to: customerEmail,
                messageId: result.messageId 
            });
            return result;
        } catch (error) {
            logger.error('Failed to send auto-reply email', error);
            // Don't throw error for auto-reply failures
        }
    }

    /**
     * Generate HTML content for contact form email
     * @param {Object} data - Contact form data
     * @returns {string} - HTML content
     */
    generateContactFormHTML(data) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #1a365d; }
                .value { margin-left: 10px; }
                .footer { background: #f7fafc; padding: 15px; font-size: 12px; color: #718096; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>New Quote Request - P.A.I. Trucking Corporation</h2>
            </div>
            
            <div class="content">
                <div class="field">
                    <span class="label">Name:</span>
                    <span class="value">${data.name}</span>
                </div>
                
                <div class="field">
                    <span class="label">Email:</span>
                    <span class="value">${data.email}</span>
                </div>
                
                <div class="field">
                    <span class="label">Phone:</span>
                    <span class="value">${data.phone}</span>
                </div>
                
                <div class="field">
                    <span class="label">Company:</span>
                    <span class="value">${data.company}</span>
                </div>
                
                <div class="field">
                    <span class="label">Service Interest:</span>
                    <span class="value">${data.service}</span>
                </div>
                
                <div class="field">
                    <span class="label">Message:</span>
                    <div style="margin-left: 10px; padding: 10px; background: #f7fafc; border-left: 3px solid #f56500;">
                        ${data.message.replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Submission Details:</strong></p>
                <p>Submitted: ${new Date(data.submittedAt).toLocaleString()}</p>
                <p>IP Address: ${data.ip}</p>
                <p>User Agent: ${data.userAgent}</p>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Generate text content for contact form email
     * @param {Object} data - Contact form data
     * @returns {string} - Text content
     */
    generateContactFormText(data) {
        return `
NEW QUOTE REQUEST - P.A.I. TRUCKING CORPORATION

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Company: ${data.company}
Service Interest: ${data.service}

Message:
${data.message}

---
Submission Details:
Submitted: ${new Date(data.submittedAt).toLocaleString()}
IP Address: ${data.ip}
User Agent: ${data.userAgent}
        `;
    }

    /**
     * Generate HTML content for auto-reply email
     * @param {string} customerName - Customer's name
     * @returns {string} - HTML content
     */
    generateAutoReplyHTML(customerName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .highlight { color: #f56500; font-weight: bold; }
                .footer { background: #f7fafc; padding: 15px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>P.A.I. TRUCKING CORPORATION</h2>
                <p>Reliable Logistics Solutions Since 1981</p>
            </div>
            
            <div class="content">
                <p>Dear ${customerName},</p>
                
                <p>Thank you for your interest in P.A.I. Trucking Corporation's logistics services. We have received your quote request and appreciate the opportunity to serve your transportation needs.</p>
                
                <p><span class="highlight">Our team will review your requirements and contact you within 24 hours</span> with a detailed quote and next steps.</p>
                
                <p>In the meantime, here's what sets us apart:</p>
                <ul>
                    <li><strong>40+ Years Experience</strong> - Family-owned and operated since 1981</li>
                    <li><strong>Strategic Location</strong> - Just 5 minutes from JFK International Airport</li>
                    <li><strong>Bonded Facility</strong> - 28,500 sq ft secure container station</li>
                    <li><strong>Comprehensive Services</strong> - Air, ocean, and ground transportation</li>
                </ul>
                
                <p>If you have any urgent questions, please don't hesitate to call us at <strong>(718) 712-2700</strong>.</p>
                
                <p>Best regards,<br>
                P.A.I. Trucking Corporation Team</p>
            </div>
            
            <div class="footer">
                <p><strong>P.A.I. TRUCKING CORPORATION</strong></p>
                <p>Phone: (718) 712-2700 | Website: paitrucking.com</p>
                <p>Experience, Security, Honor and Integrity</p>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Generate text content for auto-reply email
     * @param {string} customerName - Customer's name
     * @returns {string} - Text content
     */
    generateAutoReplyText(customerName) {
        return `
Dear ${customerName},

Thank you for your interest in P.A.I. Trucking Corporation's logistics services. We have received your quote request and appreciate the opportunity to serve your transportation needs.

Our team will review your requirements and contact you within 24 hours with a detailed quote and next steps.

In the meantime, here's what sets us apart:
• 40+ Years Experience - Family-owned and operated since 1981
• Strategic Location - Just 5 minutes from JFK International Airport  
• Bonded Facility - 28,500 sq ft secure container station
• Comprehensive Services - Air, ocean, and ground transportation

If you have any urgent questions, please don't hesitate to call us at (718) 712-2700.

Best regards,
P.A.I. Trucking Corporation Team

---
P.A.I. TRUCKING CORPORATION
Phone: (718) 712-2700 | Website: paitrucking.com
Experience, Security, Honor and Integrity
        `;
    }
}

module.exports = new EmailService();