/**
 * Logging utility using Pino for production-grade logging
 */

import pino, { type Logger, type LoggerOptions } from 'pino';
import { config } from '../config/index.js';

// Configure logger options
const loggerOptions: LoggerOptions = {
  level: config.LOG_LEVEL,
  name: 'netflow-backend',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  mixin: () => ({
    service: 'netflow-isp-platform',
    environment: config.NODE_ENV,
  }),
};

// Create logger instance
export const logger: Logger = pino(loggerOptions);

// Child logger factory
export function createChildLogger(bindings: Record<string, unknown>): Logger {
  return logger.child(bindings);
}

// Request logging middleware helper
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  requestId?: string
): void {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

  logger[level]({
    method,
    url,
    statusCode,
    responseTime,
    requestId,
  }, `${method} ${url} ${statusCode} ${responseTime}ms`);
}

// Performance timing helper
export function startTimer(): { stop: () => number } {
  const start = process.hrtime.bigint();

  return {
    stop: () => {
      const end = process.hrtime.bigint();
      return Number(end - start) / 1_000_000; // Convert to milliseconds
    },
  };
}

export default logger;
