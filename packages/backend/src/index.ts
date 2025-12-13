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

// Export Middleware
export * from './presentation/middleware/cors.middleware';
export * from './presentation/middleware/logging.middleware';
export * from './presentation/middleware/error.middleware';
export * from './presentation/middleware/rateLimit.middleware';
export * from './presentation/middleware/validation.middleware';
export * from './presentation/middleware/withMiddleware';
