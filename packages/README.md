# TalePick Clean Architecture Packages

This directory contains the shared packages implementing Clean Architecture
principles for the TalePick platform.

## Package Structure

### Domain Layer (`domain/`)

- **entities/**: Core business entities (User, Story, Achievement, etc.)
- **value-objects/**: Immutable value objects
- **repositories/**: Repository interfaces (contracts for data access)
- **services/**: Domain services with business logic
- **events/**: Domain events
- **errors/**: Domain-specific error types
- **types/**: TypeScript types for domain layer

### Application Layer (`application/`)

- **use-cases/**: User stories and business operations (frontend)
- **use-cases-admin/**: Admin-specific business operations
- **services/**: Application services orchestrating use cases
- **dto/**: Data Transfer Objects
- **validators/**: Input validation
- **interfaces/**: Application-level interfaces

### Infrastructure Layer (`infrastructure/`)

- **database/**: Database connection and configuration
- **models/**: MongoDB/Mongoose model implementations
- **repositories/**: Repository implementations
- **email/**: Email service implementations
- **storage/**: File storage implementations
- **external/**: External API integrations
- **cache/**: Cache implementations
- **logging/**: Logging utilities

### Presentation Layer (`presentation/`)

- **controllers/**: HTTP request/response handlers (frontend)
- **controllers-admin/**: Admin API controllers
- **middleware/**: Request processing middleware
- **serializers/**: Response serialization
- **routes/**: Route definitions
- **types/**: API-related types

### Shared Layer (`shared/`)

- **types/**: Shared TypeScript types
- **utils/**: Utility functions
- **constants/**: Application constants
- **config/**: Configuration utilities
- **enums/**: Shared enums

### Testing Layer (`testing/`)

- **mocks/**: Mock implementations
- **factories/**: Data factories for testing
- **utils/**: Testing utilities
- **fixtures/**: Test data fixtures

## Dependencies

```
Domain       <-- Application <-- Presentation <-- (Apps)
       ^                ^                ^
       |                |                |
    Shared   <-- Infrastructure <-- (Database, External APIs)
       |
    Testing
```

- Domain: No external dependencies
- Application: Depends on Domain, Shared
- Infrastructure: Depends on Domain, Shared
- Presentation: Depends on Application, Shared
- Testing: Utilities for testing all layers

## Usage

Packages are configured as npm workspaces and can be installed together:

```bash
npm install
```

To work with a specific package:

```bash
npm install <package> -w packages/<package-name>
npm run build -w packages/<package-name>
npm test -w packages/<package-name>
```
