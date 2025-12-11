# Implementation Plan: Milestone 1.1

> **Development Environment Setup** • TalePick Interactive Story Platform • Next.js 16 • MongoDB • 2025

---

## 📋 Milestone Overview

**Objective**: Establish development environment and basic platform functionality

**Milestone 1.1 Tasks**:
- [x] Set up development Docker containers
- [ ] Configure MongoDB with initial schemas
- [x] Set up Next.js monorepo with workspaces
- [x] Configure TypeScript and linting
- [ ] Set up testing framework (Vitest)

**Estimated Time**: 16-18 hours total
**Priority**: High - Foundation for all subsequent development

---

## 🎯 Current Status Summary

### ✅ Already Completed

1. **Docker Containers**
   - MongoDB container configured with docker-compose.yml
   - Running on port 27017 with credentials: root/example
   - Persistent volume for data storage

2. **Next.js Monorepo**
   - Workspaces configured in root package.json
   - Two apps: frontend (port 3000) and admin (port 3001)
   - Next.js 16 with App Router

3. **TypeScript & ESLint**
   - TypeScript configured in both apps (ES2017, strict mode)
   - Path aliases set up (@/*, @lib/*, @ui/*)
   - Modern ESLint flat config format

4. **Partial Testing Setup**
   - Vitest configured in frontend app
   - Test utilities and mock setup ready

### ❌ Missing/Incomplete

1. **MongoDB Schemas & Models**
   - No Mongoose models implemented
   - Database connection not established
   - 15 collection schemas need implementation

2. **Testing Framework**
   - Vitest not configured for admin app
   - No shared testing utilities

3. **Clean Architecture Structure**
   - Packages directory doesn't exist
   - No shared API layer

---

## 📝 Detailed Implementation Tasks

### Task 1: Create Clean Architecture Packages Structure
**Estimated Time**: 2 hours
**Priority**: High

**Steps**:
```bash
# Create packages directory structure
mkdir -p packages/{domain,application,infrastructure,presentation,shared,testing}

# Initialize packages
cd packages
npm init -y -w domain
npm init -y -w application
npm init -y -w infrastructure
npm init -y -w presentation
npm init -y -w shared
npm init -y -w testing

# Create subdirectories
mkdir -p infrastructure/{database,models,repositories}
mkdir -p shared/{types,utils,constants}
mkdir -p testing/{mocks,factories,utils}
```

**Verification**: Run `npm install` to ensure workspace recognition

---

### Task 2: Configure Vitest for Admin App
**Estimated Time**: 30 minutes
**Priority**: Medium

**Steps**:
```bash
# Navigate to admin app
cd apps/admin

# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/ui

# Create configuration files
touch vitest.config.ts
touch vitest.setup.tsx
```

**Create `apps/admin/vitest.config.ts`**:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@lib': path.resolve(__dirname, './app/lib'),
      '@ui': path.resolve(__dirname, './app/ui'),
    },
  },
});
```

**Update `apps/admin/package.json`**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**Verification**: Run `npm test` to confirm setup

---

### Task 3: Install Database Dependencies
**Estimated Time**: 30 minutes
**Priority**: High

**Steps**:
```bash
# Install in infrastructure package
cd packages/infrastructure
npm install mongoose @types/mongoose jsonwebtoken @types/jsonwebtoken bcryptjs @types/bcryptjs

# Install shared dependencies
cd ../shared
npm install zod @types/node

# Install development dependencies
cd ../testing
npm install --save-dev vitest mongoose @types/mongoose
```

**Verification**: Ensure all packages install without errors

---

### Task 4: Create Database Connection Module
**Estimated Time**: 1 hour
**Priority**: High

**Create `packages/infrastructure/database/connection.ts`**:
```typescript
import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://root:example@localhost:27017/talepick';

if (!MONGODB_URL) {
  throw new Error('Please define the MONGODB_URL environment variable');
}

// Extend global type for cached connection
declare global {
  var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URL, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connected successfully');
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

**Verification**: Test with simple connection script

---

### Task 5: Implement MongoDB Schemas
**Estimated Time**: 8-10 hours
**Priority**: Critical

**Directory Structure**:
```bash
packages/infrastructure/models/
├── users/
│   ├── User.ts
│   ├── UserStats.ts
│   ├── CreditTransaction.ts
│   └── UserAchievement.ts
├── stories/
│   ├── Story.ts
│   ├── StoryNode.ts
│   ├── StoryAsset.ts
│   ├── Genre.ts
│   └── Review.ts
├── achievements/
│   ├── Achievement.ts
│   └── Avatar.ts
└── index.ts
```

**Implementation Order**:

1. **User Model** (`packages/infrastructure/models/users/User.ts`)
2. **Genre Model** (`packages/infrastructure/models/stories/Genre.ts`)
3. **Story Model** (`packages/infrastructure/models/stories/Story.ts`)
4. **StoryNode Model** (`packages/infrastructure/models/stories/StoryNode.ts`)
5. **Achievement Model** (`packages/infrastructure/models/achievements/Achievement.ts`)
6. **Review Model** (`packages/infrastructure/models/stories/Review.ts`)
7. **Remaining models** based on documentation

**Example: User Model Implementation**:
```typescript
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash?: string;
  profile: {
    displayName: string;
    avatar: {
      type: 'default' | 'custom' | 'google';
      value: string;
    };
    bio?: string;
    profileImageUrl?: string;
  };
  authentication: {
    authMethod: 'email' | 'google' | 'guest';
    isGuest: boolean;
    googleId?: string;
    emailVerified: boolean;
    hasPassword: boolean;
  };
  gameStats: {
    credits: number;
    maxCredits: number;
    totalPlayTime: number;
    storiesCompleted: number;
    lastCreditRefill: Date;
  };
  accountStatus: {
    status: 'active' | 'suspended' | 'banned' | 'under_review';
    reason?: string;
    statusUntil?: Date;
  };
  security: {
    failedLoginAttempts: number;
    lastFailedLogin?: Date;
    isLocked: boolean;
    lockUntil?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    index: true
  },
  passwordHash: { type: String, select: false },
  profile: {
    displayName: { type: String, required: true, trim: true },
    avatar: {
      type: { type: String, enum: ['default', 'custom', 'google'], default: 'default' },
      value: { type: String, default: '' }
    },
    bio: { type: String, maxlength: 500 },
    profileImageUrl: { type: String }
  },
  authentication: {
    authMethod: { type: String, enum: ['email', 'google', 'guest'], required: true },
    isGuest: { type: Boolean, default: false },
    googleId: { type: String, sparse: true, index: true },
    emailVerified: { type: Boolean, default: false },
    hasPassword: { type: Boolean, default: false }
  },
  gameStats: {
    credits: { type: Number, default: 10, min: 0 },
    maxCredits: { type: Number, default: 10, min: 1 },
    totalPlayTime: { type: Number, default: 0 },
    storiesCompleted: { type: Number, default: 0 },
    lastCreditRefill: { type: Date, default: Date.now }
  },
  accountStatus: {
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'under_review'],
      default: 'active'
    },
    reason: { type: String },
    statusUntil: { type: Date }
  },
  security: {
    failedLoginAttempts: { type: Number, default: 0 },
    lastFailedLogin: { type: Date },
    isLocked: { type: Boolean, default: false },
    lockUntil: { type: Date }
  }
}, {
  timestamps: true,
  collection: 'users',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ 'authentication.authMethod': 1, 'authentication.isGuest': 1 });
UserSchema.index({ 'accountStatus.status': 1 });

// Pre-save middleware for password hashing
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return next();
  }

  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    this.authentication.hasPassword = true;
  } catch (error) {
    return next(error);
  }
  next();
});

// Methods
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

UserSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.authentication.googleId;
  return user;
};

export default mongoose.model<IUser>('User', UserSchema);
```

**Verification**: Create test script to verify each model

---

### Task 6: Create Database Index File
**Estimated Time**: 30 minutes
**Priority**: High

**Create `packages/infrastructure/models/index.ts`**:
```typescript
// User models
export { default as User } from './users/User';
export { default as CreditTransaction } from './users/CreditTransaction';
export { default as UserAchievement } from './users/UserAchievement';

// Story models
export { default as Story } from './stories/Story';
export { default as StoryNode } from './stories/StoryNode';
export { default as StoryAsset } from './stories/StoryAsset';
export { default as Genre } from './stories/Genre';
export { default as Review } from './stories/Review';

// Achievement models
export { default as Achievement } from './achievements/Achievement';
export { default as Avatar } from './achievements/Avatar';

// Re-export connection
export { default as connectDB } from '../database/connection';
```

---

### Task 7: Set up Environment Configuration
**Estimated Time**: 30 minutes
**Priority**: High

**Create environment files**:

**`apps/frontend/.env.local`**:
```env
# Database
MONGODB_URL="mongodb://root:example@localhost:27017/talepick"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auth
NEXTAUTH_SECRET="your-nextauth-secret-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Features
ENABLE_GUEST_MODE=true
DEFAULT_CREDITS=10
CREDIT_REFILL_MINUTES=5
```

**`apps/admin/.env.local`**:
```env
# Database
MONGODB_URL="mongodb://root:example@localhost:27017/talepick"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Auth
NEXTAUTH_SECRET="your-admin-nextauth-secret-here-change-in-production"
NEXTAUTH_URL="http://localhost:3001"

# Admin
ADMIN_SESSION_SECRET="your-admin-session-secret"
```

---

### Task 8: Create Database Seed Script
**Estimated Time**: 2 hours
**Priority**: Medium

**Create `packages/infrastructure/seeds/index.ts`**:
```typescript
import mongoose from 'mongoose';
import { Genre, Achievement, Avatar } from '../models';
import connectDB from '../database/connection';

const seedGenres = async () => {
  const genres = [
    {
      name: 'Romance',
      nameTh: 'โรแมนติก',
      description: 'เรื่องราวความรักและความสัมพันธ์',
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Horror',
      nameTh: 'สยองขวัญ',
      description: 'เรื่องราวสยองขวัญและสร้างความกลัว',
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Adventure',
      nameTh: 'ผจญภัย',
      description: 'เรื่องราวการเดินทางและผจญภัย',
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'Comedy',
      nameTh: 'ตลก',
      description: 'เรื่องราวตลกขบขัน',
      isActive: true,
      sortOrder: 4
    },
    {
      name: 'Mystery',
      nameTh:ลึกลับ',
      description: 'เรื่องราวปริศนาและลึกลับ',
      isActive: true,
      sortOrder: 5
    },
    {
      name: 'Fantasy',
      nameTh: 'แฟนตาซี',
      description: 'เรื่องราวเวทมนตร์และจินตนาการ',
      isActive: true,
      sortOrder: 6
    },
    {
      name: 'Sci-Fi',
      nameTh: 'วิทยาศาสตร์',
      description: 'เรื่องราววิทยาศาสตร์และอนาคต',
      isActive: true,
      sortOrder: 7
    },
    {
      name: 'Drama',
      nameTh: 'ดราม่า',
      description: 'เรื่องราวชีวิตและสังคม',
      isActive: true,
      sortOrder: 8
    }
  ];

  const existingGenres = await Genre.find();
  if (existingGenres.length === 0) {
    await Genre.insertMany(genres);
    console.log('✅ Genres seeded successfully');
  } else {
    console.log('ℹ️ Genres already exist, skipping seed');
  }
};

const seedAvatars = async () => {
  const avatars = [
    {
      name: 'Default Avatar',
      description: 'Default user avatar',
      imageUrl: '/avatars/default.png',
      unlockCondition: {
        type: 'automatic',
        value: null
      },
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Story Master',
      description: 'Complete 5 stories',
      imageUrl: '/avatars/story-master.png',
      unlockCondition: {
        type: 'story_completion',
        value: 5
      },
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Reviewer',
      description: 'Write 3 reviews',
      imageUrl: '/avatars/reviewer.png',
      unlockCondition: {
        type: 'review_count',
        value: 3
      },
      isActive: true,
      sortOrder: 3
    }
  ];

  const existingAvatars = await Avatar.find();
  if (existingAvatars.length === 0) {
    await Avatar.insertMany(avatars);
    console.log('✅ Avatars seeded successfully');
  } else {
    console.log('ℹ️ Avatars already exist, skipping seed');
  }
};

const seedAchievements = async () => {
  const achievements = [
    {
      name: 'First Story',
      description: 'Complete your first story',
      category: 'story',
      points: 10,
      badgeUrl: '/achievements/first-story.png',
      unlockCondition: {
        type: 'story_completion',
        value: 1
      },
      rewards: {
        credits: 5,
        avatarUnlock: null
      },
      isActive: true,
      rarity: 'common'
    },
    {
      name: 'Explorer',
      description: 'Complete 10 different stories',
      category: 'story',
      points: 50,
      badgeUrl: '/achievements/explorer.png',
      unlockCondition: {
        type: 'unique_stories',
        value: 10
      },
      rewards: {
        credits: 20,
        avatarUnlock: 'Explorer Avatar'
      },
      isActive: true,
      rarity: 'rare'
    }
  ];

  const existingAchievements = await Achievement.find();
  if (existingAchievements.length === 0) {
    await Achievement.insertMany(achievements);
    console.log('✅ Achievements seeded successfully');
  } else {
    console.log('ℹ️ Achievements already exist, skipping seed');
  }
};

const runSeeds = async () => {
  try {
    await connectDB();
    console.log('🌱 Running database seeds...');

    await seedGenres();
    await seedAvatars();
    await seedAchievements();

    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeeds();
}

export { runSeeds, seedGenres, seedAvatars, seedAchievements };
```

**Add to root package.json**:
```json
{
  "scripts": {
    "seed": "tsx packages/infrastructure/seeds/index.ts",
    "seed:genres": "tsx -e \"import { seedGenres } from './packages/infrastructure/seeds'; seedGenres();\"",
    "seed:avatars": "tsx -e \"import { seedAvatars } from './packages/infrastructure/seeds'; seedAvatars();\"",
    "seed:achievements": "tsx -e \"import { seedAchievements } from './packages/infrastructure/seeds'; seedAchievements();\""
  }
}
```

**Install tsx for TypeScript execution**:
```bash
npm install --save-dev tsx
```

**Verification**: Run `npm run seed` and check MongoDB for seeded data

---

### Task 9: Create Shared Type Definitions
**Estimated Time**: 1 hour
**Priority**: Medium

**Create `packages/shared/types/index.ts`**:
```typescript
// User related types
export interface UserPublic {
  id: string;
  username: string;
  profile: {
    displayName: string;
    avatar: {
      type: 'default' | 'custom' | 'google';
      value: string;
    };
    bio?: string;
    profileImageUrl?: string;
  };
  gameStats: {
    credits: number;
    maxCredits: number;
    storiesCompleted: number;
  };
}

// Story related types
export interface StoryPublic {
  id: string;
  title: string;
  description: string;
  genre: {
    id: string;
    name: string;
    nameTh: string;
  };
  metadata: {
    coverImageUrl: string;
    estimatedPlayTime: number;
    totalChoices: number;
    totalEndings: number;
  };
  stats: {
    totalPlayers: number;
    averageRating: number;
    completionRate: number;
  };
  contentRating: {
    ageRating: number;
    violenceLevel: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Pagination types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName: string;
}
```

---

### Task 10: Update Development Scripts
**Estimated Time**: 15 minutes
**Priority**: Low

**Update root package.json**:
```json
{
  "scripts": {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "clean": "rm -rf node_modules apps/*/node_modules packages/*/node_modules",
    "db:start": "docker compose up -d mongo",
    "db:stop": "docker compose down",
    "db:logs": "docker compose logs -f mongo",
    "setup": "npm install && npm run db:start && sleep 5 && npm run seed",
    "dev:full": "npm run setup && npm run dev"
  }
}
```

---

## ✅ Verification Checklist

After completing all tasks, verify:

### Infrastructure
- [ ] MongoDB container runs: `docker compose up -d mongo`
- [ ] Database connection works: Test with connection script
- [ ] All 15 models are created and importable
- [ ] Seed script runs successfully
- [ ] Environment variables are loaded correctly

### Code Quality
- [ ] TypeScript compiles without errors in all packages
- [ ] ESLint passes in both apps
- [ ] All tests run in frontend: `npm test -w frontend`
- [ ] All tests run in admin: `npm test -w admin`

### Applications
- [ ] Frontend starts without errors: `npm run dev -w frontend`
- [ ] Admin starts without errors: `npm run dev -w admin`
- [ ] Both apps can connect to MongoDB
- [ ] Database indexes are created correctly

### Documentation
- [ ] All new files have appropriate documentation
- [ ] README files are updated if needed
- [ ] Type definitions are exported properly

---

## 🚀 Next Steps After Milestone 1.1

Once Milestone 1.1 is complete:

1. **Start Milestone 1.2**: API Foundation
   - Set up Next.js API routes structure
   - Create shared middleware (CORS, logging, error handling)
   - Implement health check endpoints
   - Create shared utilities for database operations

2. **Begin Authentication System** (Milestone 1.3)
   - User registration API
   - Login/logout endpoints
   - JWT token management
   - Google OAuth integration

3. **Start Frontend Implementation** (Milestone 1.6)
   - Consume shared API routes
   - Implement authentication context
   - Create basic routing

---

## 🔧 Critical Files Created

| Path | Purpose |
|------|---------|
| `packages/infrastructure/database/connection.ts` | MongoDB connection management |
| `packages/infrastructure/models/users/User.ts` | Main user schema and model |
| `packages/infrastructure/models/stories/Story.ts` | Story schema and model |
| `packages/infrastructure/models/index.ts` | Central model exports |
| `packages/infrastructure/seeds/index.ts` | Database initialization |
| `packages/shared/types/index.ts` | Shared TypeScript types |
| `apps/admin/vitest.config.ts` | Admin app testing configuration |

---

## 📊 Progress Tracking

- **Total Tasks**: 10
- **Completed**: 0
- **In Progress**: 0
- **Remaining**: 10
- **Estimated Completion**: 16-18 hours

---

## 📝 Notes & Considerations

1. **Database Design**: All schemas should follow the documented structure in `docs/database/collections/`
2. **Security**: Password hashing implemented with bcrypt, proper indexing for performance
3. **Type Safety**: Leverage TypeScript throughout for better developer experience
4. **Testing**: Each model should have basic tests created
5. **Environment**: Keep production and development configurations separate
6. **Error Handling**: Implement proper error handling for database operations
7. **Performance**: Add appropriate indexes for frequently queried fields

---

*Last Updated: December 2024*
*Next Steps: Proceed with Milestone 1.2 after completion*