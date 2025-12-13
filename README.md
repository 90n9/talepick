# TalePick

TalePick - Thai-language interactive story platform built as a monorepo with Next.js 16

## 🎯 Project Overview

TalePick is an interactive story platform where users play branching narratives where choices affect outcomes. Built with a credit-based system, achievements, and avatar unlocks.

### Key Features
- 🎭 **Interactive Stories** - Branching narratives with meaningful choices
- 🌏 **Thai Language Focus** - Primary content in Thai language
- 💰 **Credit System** - Story access and progression economy
- 🏆 **Achievements** - Unlock achievements and avatar rewards
- 👥 **Two Applications** - User frontend and admin dashboard

## 🏗️ Project Structure

This is a monorepo managed with npm workspaces containing:

- **apps/frontend** - Main user application (port 3000)
- **apps/admin** - Admin dashboard application (port 3001)
- **packages/backend** - All business logic, database models, and API layer
- **packages/shared** - TypeScript types, constants, and utilities
- **packages/testing** - Test utilities, mocks, and factories

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

Install dependencies for all apps:

```bash
npm install
```

### Development

Run all apps in development mode:

```bash
npm run dev
```

Run a specific app:

```bash
# Frontend (http://localhost:3000)
npm run dev -w frontend

# Admin (http://localhost:3001)
npm run dev -w admin
```

### Build

Build all apps:

```bash
npm run build
```

Build a specific app:

```bash
npm run build -w frontend
npm run build -w admin
```

### Linting

Lint all apps:

```bash
npm run lint
```

Lint a specific app:

```bash
npm run lint -w frontend
npm run lint -w admin
```

## 🗄️ Database

### MongoDB Setup

Start a local Mongo instance for development:

```bash
npm run db:start    # Start MongoDB container
npm run db:stop     # Stop MongoDB container
npm run db:logs     # View MongoDB logs
```

### Database Initialization

Initialize the database with seed data:

```bash
npm run seed                    # Seed all data (genres, avatars, achievements)
npm run seed:genres             # Seed only genres
npm run seed:avatars            # Seed only avatars
npm run seed:achievements       # Seed only achievements

Seed commands use dedicated TypeScript entrypoints in `scripts/seed-*.ts` to avoid inline `tsx -e` module resolution issues.
```

### Full Development Setup

Complete development environment setup:

```bash
npm run setup       # Install + start DB + seed data
npm run dev:full    # Complete development environment
```

**Database Configuration:**
- Default credentials: `root` / `example`
- Connection URL: `mongodb://localhost:27017`
- Database name: `talepick`
- 25 collections with proper indexing
- Thai language support for genres and content

## 🧪 Testing

### Frontend Tests
```bash
npm run test -w frontend    # Run frontend tests (12 tests passing)
npm run test:ui -w frontend # Run tests with UI
```

### Admin Tests
```bash
npm run test -w admin       # Run admin tests (Vitest configured)
npm run test:ui -w admin    # Run tests with UI
```

### Database Tests
```bash
npm run test:models         # Test model imports
npm run db:init            # Initialize database schema
npm run db:reset           # Reset database (cleanup + init)
```

## 🚦 Development Status

### ✅ Completed Milestones
- **Milestone 1.1: Development Environment Setup** - ✅ **COMPLETED**
  - Docker MongoDB container setup
  - Next.js monorepo with workspaces
  - Clean architecture packages structure
  - 25 database models implemented
  - Database seeding system
  - TypeScript and ESLint configuration
  - Testing framework setup (Vitest)

### 🚧 Current Development
- **Milestone 1.2: API Foundation** - Next milestone

## 🛠️ Tech Stack

### Core Technologies
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety throughout
- **Tailwind CSS 4** - Styling system

### Backend & Database
- **MongoDB** - Primary database with Docker
- **Mongoose** - ODM for MongoDB
- **Clean Architecture** - Separated concerns architecture
- **Dependency Injection** - tsyringe container

### Development Tools
- **npm Workspaces** - Monorepo management
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **Docker Compose** - Container orchestration

### Authentication & Security
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Google OAuth** - Social login integration

## 📚 Documentation

- **[Implementation Plans](docs/implementation/)** - Detailed milestone implementation guides
- **[Database Schema](docs/database/)** - Complete database documentation
- **[Architecture Guide](FOLDER_STRUCTURE.md)** - Clean architecture overview
- **[Project Instructions](CLAUDE.md)** - Development guidelines and patterns
