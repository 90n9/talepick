# TalePick Milestone 1.2: API Foundation Implementation Plan

> **Next.js 16 Monorepo** • Clean Architecture • MongoDB • 2025

## 📋 Executive Summary

This implementation plan details the setup of API Foundation for TalePick, establishing the core infrastructure for both frontend and admin applications. The plan builds upon the completed Milestone 1.1 (Development Environment) and creates a solid foundation for the authentication system in Milestone 1.3.

**Current State Assessment**:
- ✅ MongoDB connection utility exists in `packages/backend/src/infrastructure/database/connection.ts`
- ✅ Basic API route exists (`/api/hello` in `apps/frontend`)
- ⚠️ Admin app currently has no API routes yet (add first routes under `apps/admin/app/api/*`)
- ✅ Backend package follows Clean Architecture with controllers, use cases, and models
- ✅ Environment variables are configured
- ⚠️ Health check endpoints need implementation
- ⚠️ API middleware needs to be created and standardized
- ⚠️ Shared utilities for database operations need expansion

---

## 🎯 Implementation Goals

### Primary Objectives
1. **Standardize API Architecture**: Create consistent API patterns across both apps
2. **Establish Infrastructure**: Set up middleware, error handling, and utilities
3. **Health Monitoring**: Implement health checks for development and production
4. **Shared Utilities**: Create reusable database and API utilities
5. **Environment Configuration**: Ensure proper configuration management

### Success Criteria
- [ ] Both frontend and admin apps have working API routes
- [ ] Health check endpoints return database connection status
- [ ] Consistent error handling and response shape across API endpoints
- [ ] Rate limiting available (memory-based is OK for single-instance dev)
- [ ] No CORS middleware required for same-origin `/api/*` (add later only if cross-origin clients exist)
- [ ] Centralized logging for API requests and responses
- [ ] Server-only utilities live in `@talepick/backend` (avoid bundling config/server code into clients)

---

## 📂 Detailed Implementation Tasks

### Task 1: API Routes Structure Setup

#### 1.1 Create Health Check Endpoints
**Files to Create**:
```
/apps/frontend/app/api/health/route.ts
/apps/admin/app/api/health/route.ts
```

**Implementation Details**:
- Must run in Node.js runtime (Mongoose is not Edge-compatible): `export const runtime = 'nodejs'`
- Check MongoDB connection status via a shared backend helper (avoid duplicated DB logic)
- Return basic health metrics (db status + uptime + process memory)
- Include memory usage and uptime
- Support for readiness and liveness probes
- Ensure the endpoint is not cached (`export const dynamic = 'force-dynamic'` or `revalidate = 0`)

#### 1.2 Standardize API Responses and Controller Base
**Files to Create**:
```
/packages/backend/src/presentation/controllers/BaseController.ts
/packages/backend/src/presentation/serializers/apiResponse.ts
/packages/backend/src/presentation/serializers/apiError.ts
```

