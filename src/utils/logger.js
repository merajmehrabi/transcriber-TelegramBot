import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

class Logger {
  constructor() {
    this.debugMode = process.env.DEBUG_MODE === 'true';
    this.logDir = join(rootDir, 'logs');
    this.logStream = null;
    this.initLogger();
  }

  async initLogger() {
    try {
      // Create logs directory if it doesn't exist
      await fs.mkdir(this.logDir, { recursive: true });

      // Create log file with timestamp
      const date = new Date().toISOString().split('T')[0];
      const logFile = join(this.logDir, `bot_${date}.log`);
      
      // Create write stream for logging
      this.logStream = createWriteStream(logFile, { flags: 'a' });
      
      this.info('Logger initialized');
    } catch (error) {
      console.error('Failed to initialize logger:', error);
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        // Remove sensitive data
        const sanitizedData = this.sanitizeData(data);
        logMessage += `\nData: ${JSON.stringify(sanitizedData, null, 2)}`;
      } else {
        logMessage += `\nData: ${data}`;
      }
    }

    return logMessage + '\n';
  }

  sanitizeData(data) {
    const sensitiveKeys = ['token', 'password', 'credentials', 'api_key'];
    const sanitized = { ...data };

    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          obj[key] = sanitizeObject(obj[key]);
        } else if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          obj[key] = '[REDACTED]';
        }
      }
      return obj;
    };

    return sanitizeObject(sanitized);
  }

  log(level, message, data = null) {
    const logMessage = this.formatMessage(level, message, data);
    
    // Always write to file
    if (this.logStream) {
      this.logStream.write(logMessage);
    }

    // Console output based on debug mode
    if (this.debugMode || level === 'ERROR') {
      const consoleMethod = level === 'ERROR' ? 'error' : 'log';
      console[consoleMethod](logMessage.trim());
    }
  }

  debug(message, data = null) {
    if (this.debugMode) {
      this.log('DEBUG', message, data);
    }
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  error(message, error = null) {
    let errorData = null;
    if (error) {
      errorData = {
        message: error.message,
        stack: error.stack,
        ...(error.response ? { response: error.response } : {})
      };
    }
    this.log('ERROR', message, errorData);
  }

  // Log bot interactions
  logInteraction(userId, command, success = true, details = null) {
    const interactionData = {
      userId,
      command,
      success,
      details
    };
    this.info(`Bot Interaction: ${command}`, interactionData);
  }

  // Log whitelist operations
  logWhitelistOperation(adminId, operation, targetUserId, success = true) {
    const whitelistData = {
      adminId,
      operation,
      targetUserId,
      success
    };
    this.info(`Whitelist Operation: ${operation}`, whitelistData);
  }

  // Set debug mode
  setDebugMode(enabled) {
    this.debugMode = enabled;
    this.info(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Close logger
  close() {
    if (this.logStream) {
      this.logStream.end();
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Handle process termination
process.on('beforeExit', () => {
  logger.info('Bot shutting down');
  logger.close();
});

export default logger;
