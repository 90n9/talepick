import { NextResponse } from 'next/server';

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  requestId?: string;
}

export enum ErrorCode {
  // Server errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
}

export interface ErrorDetails {
  field?: string;
  value?: unknown;
  constraint?: string;
  [key: string]: unknown;
}

const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.DATABASE_CONNECTION_ERROR]: 503,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,

  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,

  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.TOKEN_INVALID]: 401,
  [ErrorCode.ACCOUNT_NOT_VERIFIED]: 403,
  [ErrorCode.ACCOUNT_DISABLED]: 403,
};

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred',
  [ErrorCode.DATABASE_CONNECTION_ERROR]: 'Database connection failed',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',

  [ErrorCode.BAD_REQUEST]: 'Invalid request',
  [ErrorCode.UNAUTHORIZED]: 'Authentication required',
  [ErrorCode.FORBIDDEN]: 'Access denied',
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.METHOD_NOT_ALLOWED]: 'Method not allowed',
  [ErrorCode.CONFLICT]: 'Resource conflict',
  [ErrorCode.VALIDATION_ERROR]: 'Invalid input data',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests',

  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials',
  [ErrorCode.TOKEN_EXPIRED]: 'Token has expired',
  [ErrorCode.TOKEN_INVALID]: 'Invalid token',
  [ErrorCode.ACCOUNT_NOT_VERIFIED]: 'Account not verified',
  [ErrorCode.ACCOUNT_DISABLED]: 'Account is disabled',
};

export function createErrorResponse(
  code: ErrorCode,
  message?: string,
  details?: unknown,
  requestId?: string
): NextResponse<ApiError> {
  const status = ERROR_STATUS_MAP[code];
  const errorMessage = message || ERROR_MESSAGES[code];

  // Log server errors with full details for debugging
  if (status >= 500) {
    console.error(`Server Error [${code}]:`, {
      message: errorMessage,
      details,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message: errorMessage,
        // Only include details for client errors (4xx) and safe validation errors
        ...(status < 500 &&
          status !== 401 &&
          status !== 403 && {
            details: details as ErrorDetails,
          }),
      },
      timestamp: new Date().toISOString(),
      requestId,
    },
    { status }
  );
}

export function createInternalServerErrorResponse(
  error?: Error,
  requestId?: string
): NextResponse<ApiError> {
  // Log the actual error for debugging
  if (error) {
    console.error('Internal Server Error:', {
      message: error.message,
      stack: error.stack,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  return createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR, undefined, undefined, requestId);
}
