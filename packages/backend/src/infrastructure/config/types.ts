/**
 * Type definitions for configuration modules
 */

export interface DatabaseConfig {
  url: string;
  connectionTimeoutMs: number;
  maxPoolSize: number;
  minPoolSize: number;
  options: {
    bufferCommands: boolean;
    serverSelectionTimeoutMS: number;
    maxPoolSize: number;
    minPoolSize: number;
    autoIndex: boolean;
    retryWrites: boolean;
    w: 'majority' | 'acknowledged' | 'unacknowledged';
    readPreference: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
  };
}

export interface APIConfig {
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  corsOrigin?: string;
  enableRateLimiting: boolean;
  enableRequestLogging: boolean;
  enableCors: boolean;
}

export interface AppConfig {
  nodeEnv: 'development' | 'test' | 'production' | 'staging';
  port: number;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  jwtSecret?: string;
  jwtExpiresIn: string;
}

export interface EnvironmentDefaults {
  development: {
    maxPoolSize: number;
    minPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
  };
  production: {
    maxPoolSize: number;
    minPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
  };
  test: {
    maxPoolSize: number;
    minPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
  };
}

// Environment-specific defaults
export const ENVIRONMENT_DEFAULTS: EnvironmentDefaults = {
  development: {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
  production: {
    maxPoolSize: 50,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 30000,
  },
  test: {
    maxPoolSize: 1,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 15000,
  },
};

// Export individual types for specific use cases
export type LogLevel = APIConfig['logLevel'];
export type NodeEnv = AppConfig['nodeEnv'];
