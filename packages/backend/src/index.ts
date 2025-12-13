// Export Use Cases
export { HelloUseCase } from './application/use-cases/HelloUseCase';
export { SpendCreditsUseCase } from './application/use-cases/SpendCreditsUseCase';

// Export DTOs
export { HelloRequest, HelloResponse } from './application/dto/HelloRequest';

// Export Controllers
export { HelloController } from './presentation/controllers/HelloController';
export { BaseController } from './presentation/controllers/BaseController';

// Export Serializers
export * from './presentation/serializers/apiResponse';
export * from './presentation/serializers/apiError';

// Export Domain Entities
export { User } from './domain/entities/User';

// Export Domain Services
export { CreditService } from './domain/services/CreditService';

// Export Repository Interfaces
export { IUserRepository } from './domain/repositories/IUserRepository';
export { ICreditRepository } from './domain/repositories/ICreditRepository';

// Export Database Utilities
export {
  default as connectDB,
  disconnectDB,
  checkDatabaseHealth,
  getConnectionState,
} from './infrastructure/database/connection';
export { performHealthCheck, getDatabaseHealth } from './infrastructure/database/health';
export {
  getDatabaseOptions,
  validateDatabaseOptions,
  getEnvironmentDatabaseOptions,
} from './infrastructure/database/options';

// Export Configuration
export * from './infrastructure/config';

// Export Middleware
export {
  cors,
  corsConfigs,
  getCorsConfig as getCorsMiddlewareConfig,
} from './presentation/middleware/cors.middleware';
export {
  logger,
  requestLogger,
  productionLogger,
} from './presentation/middleware/logging.middleware';
export {
  errorHandler,
  defaultErrorHandler,
  developmentErrorHandler,
  productionErrorHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  createSimpleErrorResponse,
  notFoundHandler,
  type ErrorContext,
  type ErrorHandlingOptions,
} from './presentation/middleware/error.middleware';
export {
  rateLimit,
  rateLimitConfigs,
  getRateLimitConfig as getRateLimitMiddlewareConfig,
  withRateLimit,
  createRateLimit,
  type RateLimitOptions,
  type RateLimitCheckResult,
} from './presentation/middleware/rateLimit.middleware';
export {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders,
  commonSchemas,
  validationConfigs,
  type ValidationOptions,
  type ValidationResult,
} from './presentation/middleware/validation.middleware';
export {
  withMiddleware,
  middlewareConfigs,
  getMiddlewareConfig,
  createStandardHandler,
  createStrictHandler,
  createAdminHandler,
  createMinimalHandler,
  createPipeline,
  addCustomMiddleware,
  type MiddlewareConfig,
  type RequestContext,
  type MiddlewareResult,
} from './presentation/middleware/withMiddleware';
