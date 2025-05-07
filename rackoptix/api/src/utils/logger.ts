/**
 * Logger utility for the RackOptix API.
 */

import winston from 'winston';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'rackoptix-api' },
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, ...rest }) => {
          const restString = Object.keys(rest).length ? JSON.stringify(rest, null, 2) : '';
          return `${timestamp} [${service}] ${level}: ${message} ${restString}`;
        })
      ),
    }),
    // In production, you might want to add file transports or other destinations
  ],
});

export { logger };