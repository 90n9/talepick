import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema, ZodError } from 'zod';

export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
  strict?: boolean; // Fail on unknown fields
  transform?: boolean; // Transform data according to schema
  customValidators?: Array<{
    name: string;
    validator: (value: unknown, data: unknown) => boolean | string;
  }>;
}

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
    value?: unknown;
  }>;
}

/**
 * Extract and parse request data based on content type
 */
function parseRequestBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get('content-type');

  if (!contentType) {
    return Promise.resolve({});
  }

  if (contentType.includes('application/json')) {
    return request.json();
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return request.formData().then((formData) => {
      const data: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      return data;
    });
  }

  if (contentType.includes('multipart/form-data')) {
    return request.formData().then((formData) => {
      const data: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        if (value instanceof File) {
          data[key] = {
            name: value.name,
            size: value.size,
            type: value.type,
            // Note: For actual file handling, you'd need to process the file buffer
          };
        } else {
          data[key] = value;
        }
      });
      return data;
    });
  }

  return Promise.resolve({});
}

/**
 * Parse URL query parameters
 */
function parseQueryParams(request: NextRequest): Record<string, unknown> {
  const { searchParams } = new URL(request.url);
  const params: Record<string, unknown> = {};

  searchParams.forEach((value, key) => {
    // Try to parse as number or boolean if appropriate
    if (value === 'true') {
      params[key] = true;
    } else if (value === 'false') {
      params[key] = false;
    } else if (/^\d+$/.test(value)) {
      params[key] = parseInt(value, 10);
    } else if (/^\d*\.\d+$/.test(value)) {
      params[key] = parseFloat(value);
    } else {
      params[key] = value;
    }
  });

  return params;
}

/**
 * Parse route parameters from URL
 * Note: This is a simplified version. In practice, you might want to
 * use the Next.js dynamic route parameters
 */
function parseRouteParams(): Record<string, unknown> {
  // This would need to be customized based on your route structure
  // For now, return empty object
  return {};
}

/**
 * Parse request headers
 */
function parseHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

/**
 * Format Zod validation errors into a consistent format
 */
function formatZodError(error: ZodError): Array<{
  field: string;
  message: string;
  code: string;
  value?: unknown;
}> {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    value: (err as { received?: unknown }).received,
  }));
}

/**
 * Run custom validators
 */
function runCustomValidators(
  data: Record<string, unknown>,
  customValidators: ValidationOptions['customValidators']
): Array<{ field: string; message: string; code: string }> {
  const errors: Array<{ field: string; message: string; code: string }> = [];

  if (!customValidators) {
    return errors;
  }

  customValidators.forEach(({ name, validator }) => {
    const result = validator(data[name], data);
    if (result !== true) {
      errors.push({
        field: name,
        message: typeof result === 'string' ? result : `Validation failed for ${name}`,
        code: 'CUSTOM_VALIDATION',
      });
    }
  });

  return errors;
}

/**
 * Validation middleware using Zod schemas
 */
