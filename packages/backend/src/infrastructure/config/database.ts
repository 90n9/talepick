import { databaseConfig } from './env';
import type { DatabaseConfig } from './types';

/**
 * Database-specific configuration utilities
 */

/**
 * Get MongoDB connection options for the current environment
 */
export function getMongoConnectionOptions(): DatabaseConfig['options'] {
  return databaseConfig.options;
}

/**
 * Get database connection string with proper error handling
 */
export function getMongoConnectionString(): string {
  if (!databaseConfig.url) {
    throw new Error('MongoDB connection URL is not configured');
  }
  return databaseConfig.url;
}

/**
 * Validate database configuration
 */
export function validateDatabaseConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!databaseConfig.url) {
    errors.push('MongoDB URL is required');
  }

  if (databaseConfig.maxPoolSize < 1) {
    errors.push('Max pool size must be at least 1');
  }

  if (databaseConfig.minPoolSize < 1) {
    errors.push('Min pool size must be at least 1');
  }

  if (databaseConfig.minPoolSize > databaseConfig.maxPoolSize) {
    errors.push('Min pool size cannot be greater than max pool size');
  }

  if (databaseConfig.connectionTimeoutMs < 1000) {
    errors.push('Connection timeout must be at least 1000ms');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get pool configuration summary for monitoring
 */
export function getPoolConfiguration() {
  return {
    maxPoolSize: databaseConfig.maxPoolSize,
    minPoolSize: databaseConfig.minPoolSize,
    connectionTimeoutMs: databaseConfig.connectionTimeoutMs,
    autoIndex: databaseConfig.options.autoIndex,
    retryWrites: databaseConfig.options.retryWrites,
  };
}

/**
 * Export the complete database configuration for use in other modules
 */
export { databaseConfig };

// Re-export types for convenience
export type { DatabaseConfig } from './types';
