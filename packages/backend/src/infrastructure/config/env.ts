import { z } from 'zod';
import type { DatabaseConfig, APIConfig, AppConfig } from './types';

/**
 * Environment-specific configuration with Zod validation
 * This module handles server-side environment parsing only
 */

// Environment schema for validation
const EnvironmentSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production', 'staging']).default('development'),

  // Database configuration
  MONGODB_URL: z.string().min(1, 'MongoDB URL is required'),
  DB_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  DB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(10),
  DB_MIN_POOL_SIZE: z.coerce.number().int().positive().default(2),

  // API configuration
  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 minutes
  API_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  API_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  API_CORS_ORIGIN: z.string().optional(),

  // Application configuration
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
  JWT_EXPIRES_IN: z.string().default('24h'),

  // Feature flags
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(true),
  ENABLE_REQUEST_LOGGING: z.coerce.boolean().default(true),
  ENABLE_CORS: z.coerce.boolean().default(false),
});

// Validate and parse environment variables
function validateEnvironment() {
  try {
    return EnvironmentSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error);
    process.exit(1);
  }
}

// Get validated environment
const env = validateEnvironment();

/**
 * Database configuration
 */
export const databaseConfig: DatabaseConfig = {
  url: env.MONGODB_URL,
  connectionTimeoutMs: env.DB_CONNECTION_TIMEOUT_MS,
  maxPoolSize: env.DB_MAX_POOL_SIZE,
  minPoolSize: env.DB_MIN_POOL_SIZE,
  // Additional options based on environment
  options: {
    bufferCommands: false,
    serverSelectionTimeoutMS: env.DB_CONNECTION_TIMEOUT_MS,
    maxPoolSize: env.DB_MAX_POOL_SIZE,
    minPoolSize: env.DB_MIN_POOL_SIZE,
    // Disable autoIndex in production
    autoIndex: env.NODE_ENV !== 'production',
    // Enable retry writes for better reliability
    retryWrites: true,
    // Write concern
    w: 'majority',
    // Read preference
    readPreference: 'primaryPreferred',
  },
};

/**
 * API configuration
 */
export const apiConfig: APIConfig = {
  rateLimitWindowMs: env.API_RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: env.API_RATE_LIMIT_MAX_REQUESTS,
  logLevel: env.API_LOG_LEVEL,
  corsOrigin: env.API_CORS_ORIGIN,
  enableRateLimiting: env.ENABLE_RATE_LIMITING,
  enableRequestLogging: env.ENABLE_REQUEST_LOGGING,
  enableCors: env.ENABLE_CORS,
};

/**
 * General application configuration
 */
export const appConfig: AppConfig = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
};

/**
 * Export all configurations
 */
export const config = {
  database: databaseConfig,
  api: apiConfig,
  app: appConfig,
  env, // Raw validated environment for debugging
};

// Export defaults
export { ENVIRONMENT_DEFAULTS } from './types';

// Log configuration in development (without sensitive data)
if (appConfig.isDevelopment) {
  console.log('🔧 Configuration loaded:', {
    Environment: appConfig.nodeEnv,
    Database: {
      'Connection Timeout': `${databaseConfig.connectionTimeoutMs}ms`,
      'Max Pool Size': databaseConfig.maxPoolSize,
      'Min Pool Size': databaseConfig.minPoolSize,
    },
    API: {
      'Rate Limiting': apiConfig.enableRateLimiting
        ? `Enabled (${apiConfig.rateLimitMaxRequests}/${apiConfig.rateLimitWindowMs}ms)`
        : 'Disabled',
      'Request Logging': apiConfig.enableRequestLogging ? 'Enabled' : 'Disabled',
      'Log Level': apiConfig.logLevel,
    },
    App: {
      Port: appConfig.port,
      'JWT Expiry': appConfig.jwtExpiresIn,
    },
  });
}