export function validate(options: ValidationOptions) {
  return {
    validateRequest: async (request: NextRequest): Promise<ValidationResult> => {
      try {
        const parsedData: Record<string, unknown> = {};

        // Parse request body
        if (options.body) {
          parsedData.body = await parseRequestBody(request);
        }

        // Parse query parameters
        if (options.query) {
          parsedData.query = parseQueryParams(request);
        }

        // Parse route parameters
        if (options.params) {
          parsedData.params = parseRouteParams();
        }

        // Parse headers
        if (options.headers) {
          parsedData.headers = parseHeaders(request);
        }

        const data: Record<string, unknown> = {};
        const errors: Array<{ field: string; message: string; code: string; value?: unknown }> = [];

        // Validate each part
        const validationPromises = [
          options.body
            ? options.body
                .parseAsync(parsedData.body)
                .then((result) => {
                  data.body = result;
                })
                .catch((error) => {
                  if (error instanceof ZodError) {
                    errors.push(
                      ...formatZodError(error).map((err) => ({
                        ...err,
                        field: `body.${err.field}`,
                      }))
                    );
                  }
                  throw error;
                })
            : Promise.resolve(),

          options.query
            ? options.query
                .parseAsync(parsedData.query)
                .then((result) => {
                  data.query = result;
                })
                .catch((error) => {
                  if (error instanceof ZodError) {
                    errors.push(
                      ...formatZodError(error).map((err) => ({
                        ...err,
                        field: `query.${err.field}`,
                      }))
                    );
                  }
                  throw error;
                })
            : Promise.resolve(),

          options.params
            ? options.params
                .parseAsync(parsedData.params)
                .then((result) => {
                  data.params = result;
                })
                .catch((error) => {
                  if (error instanceof ZodError) {
                    errors.push(
                      ...formatZodError(error).map((err) => ({
                        ...err,
                        field: `params.${err.field}`,
                      }))
                    );
                  }
                  throw error;
                })
            : Promise.resolve(),

          options.headers
            ? options.headers
                .parseAsync(parsedData.headers)
                .then((result) => {
                  data.headers = result;
                })
                .catch((error) => {
                  if (error instanceof ZodError) {
                    errors.push(
                      ...formatZodError(error).map((err) => ({
                        ...err,
                        field: `headers.${err.field}`,
                      }))
                    );
                  }
                  throw error;
                })
            : Promise.resolve(),
        ];

        await Promise.allSettled(validationPromises);

        // Run custom validators
        if (options.customValidators) {
          const combinedData: Record<string, unknown> = {
            ...(data.body || {}),
            ...(data.query || {}),
            ...(data.params || {}),
          };
          const customErrors = runCustomValidators(combinedData, options.customValidators);
          errors.push(...customErrors);
        }

        // Return validation result
        if (errors.length > 0) {
          return {
            success: false,
            errors,
          };
        }

        return {
          success: true,
          data,
        };
      } catch (error) {
        if (error instanceof ZodError) {
          return {
            success: false,
            errors: formatZodError(error),
          };
        }

        throw error;
      }
    },

    /**
     * Wrap a route handler with validation
     */
    wrap: <T extends NextRequest>(
      handler: (request: T, data: ValidationResult) => Promise<NextResponse>
    ) => {
      return async (request: T): Promise<NextResponse> => {
        const validationResult = await validate(options).validateRequest(request);

        if (!validationResult.success) {
          const errorResponse = {
            success: false,
            error: {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: validationResult.errors,
            },
          };

          return NextResponse.json(errorResponse, { status: 400 });
        }

        // Pass validated data to the handler
        return handler(request, validationResult);
      };
    },
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).optional(),
  }),

  sorting: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),

  search: z.object({
    q: z.string().min(1).max(100).optional(),
    search: z.string().min(1).max(100).optional(),
  }),

  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),

  email: z.string().email('Invalid email format'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),

  thaiText: z
    .string()
    .regex(
      /^[\u0E00-\u0E7F\s\d\p{P}\p{S}]*$/u,
      'Must contain only Thai characters, numbers, and punctuation'
    ),

  userRole: z.enum(['user', 'admin', 'moderator']),

  storyGenre: z.enum([
    'romance',
    'horror',
    'adventure',
    'mystery',
    'fantasy',
    'sci-fi',
    'thriller',
    'comedy',
    'drama',
    'historical',
  ]),

  rating: z.coerce.number().min(1).max(5),
} as const;

/**
 * Predefined validation configurations
 */
export const validationConfigs = {
  userRegistration: {
    body: z.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      displayName: z.string().min(2).max(50),
      acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
    }),
  } as ValidationOptions,

  userLogin: {
    body: z.object({
      email: commonSchemas.email,
      password: z.string().min(1),
      rememberMe: z.boolean().optional(),
    }),
  } as ValidationOptions,

  storyQuery: {
    query: z.object({
      page: commonSchemas.pagination.shape.page,
      limit: commonSchemas.pagination.shape.limit,
      offset: commonSchemas.pagination.shape.offset,
      sortBy: commonSchemas.sorting.shape.sortBy,
      sortOrder: commonSchemas.sorting.shape.sortOrder,
      genre: commonSchemas.storyGenre.optional(),
      minRating: commonSchemas.rating.optional(),
      maxRating: commonSchemas.rating.optional(),
      published: z.coerce.boolean().optional(),
    }),
  } as ValidationOptions,

  reviewSubmission: {
    body: z.object({
      storyId: commonSchemas.objectId,
      rating: commonSchemas.rating,
      comment: z.string().min(10).max(1000),
      spoiler: z.boolean().default(false),
    }),
  } as ValidationOptions,
} as const;

/**
 * Create a validation middleware with common schemas
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return validate({ body: schema });
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return validate({ query: schema });
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return validate({ params: schema });
}

export function validateHeaders<T>(schema: ZodSchema<T>) {
  return validate({ headers: schema });
}
