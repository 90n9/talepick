import { apiConfig } from './env';
import type { APIConfig } from './types';

/**
 * API-specific configuration utilities
 */

/**
 * Get API rate limiting configuration
 */
export function getRateLimitConfig() {
  return {
    windowMs: apiConfig.rateLimitWindowMs,
    maxRequests: apiConfig.rateLimitMaxRequests,
    enabled: apiConfig.enableRateLimiting,
  };
}

/**
 * Get logging configuration
 */
export function getLoggingConfig() {
  return {
    level: apiConfig.logLevel,
    enabled: apiConfig.enableRequestLogging,
  };
}

/**
 * Get CORS configuration
 */
export function getCorsConfig() {
  if (!apiConfig.enableCors) {
    return null;
  }

  return {
    origin: apiConfig.corsOrigin || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };
}

/**
 * Validate API configuration
 */
export function validateApiConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (apiConfig.rateLimitWindowMs < 1000) {
    errors.push('Rate limit window must be at least 1000ms');
  }

  if (apiConfig.rateLimitMaxRequests < 1) {
    errors.push('Rate limit max requests must be at least 1');
  }

  if (apiConfig.enableCors && !apiConfig.corsOrigin && process.env.NODE_ENV === 'production') {
    errors.push('CORS origin must be specified in production when CORS is enabled');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Determine if middleware should be enabled based on environment
 */
export function shouldEnableMiddleware(middleware: 'rateLimit' | 'logging' | 'cors'): boolean {
  switch (middleware) {
    case 'rateLimit':
      return apiConfig.enableRateLimiting;
    case 'logging':
      return apiConfig.enableRequestLogging;
    case 'cors':
      return apiConfig.enableCors;
    default:
      return false;
  }
}

/**
 * Export the complete API configuration for use in other modules
 */
export { apiConfig };

// Re-export types for convenience
export type { APIConfig } from './types';

/**
 * Helper to check if current log level should log a message
 */
export function shouldLog(level: APIConfig['logLevel']): boolean {
  const levels: Record<APIConfig['logLevel'], number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  return levels[level] <= levels[apiConfig.logLevel];
}
