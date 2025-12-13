import { NextRequest, NextResponse } from 'next/server';
import {
  createSuccessResponse,
  createPaginatedResponse,
  createNoContentResponse,
  ApiPaginationMeta,
} from '../serializers/apiResponse';
import {
  createErrorResponse,
  createInternalServerErrorResponse,
  ErrorCode,
} from '../serializers/apiError';

export abstract class BaseController {
  protected getRequestId(request: NextRequest): string {
    return (
      request.headers.get('x-request-id') ||
      request.headers.get('x-correlation-id') ||
      crypto.randomUUID()
    );
  }

  protected success<T>(data: T, message?: string, request?: NextRequest): NextResponse {
    return createSuccessResponse(data, message, request ? this.getRequestId(request) : undefined);
  }

  protected paginated<T>(
    items: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
    request?: NextRequest
  ): NextResponse {
    const totalPages = Math.ceil(total / limit);
    const meta: ApiPaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return createPaginatedResponse(
      items,
      meta,
      message,
      request ? this.getRequestId(request) : undefined
    );
  }

  protected noContent(): NextResponse {
    return createNoContentResponse();
  }

  protected error(
    code: ErrorCode,
    message?: string,
    details?: unknown,
    request?: NextRequest
  ): NextResponse {
    return createErrorResponse(
      code,
      message,
      details,
      request ? this.getRequestId(request) : undefined
    );
  }

  protected handleError(error: unknown, request?: NextRequest): NextResponse {
    // Handle known error types
    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;

      if (err.name === 'ValidationError') {
        return this.error(
          ErrorCode.VALIDATION_ERROR,
          'Invalid input data',
          this.formatValidationError(err),
          request
        );
      }

      if (err.name === 'CastError') {
        return this.error(
          ErrorCode.BAD_REQUEST,
          'Invalid ID format',
          { field: err.path, value: err.value },
          request
        );
      }

      if (err.code === 11000 && err.keyPattern) {
        return this.error(
          ErrorCode.CONFLICT,
          'Resource already exists',
          { field: Object.keys(err.keyPattern as Record<string, unknown>)[0] },
          request
        );
      }
    }

    // Log and return generic error for unknown errors
    return createInternalServerErrorResponse(
      error instanceof Error ? error : new Error(String(error)),
      request ? this.getRequestId(request) : undefined
    );
  }

  private formatValidationError(error: Record<string, unknown>): Record<string, string> {
    const errors: Record<string, string> = {};

    if (error.errors && typeof error.errors === 'object') {
      for (const [key, err] of Object.entries(error.errors)) {
        if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
          errors[key] = err.message;
        }
      }
    }

    return errors;
  }

  protected async withErrorHandling(
    operation: () => Promise<NextResponse>,
    request?: NextRequest
  ): Promise<NextResponse> {
    try {
      return await operation();
    } catch (error) {
      return this.handleError(error, request);
    }
  }
}
