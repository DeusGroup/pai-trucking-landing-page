const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '..', 'logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...(data && { data })
        };

        return JSON.stringify(logEntry);
    }

    writeToFile(level, formattedMessage) {
        const date = new Date().toISOString().split('T')[0];
        const filename = `${date}.log`;
        const filepath = path.join(this.logDir, filename);

        fs.appendFileSync(filepath, formattedMessage + '\n');
    }

    log(level, message, data = null) {
        const formattedMessage = this.formatMessage(level, message, data);
        
        // Console output
        if (process.env.NODE_ENV !== 'production') {
            const colors = {
                error: '\x1b[31m',   // Red
                warn: '\x1b[33m',    // Yellow
                info: '\x1b[36m',    // Cyan
                debug: '\x1b[35m'    // Magenta
            };
            const reset = '\x1b[0m';
            const color = colors[level] || '';
            
            console.log(`${color}${formattedMessage}${reset}`);
        }

        // File output
        this.writeToFile(level, formattedMessage);
    }

    error(message, data = null) {
        this.log('error', message, data);
    }

    warn(message, data = null) {
        this.log('warn', message, data);
    }

    info(message, data = null) {
        this.log('info', message, data);
    }

    debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, data);
        }
    }
}

module.exports = new Logger();