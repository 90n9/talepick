import { NextRequest, NextResponse } from 'next/server';

export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  statusCode?: number;
  responseTime?: number;
  contentLength?: number;
  requestId: string;
  userId?: string;
  error?: string;
}

export interface LoggingOptions {
  enablePerformanceMetrics?: boolean;
  enableRequestLogging?: boolean;
  enableResponseLogging?: boolean;
  enableErrorLogging?: boolean;
  redactSensitiveData?: boolean;
  customLogger?: (entry: LogEntry) => void;
  sensitiveHeaders?: string[];
  sensitiveFields?: string[];
}

const defaultLoggingOptions: LoggingOptions = {
  enablePerformanceMetrics: true,
  enableRequestLogging: true,
  enableResponseLogging: true,
  enableErrorLogging: true,
  redactSensitiveData: true,
  sensitiveHeaders: ['authorization', 'cookie', 'x-api-key'],
  sensitiveFields: ['password', 'token', 'secret', 'key', 'credit-card'],
};

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract client IP from request
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Default logger implementation
 */
function defaultLogger(entry: LogEntry): void {
  const logLevel = entry.error
    ? 'error'
    : entry.statusCode && entry.statusCode >= 400
      ? 'warn'
      : 'info';

  const logMessage = {
    level: logLevel,
    ...entry,
  };

  // Console formatting for different environments
  if (process.env.NODE_ENV === 'development') {
    const colors = {
      info: '\x1b[36m', // Cyan
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      reset: '\x1b[0m', // Reset
    };

    const color = colors[logLevel as keyof typeof colors] || colors.info;
    console.log(
      `${color}[${logLevel.toUpperCase()}]${colors.reset} ${entry.method} ${entry.url} - ${entry.statusCode} (${entry.responseTime}ms)`
    );

    if (entry.error) {
      console.error(`${colors.error}ERROR:${colors.reset}`, entry.error);
    }
  } else {
    // Production: structured JSON logging
    console.log(JSON.stringify(logMessage));
  }
}

/**
 * Logging middleware for API requests
 * Tracks request/response lifecycle with performance metrics and security
 */
export function logger(options: LoggingOptions = {}) {
  const config = { ...defaultLoggingOptions, ...options };
  const loggerFn = config.customLogger || defaultLogger;

  return {
    beforeRequest: (request: NextRequest): { requestId: string; startTime: number } => {
      if (!config.enableRequestLogging) {
        return { requestId: '', startTime: Date.now() };
      }

      const requestId = generateRequestId();
      const startTime = Date.now();

      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        method: request.method,
        url: request.url,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        requestId,
      };

      // Extract user ID from auth header if present
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // Note: In a real implementation, you'd decode the JWT to get user ID
        // For now, we'll just note that there's an authenticated request
        logEntry.userId = 'authenticated';
      }

      loggerFn(logEntry);

      return { requestId, startTime };
    },

    afterResponse: (
      request: NextRequest,
      response: NextResponse,
      requestId: string,
      startTime: number
    ): void => {
      if (!config.enableResponseLogging) {
        return;
      }

      const responseTime = Date.now() - startTime;

      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        method: request.method,
        url: request.url,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        statusCode: response.status,
        responseTime,
        contentLength: response.headers.get('content-length')
          ? parseInt(response.headers.get('content-length')!, 10)
          : undefined,
        requestId,
      };

      loggerFn(logEntry);

      // Log slow requests as warnings
      if (config.enablePerformanceMetrics && responseTime > 1000) {
        loggerFn({
          ...logEntry,
          error: `Slow request: ${responseTime}ms`,
        });
      }
    },

    onError: (request: NextRequest, error: Error, requestId: string, startTime: number): void => {
      if (!config.enableErrorLogging) {
        return;
      }

      const responseTime = Date.now() - startTime;

      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        method: request.method,
        url: request.url,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        statusCode: 500,
        responseTime,
        requestId,
        error: config.redactSensitiveData
          ? error.message.replace(/password|token|secret|key|credit-card/gi, '[REDACTED]')
          : error.message,
      };

      loggerFn(logEntry);
    },
  };
}

/**
 * Simple logging wrapper for basic request logging
 */
export const requestLogger = logger({
  enablePerformanceMetrics: true,
  enableRequestLogging: true,
  enableResponseLogging: true,
  enableErrorLogging: true,
});

/**
 * Production-ready logging with security considerations
 */
export const productionLogger = logger({
  enablePerformanceMetrics: true,
  enableRequestLogging: true,
  enableResponseLogging: false, // Reduce noise in production
  enableErrorLogging: true,
  redactSensitiveData: true,
  sensitiveHeaders: ['authorization', 'cookie', 'x-api-key', 'x-auth-token'],
  sensitiveFields: ['password', 'token', 'secret', 'key', 'credit-card', 'ssn', 'bank-account'],
});
