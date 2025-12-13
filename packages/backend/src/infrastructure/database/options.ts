/**
 * Database connection options mapped from environment variables
 * Provides sensible defaults and allows override via environment configuration
 */

export interface DatabaseOptions {
  bufferCommands: boolean;
  maxPoolSize: number;
  minPoolSize: number;
  maxIdleTimeMS: number;
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
  connectTimeoutMS: number;
  heartbeatFrequencyMS: number;
  retryWrites: boolean;
  retryReads: boolean;
}

/**
 * Get database connection options from environment variables
 * @returns DatabaseOptions configuration object
 */
export function getDatabaseOptions(): DatabaseOptions {
  return {
    // Buffer commands when disconnected (helps with initial connection spikes)
    bufferCommands: process.env.MONGODB_BUFFER_COMMANDS !== 'false',

    // Connection pool settings
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10', 10),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '1', 10),
    maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || '30000', 10),

    // Timeout settings (in milliseconds)
    serverSelectionTimeoutMS: parseInt(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000',
      10
    ),
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000', 10),
    connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || '10000', 10),
    heartbeatFrequencyMS: parseInt(process.env.MONGODB_HEARTBEAT_FREQUENCY_MS || '10000', 10),

    // Retry settings
    retryWrites: process.env.MONGODB_RETRY_WRITES !== 'false',
    retryReads: process.env.MONGODB_RETRY_READS !== 'false',
  };
}

/**
 * Validate database options and log warnings for potentially problematic values
 * @param options Database options to validate
 */
export function validateDatabaseOptions(options: DatabaseOptions): void {
  const warnings: string[] = [];

  // Check pool size configurations
  if (options.maxPoolSize < 1) {
    warnings.push(`maxPoolSize (${options.maxPoolSize}) should be at least 1`);
  }

  if (options.minPoolSize > options.maxPoolSize) {
    warnings.push(
      `minPoolSize (${options.minPoolSize}) should not exceed maxPoolSize (${options.maxPoolSize})`
    );
  }

  // Check timeout configurations
  if (options.serverSelectionTimeoutMS < 1000) {
    warnings.push(
      `serverSelectionTimeoutMS (${options.serverSelectionTimeoutMS}) is very low, may cause connection failures`
    );
  }

  if (options.socketTimeoutMS < 5000) {
    warnings.push(
      `socketTimeoutMS (${options.socketTimeoutMS}) is very low, may cause premature disconnections`
    );
  }

  // Check heartbeat frequency
  if (options.heartbeatFrequencyMS < 1000) {
    warnings.push(
      `heartbeatFrequencyMS (${options.heartbeatFrequencyMS}) is very low, may cause unnecessary network traffic`
    );
  }

  // Log warnings if any
  if (warnings.length > 0) {
    console.warn('⚠️ Database Configuration Warnings:');
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
}

/**
 * Get a summary of database options for logging
 * @param options Database options to summarize
 * @returns Formatted summary string
 */
export function getDatabaseOptionsSummary(
  options: DatabaseOptions
): Record<string, string | number | boolean> {
  return {
    'Buffer Commands': options.bufferCommands,
    'Max Pool Size': options.maxPoolSize,
    'Min Pool Size': options.minPoolSize,
    'Max Idle Time': `${options.maxIdleTimeMS}ms`,
    'Server Selection Timeout': `${options.serverSelectionTimeoutMS}ms`,
    'Socket Timeout': `${options.socketTimeoutMS}ms`,
    'Connect Timeout': `${options.connectTimeoutMS}ms`,
    'Heartbeat Frequency': `${options.heartbeatFrequencyMS}ms`,
    'Retry Writes': options.retryWrites,
    'Retry Reads': options.retryReads,
  };
}

/**
 * Database configuration for different environments
 */
export const ENVIRONMENT_DEFAULTS = {
  development: {
    maxPoolSize: 5,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
  },
  test: {
    maxPoolSize: 1,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    heartbeatFrequencyMS: 5000,
  },
  production: {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 60000,
    heartbeatFrequencyMS: 10000,
  },
} as const;

/**
 * Get environment-specific database options
 * @param environment Current environment (development, test, production)
 * @returns Database options with environment-appropriate defaults
 */
export function getEnvironmentDatabaseOptions(
  environment: keyof typeof ENVIRONMENT_DEFAULTS = 'development'
): DatabaseOptions {
  const envDefaults = ENVIRONMENT_DEFAULTS[environment];
  const options = getDatabaseOptions();

  // Apply environment defaults where environment variables are not set
  return {
    ...options,
    maxPoolSize: options.maxPoolSize || envDefaults.maxPoolSize,
    minPoolSize: options.minPoolSize || envDefaults.minPoolSize,
    serverSelectionTimeoutMS:
      options.serverSelectionTimeoutMS || envDefaults.serverSelectionTimeoutMS,
    socketTimeoutMS: options.socketTimeoutMS || envDefaults.socketTimeoutMS,
    heartbeatFrequencyMS: options.heartbeatFrequencyMS || envDefaults.heartbeatFrequencyMS,
  };
}
