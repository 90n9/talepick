# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TalePick is a Thai-language interactive story platform built as a monorepo with Next.js 16. Users play interactive stories where choices affect outcomes, using a credit-based system with achievements and avatar unlocks.

## Architecture

### Clean Architecture Implementation
- **Framework**: Clean Architecture with dependency injection
- **Monorepo Structure**: Uses npm workspaces with shared packages
- **Apps**:
  - **Frontend App** (`/apps/frontend/`): Port 3000 - Main user application
  - **Admin App** (`/apps/admin/): Port 3001 - Admin dashboard
- **Packages**:
  - **Domain Layer** (`packages/domain/`): Business entities and rules
  - **Application Layer** (`packages/application/`): Use cases and business logic
  - **Infrastructure Layer** (`packages/infrastructure/`): Database and external services
  - **Presentation Layer** (`packages/presentation/`): API controllers and middleware
  - **Shared Layer** (`packages/shared/`): Types, utilities, constants
  - **Testing Layer** (`packages/testing/`): Mocks, factories, test utilities
- **Database**: MongoDB with 24 collections (see `docs/database/`)
  - Default credentials: `root` / `example`

### Tech Stack
- Next.js 16 with App Router and API Routes
- React 19
- TypeScript 5
- Tailwind CSS 4
- Vitest + Playwright for testing
- Google Generative AI integration
- MongoDB with Mongoose ODM
- Clean Architecture principles
- Dependency Injection (tsyringe)

### Folder Structure Reference
For detailed folder structure and file organization, see **@FOLDER_STRUCTURE.md**. Key patterns:

```typescript
// Domain Layer (Business rules, no external deps)
packages/domain/entities/User.ts
packages/domain/services/CreditService.ts
packages/domain/repositories/IUserRepository.ts

// Application Layer (Use cases, orchestrates domain)
packages/application/use-cases/SpendCreditsUseCase.ts
packages/application/services/UserAuthService.ts

// Infrastructure Layer (Database, external APIs)
packages/infrastructure/repositories/MongoUserRepository.ts
packages/infrastructure/jwt/UserJWTService.ts

// Presentation Layer (API controllers, middleware)
packages/presentation/controllers/stories/GetStoriesController.ts
packages/presentation/middleware/user-auth.middleware.ts
```

## Development Commands

```bash
# Install dependencies
npm install

# Start MongoDB (required for development)
docker compose up -d mongo

# Development (runs both apps)
npm run dev

# Individual apps
npm run dev -w frontend     # Frontend only (port 3000)
npm run dev -w admin        # Admin only (port 3001)

# Build all apps
npm run build

# Build specific app
npm run build -w frontend
npm run build -w admin

# Lint all apps
npm run lint

# Lint specific app
npm run lint -w frontend
npm run lint -w admin

# Stop MongoDB when finished
docker compose down
```

## Key Architecture Concepts

### Credit System
- Credits refill every 5 minutes (`REFILL_INTERVAL_MS`)
- Story completion rewards credits
- Achievements provide credit bonuses
- Core game mechanic that affects story access

### Authentication Flow
- Multi-step authentication: Register → OTP verification → Success
- Password reset: Email → OTP → New Password → Success
- Uses React Context for auth state management
- Password utilities in `app/lib/password-utils.ts`

### Story Structure
- Interactive stories with branching choices
- Genre classification (romance, horror, adventure, etc.)
- User reviews with rating system
- Playtime estimation
- Thai language content

### Testing Setup
- **Framework**: Vitest with React Testing Library
- **Utilities**: Custom render function with providers in `test/test-utils.tsx`
- **Global setup**: `vitest.setup.tsx` configures test environment
- **Mock data**: Extensive story, review, and achievement mocks
- Run tests: `npm run test` in individual apps (when test scripts are added)
- Currently using lint for pre-commit checks

## Important Configuration

### Path Aliases (TypeScript)
- `@/*` - App root
- `@lib/*` - Utilities and services
- `@ui/*` - Reusable UI components

### Image Domains
Next.js Image optimization configured for:
- `images.unsplash.com`
- `cdn.pixabay.com`
- `picsum.photos`

## Code Organization

### Clean Architecture Structure
See `@FOLDER_STRUCTURE.md` for complete implementation guide. The project follows these layers:

**Domain Layer** (`src/domain/`):
- Entities: Core business objects (User, Story, Choice, etc.)
- Repository Interfaces: Contracts for data access
- Domain Services: Business rules and validation

**Application Layer** (`src/application/`):
- Use Cases: User stories and business operations
- DTOs: Data transfer objects between layers
- Application Services: Orchestrate use cases

**Infrastructure Layer** (`src/infrastructure/`):
- Database: MongoDB implementations of repositories
- Authentication: JWT, Google OAuth services
- External APIs: Payment, notification services

**Presentation Layer** (`src/presentation/`):
- Controllers: HTTP request/response handling
- Middleware: Authentication, validation, error handling
- API Routes: Next.js app/api routes

### Frontend (`/apps/frontend/`)
```
app/
├── (routes)/          # Route groups
│   ├── auth/         # Authentication flows
│   ├── story/        # Story playback and listing
│   └── ...
├── lib/              # Utilities, services, types
├── ui/               # Reusable components
└── globals.css       # Tailwind styles

src/
├── domain/           # Domain layer (shared)
├── application/      # Application layer (shared)
├── infrastructure/   # Infrastructure layer (shared)
└── presentation/     # Presentation layer (shared)
```

### Database Schema
- All database schemas and relations are documented in `@docs/database/`
- 24 collections designed for complete system functionality
- Separate user and admin collections for security
- MongoDB with Docker Compose setup

### Key Files
- `app/lib/auth-context.tsx` - Authentication state management
- `app/lib/data.ts` - Mock data definitions
- `app/lib/constants.ts` - Game constants (credit refill, etc.)
- `app/providers.tsx` - React providers wrapper

## Development Notes

### Thai Language Support
- Primary interface language is Thai
- Ensure any new features support Thai text rendering
- `layout.tsx` metadata sets Thai locale

### State Management
- Uses React Context for authentication
- Component-level state for UI interactions
- No global state management library

### AI Integration
- Google Generative AI for story generation
- Configuration in `app/lib/ai-service.ts`

### Backend Status
- Backend is implemented using Next.js API routes with Clean Architecture
- MongoDB is actively used with Mongoose ODM
- Real database operations for all features

### Database Schema and Relations
For complete database schema, relationships, and entity mappings, refer to **docs/database/**.

#### Key Database Collections (see docs/database/ for complete schema)
- **Users Collection**: User accounts, authentication, profiles, game statistics
- **AdminAccounts Collection**: Administrator accounts and permissions (separate from Users)
- **Stories Collection**: Story content, metadata, media assets
- **StoryNodes Collection**: Individual story nodes with branching choices
- **Achievements Collection**: Achievement definitions and unlocking conditions
- **Reviews Collection**: User reviews, ratings, and moderation
- **CreditTransactions Collection**: Credit economy transaction history

#### Database Security Notes
- **Separate Collections**: Users and AdminAccounts are completely separate for security
- **Soft Delete**: All collections support soft deletion for GDPR compliance
- **Indexing**: Optimized indexes for performance
- **Relationships**: Foreign key references between collections

#### Schema Reference Examples
```typescript
// User Collection (docs/database/collections/users.md)
{
  _id: ObjectId,
  email: String,              // unique, indexed
  authentication: {
    authMethod: 'email' | 'google' | 'guest',
    isGuest: Boolean,
    emailVerified: Boolean
  },
  gameStats: {
    credits: Number,           // Current credits
    maxCredits: Number,         // Maximum credit limit
    lastCreditRefill: Date
  },
  accountStatus: {
    status: 'active' | 'suspended' | 'banned'
  }
}

// Story Collection (docs/database/collections/stories.md)
{
  _id: ObjectId,
  title: String,
  metadata: {
    genre: String,           // References Genres collection
    isPublished: Boolean,
    contentRating: {
      ageRating: Number,      // 0, 13, 16, 18+
      violenceLevel: String
    }
  },
  stats: {
    totalPlayers: Number,
    averageRating: Number,
    totalEndings: Number
  }
}
```

## Common Patterns

### Component Testing
When tests are implemented, use the custom render function from `test/test-utils.tsx` which includes:
- Theme provider
- Auth provider
- Mocked Next.js navigation

### Mock Data
When adding new features, update mock data in `app/lib/data.ts` to maintain consistency across the application.

### Styling
Tailwind CSS 4 with PostCSS. Follow existing component patterns in `app/ui/` for consistency.

### Environment Variables
Use `.env.local` files in each app for configuration. For MongoDB connection:
```
MONGODB_URL="mongodb://root:example@localhost:27017"
```