# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TalePick is a Thai-language interactive story platform built as a monorepo with Next.js 16. Users play interactive stories where choices affect outcomes, using a credit-based system with achievements and avatar unlocks.

## Architecture

### Monorepo Structure
- **Root**: Uses npm workspaces
- **Frontend App** (`/apps/frontend/`): Port 3000 - Main user application
- **Admin App** (`/apps/admin/`): Port 3001 - Admin dashboard
- **Database**: MongoDB running on Docker Compose (port 27017)
  - Default credentials: `root` / `example`

### Tech Stack
- Next.js 16 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Vitest for testing
- Google Generative AI integration

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
```

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
- Backend service is not yet implemented
- Currently using mock data for stories, reviews, and achievements
- MongoDB is configured but not actively used by frontend

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