/**
 * Centralized configuration exports
 */

// Main configuration modules
export { config, databaseConfig, apiConfig, appConfig } from './env';

// Utility functions
export {
  getMongoConnectionOptions,
  getMongoConnectionString,
  validateDatabaseConfig,
  getPoolConfiguration,
} from './database';

export {
  getRateLimitConfig,
  getLoggingConfig,
  getCorsConfig,
  validateApiConfig,
  shouldEnableMiddleware,
  shouldLog,
} from './api';

// Types
export type { DatabaseConfig, APIConfig, AppConfig } from './types';
export type { LogLevel, NodeEnv } from './types';

// Defaults
export { ENVIRONMENT_DEFAULTS } from './types';
