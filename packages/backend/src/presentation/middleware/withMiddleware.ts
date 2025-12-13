import { NextRequest, NextResponse } from 'next/server';
import { cors, CorsOptions } from './cors.middleware';
import { logger, LoggingOptions } from './logging.middleware';
import { errorHandler, ErrorHandlingOptions } from './error.middleware';
import { rateLimit, RateLimitOptions, rateLimitConfigs } from './rateLimit.middleware';
import { validate, ValidationOptions } from './validation.middleware';

export interface MiddlewareConfig {
  cors?: CorsOptions | boolean;
  logging?: LoggingOptions | boolean;
  errorHandler?: ErrorHandlingOptions | boolean;
  rateLimit?: RateLimitOptions | keyof typeof rateLimitConfigs | boolean;
  validation?: ValidationOptions;
  custom?: Array<(request: NextRequest, context: RequestContext) => Promise<NextResponse | void>>;
}

export interface RequestContext {
  requestId: string;
  startTime: number;
  [key: string]: unknown;
}

export interface MiddlewareResult {
  response?: NextResponse;
  context?: RequestContext;
  shouldContinue: boolean;
}

/**
 * Middleware composition utility for Next.js API routes
 * Note: This is NOT Next.js Edge Middleware - it's a route-handler wrapper for app/api/*
 *
 * This utility allows chaining multiple middleware functions with proper error handling,
 * context passing, and early termination capabilities.
 */
export function withMiddleware(config: MiddlewareConfig) {
  return <T extends NextRequest>(
    handler: (request: T, context: RequestContext) => Promise<NextResponse>
  ) => {
    return async (request: T): Promise<NextResponse> => {
      // Initialize request context
      const context: RequestContext = {
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: Date.now(),
      };

      try {
        // Step 1: Pre-request middleware (order matters)

        // CORS preflight check (if enabled)
        if (config.cors !== false) {
          const corsConfig = config.cors === true ? {} : config.cors;
          const corsMiddleware = cors(corsConfig as CorsOptions);

          // Handle preflight OPTIONS requests
          if (request.method === 'OPTIONS') {
            return corsMiddleware.preflight(request);
          }
        }

        // Logging (start)
        let loggingMiddleware;
        if (config.logging !== false) {
          const loggingConfig = config.logging === true ? {} : config.logging;
          loggingMiddleware = logger(loggingConfig as LoggingOptions);
          const logResult = loggingMiddleware.beforeRequest(request);
          context.requestId = logResult.requestId || context.requestId;
          context.startTime = logResult.startTime || context.startTime;
        }

        // Rate limiting (if enabled)
        if (config.rateLimit !== false) {
          let rateLimitMiddleware;

          if (config.rateLimit === true) {
            rateLimitMiddleware = getRateLimitConfig('standard');
          } else if (typeof config.rateLimit === 'string') {
            rateLimitMiddleware = getRateLimitConfig(
              config.rateLimit as keyof typeof rateLimitConfigs
            );
          } else {
            rateLimitMiddleware = rateLimit(config.rateLimit as RateLimitOptions);
          }

          const rateLimitResult = rateLimitMiddleware.check(request);
          if (!rateLimitResult.allowed && rateLimitResult.response) {
            // Log rate limit hit
            if (loggingMiddleware) {
              loggingMiddleware.onError(
                request,
                new Error('Rate limit exceeded'),
                context.requestId,
                context.startTime
              );
            }
            return rateLimitResult.response;
          }
        }

        // Validation (if configured)
        if (config.validation) {
          const validationMiddleware = validate(config.validation);
          const validationResult = await validationMiddleware.validateRequest(request);

          if (!validationResult.success) {
            const errorResponse = {
              success: false,
              error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: validationResult.errors,
                requestId: context.requestId,
              },
            };

            // Log validation error
            if (loggingMiddleware) {
              loggingMiddleware.onError(
                request,
                new Error('Validation failed'),
                context.requestId,
                context.startTime
              );
            }

            return NextResponse.json(errorResponse, { status: 400 });
          }

          // Add validated data to context
          context.validatedData = validationResult.data;
        }

        // Custom middleware (if any)
        if (config.custom) {
          for (const customMiddleware of config.custom) {
            const result = await customMiddleware(request, context);
            if (result) {
              // Custom middleware returned a response, terminate early
              return result;
            }
          }
        }

        // Step 2: Execute the main handler
        const response = await handler(request, context);

        // Step 3: Post-request middleware

        // Add CORS headers to response (if enabled)
        if (config.cors !== false) {
          const corsConfig = config.cors === true ? {} : config.cors;
          const corsMiddleware = cors(corsConfig as CorsOptions);
          corsMiddleware.actual(request, response);
        }

        // Add rate limit headers (if enabled)
        if (config.rateLimit !== false) {
          let rateLimitMiddleware;

          if (config.rateLimit === true) {
            rateLimitMiddleware = getRateLimitConfig('standard');
          } else if (typeof config.rateLimit === 'string') {
            rateLimitMiddleware = getRateLimitConfig(
              config.rateLimit as keyof typeof rateLimitConfigs
            );
          } else {
            rateLimitMiddleware = rateLimit(config.rateLimit as RateLimitOptions);
          }

          const { rateLimitHeaders } = rateLimitMiddleware.check(request);
          if (rateLimitHeaders) {
            rateLimitMiddleware.addHeaders(response, rateLimitHeaders);
          }
        }

        // Logging (completion)
        if (loggingMiddleware) {
          loggingMiddleware.afterResponse(request, response, context.requestId, context.startTime);
        }

        return response;
      } catch (error) {
        // Global error handling
        const errorConfig =
          config.errorHandler === false
            ? undefined
            : config.errorHandler === true
              ? {}
              : config.errorHandler;

        const errorMiddleware = errorHandler(errorConfig);

        const errorContext = {
          requestId: context.requestId,
          method: request.method,
          url: request.url,
          ip:
            request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || undefined,
        };

        return errorMiddleware.handle(error as Error, errorContext);
      }
    };
  };
}

