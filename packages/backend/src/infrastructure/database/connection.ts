import mongoose from 'mongoose';
import {
  validateDatabaseOptions,
  getEnvironmentDatabaseOptions,
  ENVIRONMENT_DEFAULTS,
} from './options';

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error('Please define the MONGODB_URL environment variable');
}

// Extend global type for cached connection
declare global {
  var mongooseCache:
    | {
        conn: import('mongoose').Mongoose | null;
        promise: Promise<import('mongoose').Mongoose> | null;
        isShuttingDown?: boolean;
      }
    | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null, isShuttingDown: false };
}

/**
 * Enhanced database connection with health monitoring and graceful shutdown
 * Note: Connection pooling is per Node.js process. In development (single instance),
 * this effectively maintains one pool per process.
 */
async function connectDB(): Promise<mongoose.Mongoose> {
  // Return existing connection if available
  if (cached!.conn && cached!.conn.connection.readyState === 1) {
    return cached!.conn;
  }

  // Prevent new connections during shutdown
  if (cached!.isShuttingDown) {
    throw new Error('Database connection is shutting down');
  }

  // Create connection promise if not exists
  if (!cached!.promise) {
    const environment =
      (process.env.NODE_ENV as keyof typeof ENVIRONMENT_DEFAULTS) || 'development';
    const connectionOptions = {
      ...getEnvironmentDatabaseOptions(environment),
      bufferCommands: false,
      // Mongoose handles reconnection automatically; avoid custom retry logic
    };

    // Validate options and log warnings
    validateDatabaseOptions(connectionOptions);

    console.log('🔧 Database connection options:', {
      Environment: environment,
      'Max Pool Size': connectionOptions.maxPoolSize,
      'Server Selection Timeout': `${connectionOptions.serverSelectionTimeoutMS}ms`,
      'Socket Timeout': `${connectionOptions.socketTimeoutMS}ms`,
    });

    cached!.promise = mongoose.connect(MONGODB_URL!, connectionOptions);
  }

  try {
    cached!.conn = await cached!.promise;
    console.log('✅ MongoDB connected successfully');

    // Set up connection event listeners
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      // Clear promise on error to allow reconnection attempts
      if (cached) {
        cached.promise = null;
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
      // Clear connection to force reconnection on next call
      if (cached) {
        cached.conn = null;
        cached.promise = null;
      }
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
  } catch (error) {
    cached!.promise = null;
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }

  return cached!.conn;
}

/**
 * Perform lightweight health check on database connection
 * @returns Promise<boolean> - true if connection is healthy
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Quick readyState check first
    if (mongoose.connection.readyState !== 1) {
      return false;
    }

    // Lightweight ping - admin command is minimal overhead
    await mongoose.connection.db?.admin().ping();
    return true;
  } catch (error) {
    console.warn('Database health check failed:', error);
    return false;
  }
}

/**
 * Graceful shutdown of database connection
 */
export async function disconnectDB(): Promise<void> {
  if (cached?.isShuttingDown) {
    return; // Already shutting down
  }

  cached!.isShuttingDown = true;
  console.log('🔄 Starting graceful database shutdown...');

  try {
    if (cached!.conn) {
      await cached!.conn.connection.close();
      console.log('✅ Database connection closed successfully');
    }
  } catch (error) {
    console.error('❌ Error during database shutdown:', error);
  } finally {
    // Clear cache
    cached!.conn = null;
    cached!.promise = null;
    cached!.isShuttingDown = false;
  }
}

/**
 * Get current connection state information
 */
export function getConnectionState() {
  const readyState = mongoose.connection.readyState;
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  } as const;

  return {
    state: stateMap[readyState as keyof typeof stateMap] || 'unknown',
    readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    isShuttingDown: cached?.isShuttingDown || false,
  };
}

// Set up graceful shutdown handlers
if (typeof process !== 'undefined') {
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🔄 Received ${signal}, starting graceful shutdown...`);
    await disconnectDB();
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default connectDB;
