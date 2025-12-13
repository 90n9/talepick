import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  customHeaders?: {
    'X-RateLimit-Limit'?: boolean;
    'X-RateLimit-Remaining'?: boolean;
    'X-RateLimit-Reset'?: boolean;
    'Retry-After'?: boolean;
  };
  message?: string;
  enableRedis?: boolean; // For future Redis integration
  redisOptions?: {
    host: string;
    port: number;
    password?: string;
    keyPrefix?: string;
  };
}

export interface RateLimitCheckResult {
  allowed: boolean;
  response?: NextResponse;
  rateLimitHeaders?: Record<string, string>;
}

interface RateLimitStore {
  hits: number;
  resetTime: number;
}

// In-memory store for current single-instance deployment
// Note: For multi-instance deployments, replace with Redis/Upstash
const inMemoryStore = new Map<string, RateLimitStore>();

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  customHeaders: {
    'X-RateLimit-Limit': true,
    'X-RateLimit-Remaining': true,
    'X-RateLimit-Reset': true,
    'Retry-After': true,
  },
  message: 'Too many requests, please try again later',
  enableRedis: false, // Currently disabled for single-instance deployment
};

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, store] of inMemoryStore.entries()) {
    if (now > store.resetTime) {
      inMemoryStore.delete(key);
    }
  }
}

/**
 * Generate default rate limit key based on IP and optional user ID
 */
function defaultKeyGenerator(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // For authenticated requests, you could include user ID for more granular limiting
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In a real implementation, decode JWT to get user ID
    return `user:authenticated:${ip}`;
  }

  return `ip:${ip}`;
}

/**
 * Get current time in seconds for rate limit headers
 */
function getCurrentTimeInSeconds(): number {
  return Math.ceil(Date.now() / 1000);
}

/**
 * Rate limiting middleware with sliding window implementation
 * Note: Uses in-memory storage suitable for single-instance deployment
 * For multi-instance deployments, enable Redis storage
 */
export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const config = { ...defaultOptions, ...options };

  // Set up periodic cleanup
  if (typeof setInterval !== 'undefined') {
    setInterval(cleanupExpiredEntries, config.windowMs);
  }

  return {
    check: (request: NextRequest): RateLimitCheckResult => {
      const key = config.keyGenerator ? config.keyGenerator(request) : defaultKeyGenerator(request);
      const now = Date.now();

      // Get or create rate limit entry
      let entry = inMemoryStore.get(key);
      if (!entry || now > entry.resetTime) {
        entry = {
          hits: 0,
          resetTime: now + config.windowMs,
        };
        inMemoryStore.set(key, entry);
      }

      // Check rate limit
      const isAllowed = entry.hits < config.maxRequests;

      if (!isAllowed) {
        const resetTimeInSeconds = Math.ceil(entry.resetTime / 1000);
        const currentTimeInSeconds = getCurrentTimeInSeconds();
        const retryAfter = Math.max(0, resetTimeInSeconds - currentTimeInSeconds);

        const errorResponse = new NextResponse(
          JSON.stringify({
            success: false,
            error: {
              message: config.message,
              code: 'RATE_LIMIT_EXCEEDED',
              retryAfter,
            },
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': retryAfter.toString(),
            },
          }
        );

        // Add rate limit headers if enabled
        if (config.customHeaders?.['X-RateLimit-Limit']) {
          errorResponse.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
        }
        if (config.customHeaders?.['X-RateLimit-Remaining']) {
          errorResponse.headers.set('X-RateLimit-Remaining', '0');
        }
        if (config.customHeaders?.['X-RateLimit-Reset']) {
          errorResponse.headers.set('X-RateLimit-Reset', resetTimeInSeconds.toString());
        }

        return { allowed: false, response: errorResponse };
      }

      // Increment hit counter
      entry.hits++;

      // Prepare rate limit headers for successful responses
      const remainingHits = config.maxRequests - entry.hits;
      const resetTimeInSeconds = Math.ceil(entry.resetTime / 1000);

      const rateLimitHeaders: Record<string, string> = {};

      if (config.customHeaders?.['X-RateLimit-Limit']) {
        rateLimitHeaders['X-RateLimit-Limit'] = config.maxRequests.toString();
      }
      if (config.customHeaders?.['X-RateLimit-Remaining']) {
        rateLimitHeaders['X-RateLimit-Remaining'] = remainingHits.toString();
      }
      if (config.customHeaders?.['X-RateLimit-Reset']) {
        rateLimitHeaders['X-RateLimit-Reset'] = resetTimeInSeconds.toString();
      }

      return { allowed: true, rateLimitHeaders };
    },

    /**
     * Add rate limit headers to a successful response
     */
    addHeaders: (
      response: NextResponse,
      rateLimitHeaders: Record<string, string>
    ): NextResponse => {
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    },
  };
}

/**
 * Predefined rate limit configurations
 */
export const rateLimitConfigs = {
  // Strict limits for sensitive endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later',
  }),

  // Standard limits for general API
  standard: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  }),

  // Higher limits for data-heavy endpoints
  data: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000, // 1000 requests per hour
  }),

  // Very strict limits for admin endpoints
  admin: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // 50 requests per 15 minutes
    message: 'Admin rate limit exceeded',
  }),

  // Development limits (more permissive)
  development: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000, // 1000 requests per minute
  }),
} as const;

/**
 * Get rate limit configuration based on environment
 */
export function getRateLimitConfig(
  configName: keyof typeof rateLimitConfigs,
  environment?: string
): ReturnType<typeof rateLimit> {
  const env = environment || process.env.NODE_ENV || 'development';

  if (env === 'development') {
    return rateLimitConfigs.development;
  }

  return rateLimitConfigs[configName];
}

/**
 * Rate limit middleware wrapper for route handlers
 */
export function withRateLimit(
  configName: keyof typeof rateLimitConfigs,
  customOptions?: Partial<RateLimitOptions>
) {
  const limiter = customOptions ? rateLimit(customOptions) : getRateLimitConfig(configName);

  return <T extends NextRequest>(handler: (request: T) => Promise<NextResponse>) => {
    return async (request: T): Promise<NextResponse> => {
      const { allowed, response, rateLimitHeaders } = limiter.check(request);

      if (!allowed && response) {
        return response;
      }

      // Execute the handler
      const handlerResponse = await handler(request);

      // Add rate limit headers if request was allowed
      if (allowed && rateLimitHeaders) {
        return limiter.addHeaders(handlerResponse, rateLimitHeaders);
      }

      return handlerResponse;
    };
  };
}

/**
 * Create a custom rate limit middleware
 */
export function createRateLimit(customOptions: Partial<RateLimitOptions>) {
  const limiter = rateLimit(customOptions);

  return <T extends NextRequest>(handler: (request: T) => Promise<NextResponse>) => {
    return async (request: T): Promise<NextResponse> => {
      const { allowed, response, rateLimitHeaders } = limiter.check(request);

      if (!allowed && response) {
        return response;
      }

      const handlerResponse = await handler(request);

      if (allowed && rateLimitHeaders) {
        return limiter.addHeaders(handlerResponse, rateLimitHeaders);
      }

      return handlerResponse;
    };
  };
}
