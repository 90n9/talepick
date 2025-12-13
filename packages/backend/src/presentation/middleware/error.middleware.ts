import { NextRequest, NextResponse } from 'next/server';
import { ErrorCode, createErrorResponse } from '../serializers/apiError';

export interface ErrorContext {
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
}

export interface ErrorHandlingOptions {
  includeStackTrace?: boolean;
  logErrors?: boolean;
  sanitizeErrorMessages?: boolean;
  customErrorHandler?: (error: Error, context: ErrorContext) => NextResponse | null;
  errorReporter?: (error: Error, context: ErrorContext) => void;
}

const defaultErrorOptions: ErrorHandlingOptions = {
  includeStackTrace: process.env.NODE_ENV === 'development',
  logErrors: true,
  sanitizeErrorMessages: process.env.NODE_ENV === 'production',
};

/**
 * Application-specific error types
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, true, code);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true, 'AUTH_FAILED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true, 'INSUFFICIENT_PERMISSIONS');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true, 'RATE_LIMIT_EXCEEDED');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, true, 'DATABASE_ERROR');
  }
}

/**
 * Check if error is operational (expected) vs programming error
 */
function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }

  // Check for common operational errors
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return true;
  }

  return false;
}

/**
 * Sanitize error message for client consumption
 */
function sanitizeErrorMessage(error: Error, options: ErrorHandlingOptions): string {
  if (!options.sanitizeErrorMessages) {
    return error.message;
  }

  // For operational errors, return a safe message
  if (isOperationalError(error)) {
    return error.message;
  }

  // For programming errors, return generic message
  return 'An internal error occurred';
}

/**
 * Extract error code for client response
 */
function getErrorCode(error: Error): string | undefined {
  if (error instanceof AppError) {
    return error.code;
  }

  // Map common error types to codes
  const errorTypeMap: Record<string, string> = {
    ValidationError: 'VALIDATION_ERROR',
    CastError: 'INVALID_ID',
    MongoError: 'DATABASE_ERROR',
    MongoServerError: 'DATABASE_ERROR',
  };

  return errorTypeMap[error.name] || 'INTERNAL_ERROR';
}

/**
 * Determine appropriate HTTP status code
 */
function getStatusCode(error: Error): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  // Map common Node.js/JavaScript errors to HTTP status codes
  if (error.name === 'ValidationError') return 400;
  if (error.name === 'CastError') return 400;
  if (error.name === 'MongoServerError') {
    // Handle specific MongoDB error codes
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) return 409; // Duplicate key
    if (mongoError.code === 2) return 400; // Bad value
    return 500;
  }

  return 500;
}

/**
 * Enhanced error handling middleware
 */
export function errorHandler(options: ErrorHandlingOptions = {}) {
  const config = { ...defaultErrorOptions, ...options };

  return {
    handle: (error: Error, context: ErrorContext): NextResponse => {
      // Try custom error handler first
      if (config.customErrorHandler) {
        const customResponse = config.customErrorHandler(error, context);
        if (customResponse) {
          return customResponse;
        }
      }

      // Determine error properties
      const statusCode = getStatusCode(error);
      const isOperational = isOperationalError(error);
      const message = sanitizeErrorMessage(error, config);
      const code = getErrorCode(error);

      // Log the error
      if (config.logErrors) {
        const logData = {
          error: {
            name: error.name,
            message: error.message,
            stack: config.includeStackTrace ? error.stack : undefined,
            code,
            isOperational,
            statusCode,
          },
          context,
        };

        if (isOperational) {
          console.warn('Operational Error:', JSON.stringify(logData, null, 2));
        } else {
          console.error('Programming Error:', JSON.stringify(logData, null, 2));
        }
      }

      // Report to external service (e.g., Sentry, DataDog)
      if (config.errorReporter && !isOperational) {
        try {
          config.errorReporter(error, context);
        } catch (reportingError) {
          console.error('Error reporting failed:', reportingError);
        }
      }

      // Create error response
      let errorDetails: unknown;

      // Include stack trace in development
      if (config.includeStackTrace && error.stack) {
        errorDetails = {
          stack: error.stack,
        };
      }

      // Include request ID in the response
      const requestId = context.requestId;

      return createErrorResponse(code as ErrorCode, message, errorDetails, requestId);
    },

    /**
     * Wrap async route handlers to catch errors
     */
    wrap: <T extends NextRequest>(handler: (request: T) => Promise<NextResponse>) => {
      return async (request: T): Promise<NextResponse> => {
        try {
          return await handler(request);
        } catch (error) {
          const context: ErrorContext = {
            method: request.method,
            url: request.url,
            ip:
              request.headers.get('x-forwarded-for') ||
              request.headers.get('x-real-ip') ||
              'unknown',
            userAgent: request.headers.get('user-agent') || undefined,
          };

          return errorHandler(config).handle(error as Error, context);
        }
      };
    },
  };
}

/**
 * Default error handler instance
 */
export const defaultErrorHandler = errorHandler();

/**
 * Development error handler with detailed information
 */
export const developmentErrorHandler = errorHandler({
  includeStackTrace: true,
  sanitizeErrorMessages: false,
  logErrors: true,
});

/**
 * Production error handler with security considerations
 */
export const productionErrorHandler = errorHandler({
  includeStackTrace: false,
  sanitizeErrorMessages: true,
  logErrors: true,
});

/**
 * Create an error response manually
 */
export function createSimpleErrorResponse(
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  statusCode: number = 500,
  code?: string,
  requestId?: string
): NextResponse {
  const errorDetails = code ? { code } : undefined;
  return createErrorResponse(
    (code as ErrorCode) || ErrorCode.INTERNAL_SERVER_ERROR,
    message,
    errorDetails,
    requestId
  );
}

/**
 * Handle 404 errors for unknown routes
 */
export function notFoundHandler(request: NextRequest): NextResponse {
  return createSimpleErrorResponse(
    `Route ${request.method} ${request.url} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
}