/**
 * Predefined middleware configurations
 */
export const middlewareConfigs = {
  // Minimal configuration for health checks and simple endpoints
  minimal: {
    cors: false,
    logging: false,
    errorHandler: true,
    rateLimit: false,
  },

  // Standard configuration for most API endpoints
  standard: {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
    logging: {
      enablePerformanceMetrics: true,
      enableRequestLogging: true,
      enableResponseLogging: true,
      enableErrorLogging: true,
    },
    errorHandler: true,
    rateLimit: 'standard',
  },

  // Strict configuration for sensitive endpoints
  strict: {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
    logging: {
      enablePerformanceMetrics: true,
      enableRequestLogging: true,
      enableResponseLogging: false,
      enableErrorLogging: true,
      redactSensitiveData: true,
    },
    errorHandler: {
      includeStackTrace: false,
      sanitizeErrorMessages: true,
    },
    rateLimit: 'auth',
  },

  // Admin configuration with enhanced security
  admin: {
    cors: {
      origin: process.env.ADMIN_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
      credentials: true,
    },
    logging: {
      enablePerformanceMetrics: true,
      enableRequestLogging: true,
      enableResponseLogging: false,
      enableErrorLogging: true,
      redactSensitiveData: true,
    },
    errorHandler: {
      includeStackTrace: false,
      sanitizeErrorMessages: true,
    },
    rateLimit: 'admin',
  },

  // Development configuration with detailed logging
  development: {
    cors: true,
    logging: {
      enablePerformanceMetrics: true,
      enableRequestLogging: true,
      enableResponseLogging: true,
      enableErrorLogging: true,
      redactSensitiveData: false,
    },
    errorHandler: {
      includeStackTrace: true,
      sanitizeErrorMessages: false,
    },
    rateLimit: 'development',
  },
} as const;

/**
 * Get middleware configuration based on environment
 */
export function getMiddlewareConfig(
  configName: keyof typeof middlewareConfigs,
  environment?: string
): MiddlewareConfig {
  const env = environment || process.env.NODE_ENV || 'development';

  if (env === 'development') {
    return middlewareConfigs.development;
  }

  return middlewareConfigs[configName];
}

/**
 * Helper to create middleware with common configurations
 */
export const createStandardHandler = withMiddleware(middlewareConfigs.standard);
export const createStrictHandler = withMiddleware(middlewareConfigs.strict);
export const createAdminHandler = withMiddleware(middlewareConfigs.admin);
export const createMinimalHandler = withMiddleware(middlewareConfigs.minimal);

/**
 * Helper function to get rate limit config
 */
function getRateLimitConfig(configName: keyof typeof rateLimitConfigs) {
  const environment = process.env.NODE_ENV || 'development';

  if (environment === 'development') {
    return rateLimitConfigs.development;
  }

  return rateLimitConfigs[configName];
}

/**
 * Create custom middleware pipeline
 */
export function createPipeline(...middlewares: Array<MiddlewareConfig>) {
  const combinedConfig: MiddlewareConfig = {};

  middlewares.forEach((middleware) => {
    // Deep merge configurations (simplified version)
    Object.assign(combinedConfig, middleware);
  });

  return withMiddleware(combinedConfig);
}

/**
 * Add custom middleware to existing configuration
 */
export function addCustomMiddleware(
  baseConfig: MiddlewareConfig,
  customMiddleware: (request: NextRequest, context: RequestContext) => Promise<NextResponse | void>
): MiddlewareConfig {
  return {
    ...baseConfig,
    custom: [...(baseConfig.custom || []), customMiddleware],
  };
}
