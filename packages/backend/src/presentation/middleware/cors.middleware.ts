import { NextRequest, NextResponse } from 'next/server';

export interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  optionsSuccessStatus?: number;
}

const defaultCorsOptions: CorsOptions = {
  origin: false, // Default: no CORS (same-origin only)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: [],
  credentials: false,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 204,
};

/**
 * CORS middleware for Next.js API routes
 * Only enables CORS when needed - same-origin calls don't require CORS
 *
 * @param options CORS configuration options
 * @returns NextResponse with appropriate CORS headers
 */
export function cors(options: CorsOptions = {}): {
  preflight: (request: NextRequest) => NextResponse;
  actual: (request: NextRequest, response?: NextResponse) => NextResponse;
} {
  const config = { ...defaultCorsOptions, ...options };

  const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin || config.origin === false) {
      return false;
    }

    if (config.origin === true) {
      return true;
    }

    if (typeof config.origin === 'string') {
      return origin === config.origin;
    }

    if (Array.isArray(config.origin)) {
      return config.origin.includes(origin);
    }

    return false;
  };

  const getCorsHeaders = (request: NextRequest): Record<string, string> => {
    const origin = request.headers.get('origin');
    const headers: Record<string, string> = {};

    // Only set Access-Control-Allow-Origin if origin is allowed
    if (origin && isOriginAllowed(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;

      if (config.credentials) {
        headers['Access-Control-Allow-Credentials'] = 'true';
      }
    }

    // Set other CORS headers regardless of origin
    if (config.allowedHeaders && config.allowedHeaders.length > 0) {
      headers['Access-Control-Allow-Methods'] = config.methods?.join(', ') || '';
      headers['Access-Control-Allow-Headers'] = config.allowedHeaders.join(', ');
    }

    if (config.exposedHeaders && config.exposedHeaders.length > 0) {
      headers['Access-Control-Expose-Headers'] = config.exposedHeaders.join(', ');
    }

    if (config.maxAge !== undefined) {
      headers['Access-Control-Max-Age'] = config.maxAge.toString();
    }

    return headers;
  };

  const preflight = (request: NextRequest): NextResponse => {
    if (request.method !== 'OPTIONS') {
      // This shouldn't happen in practice, but handle gracefully
      return actual(request);
    }

    const headers = getCorsHeaders(request);
    const response = new NextResponse(null, {
      status: config.optionsSuccessStatus || 204,
    });

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };

  const actual = (request: NextRequest, response?: NextResponse): NextResponse => {
    const headers = getCorsHeaders(request);
    const finalResponse = response || new NextResponse();

    Object.entries(headers).forEach(([key, value]) => {
      finalResponse.headers.set(key, value);
    });

    return finalResponse;
  };

  return { preflight, actual };
}

/**
 * CORS configuration for different environments
 */
export const corsConfigs = {
  development: {
    origin: ['http://localhost:3000', 'http://localhost:3001'] as string[],
    credentials: true,
  },
  production: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ([] as string[]),
    credentials: true,
  },
  test: {
    origin: true,
    credentials: false,
  },
} as const;

/**
 * Get environment-specific CORS configuration
 */
export function getCorsConfig(environment?: keyof typeof corsConfigs): CorsOptions {
  const env = environment || (process.env.NODE_ENV as keyof typeof corsConfigs) || 'development';
  return corsConfigs[env];
}