**Implementation Details**:
- Define a single, consistent JSON response envelope (success + error)
- Standardize error codes/messages (don't leak internals; keep stack traces server logs only)
- Provide helpers to build `NextResponse` consistently (status + body)
- Keep these server-only and used from API route handlers/controllers

### Task 2: MongoDB Connection and Health Utilities

#### 2.1 Enhance Database Connection Utility
**File to Modify**:
```
/packages/backend/src/infrastructure/database/connection.ts
```

**Additions**:
- Connection health monitoring helper (readyState + lightweight ping)
- Clarify connection pooling behavior: cache is per Node.js process (single-instance dev effectively "one pool")
- Keep reconnection logic minimal (Mongoose already retries; avoid custom loops unless needed)
- Graceful shutdown handling

#### 2.2 Create Database Utility Functions
**Files to Create**:
```
/packages/backend/src/infrastructure/database/health.ts
/packages/backend/src/infrastructure/database/options.ts
```

**Implementation Details**:
- `health.ts`: shared function used by both apps' `/api/health` endpoints
- `options.ts`: map env vars → mongoose connection options (pool sizes/timeouts) with sensible defaults
- Keep generic CRUD/query builder helpers out of Milestone 1.2 unless immediately used by a repository

#### 2.3 Export Backend Entry Points Properly
**File to Modify**:
```
/packages/backend/src/index.ts
```

**Implementation Details**:
- Export server-only entrypoints needed by apps' API routes (e.g., `connectDB`, db health helper, `withMiddleware`)
- Do NOT export all Mongoose models from the package root; keep models internal to `@talepick/backend` to reduce accidental coupling and client-side import risk
- Prefer exporting controllers/use-cases (Clean Architecture boundary), not persistence models

### Task 3: Shared API Middleware

#### 3.1 Create Core Middleware
**Files to Create**:
```
/packages/backend/src/presentation/middleware/logging.middleware.ts
/packages/backend/src/presentation/middleware/error.middleware.ts
/packages/backend/src/presentation/middleware/rateLimit.middleware.ts
/packages/backend/src/presentation/middleware/validation.middleware.ts
```

**Implementation Details**:
- CORS middleware is not needed for same-origin `/api/*` calls; add only if/when cross-origin clients exist.

**Logging Middleware**:
- Request/response logging
- Performance metrics collection
- Error stack trace capture
- Structured logging format (and redact secrets / never log auth tokens)

**Error Handling Middleware**:
- Centralized error processing
- Error classification (client vs server)
- Sanitized error responses
- Error reporting integration

**Rate Limiting Middleware**:
- In-memory rate limiting is acceptable for the current single-instance deployment
- Add a note for future scaling: replace with Redis/Upstash/etc when running multiple instances
- Configurable limits per endpoint
- Sliding window implementation
- Custom rate limit headers

**Validation Middleware**:
- Zod schema validation
- Request body validation
- Query parameter validation
- File upload validation (defer until file uploads exist)

#### 3.2 Create Middleware Composition Utility
**File to Create**:
```
/packages/backend/src/presentation/middleware/withMiddleware.ts
```

**Implementation Details**:
- Chain multiple middleware functions
- Error boundary for middleware chain
- Async middleware support
- Context passing between middleware
- Clarify: this is NOT Next.js "Middleware" (Edge), it's a route-handler wrapper for `app/api/*`

### Task 4: Environment Configuration

#### 4.1 Create Configuration Module
**Files to Create**:
```
/packages/backend/src/infrastructure/config/env.ts
/packages/backend/src/infrastructure/config/api.ts
/packages/backend/src/infrastructure/config/database.ts
```

**Implementation Details**:
- Environment-specific configurations
- Configuration validation with Zod (server-only)
- Default values with environment override
- Type-safe configuration access
- Keep `@talepick/shared` focused on types/constants/utils (avoid putting env parsing there)

#### 4.2 Update Environment Variables
**Files to Modify**:
```
/.env.example
/apps/frontend/.env.local
/apps/admin/.env.local
```

**Additions**:
```env
# API Configuration
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQUESTS=100
API_LOG_LEVEL=info

# Database Configuration
DB_CONNECTION_TIMEOUT_MS=5000
DB_MAX_POOL_SIZE=10
DB_MIN_POOL_SIZE=2
```

### Task 5 (Optional): Shared Database Utilities

**Note**: Implement this only if Milestone 1.2 endpoints immediately need repository abstractions; otherwise defer to Milestone 1.3+ when feature endpoints are added.

#### 5.1 Create Base Repository Pattern
**Files to Create**:
```
/packages/backend/src/infrastructure/repositories/BaseRepository.ts
/packages/backend/src/infrastructure/repositories/repositoryRegistry.ts
```

**Implementation Details**:
- Generic CRUD operations
- Query builder helpers
- Pagination utilities
- Soft delete support
- Audit trail helpers

#### 5.2 Create Database Helpers
**Files to Create**:
```
/packages/backend/src/infrastructure/utils/queryBuilder.ts
/packages/backend/src/infrastructure/utils/pagination.ts
/packages/backend/src/infrastructure/utils/transactions.ts
```

**Implementation Details**:
- Dynamic query building
- Type-safe pagination
- Transaction session management
- Bulk operation helpers

### Task 6: API Documentation and Testing

#### 6.1 Create API Documentation Structure
**Files to Create**:
```
/docs/api/README.md
/docs/api/endpoints/health.md
/docs/api/middleware.md
/docs/api/examples.md
```

#### 6.2 Create API Testing Utilities
**Files to Create**:
```
/packages/testing/src/api/testClient.ts
/packages/testing/src/api/mockRequests.ts
/packages/testing/src/api/assertions.ts
```

---

## 🔄 Implementation Order and Dependencies

### Phase 1: Core Infrastructure (Day 1-2)
1. **Enhance Database Connection** - Foundation for all API features
2. **Create Configuration Module** - Required for environment-specific behavior
3. **Implement Health Check Endpoints** - Immediate value for monitoring

### Phase 2: Middleware Implementation (Day 3-4)
1. **Error Handling Middleware** - Critical for stable API behavior
2. **Logging Middleware** - Essential for debugging and monitoring

### Phase 3: Utilities and Standards (Day 5)
1. **Database Utilities** - Improve developer experience
2. **Base Repository Pattern** - Standardize data access
3. **Controller/Response Helpers** - Ensure consistency

### Phase 4: Advanced Features (Day 6-7)
1. **Rate Limiting Middleware** - Production readiness
2. **Validation Middleware** - Input security
3. **API Documentation** - Developer onboarding

---

## 🏗️ Integration Points

### Between Apps and Packages
1. **Frontend App** → **Backend Package**:
   - Import controllers for API routes
   - Use middleware for request handling
   - Share database connection utilities

2. **Admin App** → **Backend Package**:
   - Use admin-specific controllers/use-cases (keep auth and authorization separate from user system)
   - Share the same middleware wrapper and DB utilities where safe
   - Use the same database connection code (but keep admin/user secrets separated in env)

3. **Both Apps** → **Shared Package**:
   - Import shared types/constants/utils only (no env parsing in shared)
   - Use shared types and constants
   - Access utility functions

### Database Integration
1. **Connection Pooling**: One pool per running app process (single-instance dev behaves like "one pool")
2. **Model Access**: Keep models internal to backend; expose only what API handlers/controllers need
3. **Health Monitoring**: Connection status for both apps via shared health helper

---

## 📋 Code Structure and Patterns

### API Route Pattern
```typescript
// apps/frontend/app/api/example/route.ts
import { withMiddleware } from '@talepick/backend';
import { ExampleController } from '@talepick/backend';

const controller = new ExampleController();

export const GET = withMiddleware(
  controller.handleGet.bind(controller),
  { auth: false, rateLimit: { max: 10 } }
);

export const POST = withMiddleware(
  controller.handlePost.bind(controller),
  { auth: true, validation: 'createExample' }
);
```

### Controller Pattern
```typescript
// packages/backend/src/presentation/controllers/ExampleController.ts
import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';

export class ExampleController extends BaseController {
  async handleGet(request: NextRequest): Promise<NextResponse> {
    try {
      // Business logic here
      return this.success({ message: 'Success' });
    } catch (error) {
      return this.handleError(error);
    }
  }
}
```

### Middleware Composition Pattern
```typescript
// packages/backend/src/presentation/middleware/withMiddleware.ts
export function withMiddleware(
  handler: Function,
  options: MiddlewareOptions = {}
) {
  return async (request: NextRequest) => {
    const middlewareChain = [
      loggingMiddleware(options.logging),
      rateLimitMiddleware(options.rateLimit),
      authMiddleware(options.auth),
      validationMiddleware(options.validation),
    ];

    // Execute middleware chain
    for (const middleware of middlewareChain) {
      const result = await middleware(request);
      if (result) return result; // Early return if middleware responds
    }

    // Execute handler
    return handler(request);
  };
}
```

---

## 🔧 Technical Considerations

### Performance Considerations
1. **Connection Pooling**: Reuse database connections across requests
2. **Request Caching**: Cache frequently accessed data
3. **Response Compression**: Enable gzip compression
4. **Query Optimization**: Use database indexes effectively

### Security Considerations
1. **Input Validation**: Validate all incoming data
2. **Rate Limiting**: Prevent API abuse
3. **CORS Configuration**: Avoid enabling CORS unless needed; if enabled, restrict origins
4. **Error Sanitization**: Don't expose internal errors

### Development Experience
1. **Type Safety**: Full TypeScript coverage
2. **Hot Reload**: API changes reflect immediately
3. **Debug Logging**: Detailed logs for development
4. **Documentation**: Auto-generated API docs

### Production Readiness
1. **Graceful Shutdown**: Handle SIGTERM properly
2. **Health Checks**: Kubernetes-ready probes
3. **Metrics Collection**: Prometheus-compatible metrics
4. **Error Reporting**: Integration with error tracking services

---

## 🧪 Testing Strategy

### Unit Tests
- Test each middleware independently
- Test utility functions
- Test configuration validation

### Integration Tests
- Test middleware composition
- Test database operations
- Test API end-to-end flow

### Health Check Tests
- Verify database connectivity
- Test response format
- Check performance metrics

---

## 📊 Success Metrics

### Technical Metrics
- API response time < 200ms
- Health check response time < 50ms
- 100% type coverage for new code
- Zero runtime errors from middleware

### Development Metrics
- Consistent API response format
- Reusable middleware across endpoints
- Reduced boilerplate code by 60%
- Developer onboarding time < 30 minutes

---

## 🚀 Post-Implementation Next Steps

1. **Milestone 1.3**: Begin authentication system implementation
2. **API Expansion**: Add more endpoints as per roadmap
3. **Performance Testing**: Load test the API foundation
4. **Monitoring Setup**: Implement production monitoring
5. **Documentation**: Expand API documentation for consumers

---

## 📝 Notes and Assumptions

1. **Assumes**: MongoDB Docker container is running (completed in Milestone 1.1)
2. **Assumes**: Basic Next.js setup is complete for both apps
3. **Assumes**: Single-instance deployment for now (in-memory rate limiting is acceptable)
4. **Note**: This implementation focuses on foundation, not business logic
5. **Note**: Authentication specifics will be handled in Milestone 1.3
6. **Note**: Error handling focuses on infrastructure, not application errors

---

*This implementation plan provides a solid foundation for TalePick's API layer, ensuring consistency, performance, and maintainability across the entire application.*
