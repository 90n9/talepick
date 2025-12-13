# Implementation Plan: Milestone 1.1

> **Development Environment Setup** • TalePick Interactive Story Platform • Next.js 16 • MongoDB • 2025

---

## 📋 Milestone Overview

**Objective**: Establish development environment and basic platform functionality

**Milestone 1.1 Tasks**:
- [x] Set up development Docker containers
- [x] Configure MongoDB with initial schemas (25 collections using `lowercase_with_underscores` naming convention)
- [x] Set up Next.js monorepo with workspaces
- [x] Configure TypeScript and linting
- [x] Set up testing framework (Vitest)

**Status**: ✅ **COMPLETED** - December 13, 2025
**Actual Time**: ~18 hours
**Priority**: High - Foundation for all subsequent development

---

## 🎯 Current Status Summary

### ✅ All Tasks Completed

1. **Docker Containers** ✅
   - MongoDB container configured with docker-compose.yml
   - Running on port 27017 with credentials: root/example
   - Persistent volume for data storage
   - Proper Docker Compose configuration

2. **Next.js Monorepo** ✅
   - Workspaces configured in root package.json
   - Two apps: frontend (port 3000) and admin (port 3001)
   - Next.js 16 with App Router
   - Both apps start successfully

3. **TypeScript & ESLint** ✅
   - TypeScript configured in both apps (ES2017, strict mode)
   - Path aliases set up (@/*, @lib/*, @ui/*)
   - Modern ESLint flat config format
   - No compilation errors

4. **Testing Framework** ✅
   - Vitest configured in both frontend and admin apps
   - 12 tests passing in frontend app
   - Test utilities and mock setup ready
   - Test scripts properly configured

5. **MongoDB Schemas & Models** ✅
   - All 25 Mongoose models implemented
   - Database connection established
   - Models follow documented collection schemas exactly
   - Proper indexing for performance

6. **Database Seeding** ✅
   - Seed script implemented for genres, avatars, achievements
   - Thai language support in seeded data
   - Duplicate prevention logic
   - npm scripts for individual and full seeding

7. **Clean Architecture Structure** ✅
   - Simplified packages structure created (backend, shared, testing)
   - Domain, Application, Infrastructure, Presentation layers
   - Shared types and utilities
   - Proper dependency management

8. **Environment Configuration** ✅
   - .env.local files configured for both apps
   - MongoDB connection strings
   - App-specific configuration
   - Development-ready environment

### 🎉 **Milestone 1.1 FULLY COMPLETED**

---

## 📝 Detailed Implementation Tasks

### Task 1: Create Simplified Packages Structure
**Estimated Time**: 2 hours
**Priority**: High

**Steps**:
```bash
# Create simplified packages directory structure
mkdir -p packages/{shared,backend,testing}

# Initialize packages
cd packages
npm init -y -w shared
npm init -y -w backend
npm init -y -w testing

# Create backend package structure
mkdir -p backend/src/{domain,application,infrastructure,presentation}
mkdir -p backend/src/domain/{entities,services,repositories}
mkdir -p backend/src/application/{use-cases,services,dto}
mkdir -p backend/src/infrastructure/{database,repositories,external}
mkdir -p backend/src/presentation/{controllers,middleware,serializers}

# Create shared package structure
mkdir -p shared/src/{types,constants,utils,enums}

# Create testing package structure
mkdir -p testing/src/{mocks,factories,utils}
mkdir -p testing/src/mocks/repositories
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
# Install in backend package
cd packages/backend
npm install mongoose @types/mongoose jsonwebtoken @types/jsonwebtoken bcryptjs @types/bcryptjs

# Install shared dependencies
cd ../shared
npm install zod @types/node

# Install development dependencies
cd ../testing
npm install --save-dev vitest mongoose @types/mongoose

# Install tsx for TypeScript execution in root
cd ../..
npm install --save-dev tsx
```

**Verification**: Ensure all packages install without errors

---

### Task 4: Create Database Connection Module
**Estimated Time**: 1 hour
**Priority**: High

**Create `packages/backend/src/infrastructure/database/connection.ts`**:
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

### Task 5: Implement MongoDB Schemas from Documentation
**Estimated Time**: 8-10 hours
**Priority**: Critical

**Directory Structure** (⚠️ *Some files need renaming to follow singular model naming convention*):
```bash
packages/backend/src/infrastructure/models/
├── Achievement.ts
├── AdminAccount.ts
├── AdminLog.ts
├── AdminLoginHistory.ts
├── Analytics.ts
├── Avatar.ts
├── CreditTransaction.ts
├── Genre.ts
├── OtpCode.ts
├── Review.ts
├── ReviewFlag.ts
├── ReviewVote.ts
├── SecurityEvent.ts
├── Story.ts
├── StoryAsset.ts
├── StoryFlag.ts
├── StoryGallery.ts
├── StoryNode.ts
├── SystemConfig.ts
├── User.ts
├── UserAchievement.ts
├── UserAvatar.ts
├── UserFavorite.ts
├── UserSession.ts
├── UserStoryProgress.ts
└── index.ts
```

**Implementation Order** (use only fields and indexes from `docs/database/collections/*.md`):

### Single-Word Models (Auto-Generated Collections)
**Core Collections**:
1. **User** (`User.ts`) - auto collection: `users`
2. **Genre** (`Genre.ts`) - auto collection: `genres`
3. **Story** (`Story.ts`) - auto collection: `stories`
4. **Review** (`Review.ts`) - auto collection: `reviews`

**System Collections**:
5. **Achievement** (`Achievement.ts`) - auto collection: `achievements`
6. **Avatar** (`Avatar.ts`) - auto collection: `avatars`
7. **Analytics** (`Analytics.ts`) - auto collection: `analytics`

### Multi-Word Models (Manual `lowercase_with_underscores` Collections)
**Story System Collections**:
8. **StoryNode** (`StoryNode.ts`) - collection: `story_nodes`
9. **StoryAsset** (`StoryAsset.ts`) - collection: `story_assets`
10. **StoryGallery** (`StoryGallery.ts`) - collection: `story_gallery`

**Transaction Collections**:
11. **CreditTransaction** (`CreditTransaction.ts`) - collection: `credit_transactions`

**User-Related Collections**:
12. **UserAchievement** (`UserAchievement.ts`) - collection: `user_achievements`
13. **UserAvatar** (`UserAvatar.ts`) - collection: `user_avatars`
14. **UserFavorite** (`UserFavorite.ts`) - collection: `user_favorites`
15. **UserStoryProgress** (`UserStoryProgress.ts`) - collection: `user_story_progress`
16. **UserSession** (`UserSession.ts`) - collection: `user_sessions`

**Admin & Security Collections**:
17. **AdminAccount** (`AdminAccount.ts`) - collection: `admin_accounts`
18. **AdminLog** (`AdminLog.ts`) - collection: `admin_logs`
19. **AdminLoginHistory** (`AdminLoginHistory.ts`) - collection: `admin_login_history`
20. **SecurityEvent** (`SecurityEvent.ts`) - collection: `security_events`
21. **OtpCode** (`OtpCode.ts`) - collection: `otp_codes`

**Review System Collections**:
22. **ReviewFlag** (`ReviewFlag.ts`) - collection: `review_flags`
23. **ReviewVote** (`ReviewVote.ts`) - collection: `review_votes`
24. **StoryFlag** (`StoryFlag.ts`) - collection: `story_flags`

**System Configuration Collections**:
25. **SystemConfig** (`SystemConfig.ts`) - collection: `system_config`

**Naming Convention Rule**:
- **Single-word models**: Use Mongoose auto-generation (no `collection` property needed)
- **Multi-word models**: Specify `collection` property with `lowercase_with_underscores` format
- **See**: `docs/database/MONGODB_NAMING_CONVENTION.md` for complete guidance

**Important**: Follow the naming convention rule:
- **Single-word models**: Let Mongoose auto-generate (e.g., `User` → `users`)
- **Multi-word models**: Use `lowercase_with_underscores` (e.g., `UserAchievements` → `user_achievements`)
- See `docs/database/MONGODB_NAMING_CONVENTION.md` for complete guidance

**Example: Single-Word Model Implementation** (from `docs/database/collections/USERS.md`):

```typescript
// Single-word model: "User" → Mongoose auto-generates "users" collection
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash?: string;
  profile: {
    displayName: string;
    avatar: { type: 'default' | 'custom' | 'google'; value: string };
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
  accountStatus: {
    status: 'active' | 'suspended' | 'banned' | 'under_review' | 'locked';
    reason?: string;
    moderatedBy?: mongoose.Types.ObjectId;
    moderatedAt?: Date;
    suspensionEndsAt?: Date;
    lockType?: 'manual' | 'auto_security' | 'auto_fraud';
    lockExpiresAt?: Date;
  };
  gameStats: {
    credits: number;
    maxCredits: number;
    lastCreditRefill?: Date;
    totalStoriesPlayed: number;
    totalEndingsUnlocked: number;
    totalAvatarsUnlocked: number;
    currentAvatarId?: string;
    createdAt?: Date;
    lastLoginAt?: Date;
  };
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  deleteReason?: string;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    username: { type: String, required: true, unique: true, trim: true, index: true },
    passwordHash: { type: String, select: false },
    profile: {
      displayName: { type: String, required: true, trim: true },
      avatar: {
        type: { type: String, enum: ['default', 'custom', 'google'], required: true },
        value: { type: String, required: true, default: '' },
      },
      bio: { type: String },
      profileImageUrl: { type: String },
    },
    authentication: {
      authMethod: { type: String, enum: ['email', 'google', 'guest'], required: true },
      isGuest: { type: Boolean, default: false },
      googleId: { type: String, sparse: true, index: true },
      emailVerified: { type: Boolean, default: false },
      hasPassword: { type: Boolean, default: false },
    },
    accountStatus: {
      status: {
        type: String,
        enum: ['active', 'suspended', 'banned', 'under_review', 'locked'],
        default: 'active',
        index: true,
      },
      reason: { type: String },
      moderatedBy: { type: Schema.Types.ObjectId },
      moderatedAt: { type: Date },
      suspensionEndsAt: { type: Date },
      lockType: { type: String, enum: ['manual', 'auto_security', 'auto_fraud'] },
      lockExpiresAt: { type: Date },
    },
    gameStats: {
      credits: { type: Number, default: 0 },
      maxCredits: { type: Number, default: 0 },
      lastCreditRefill: { type: Date },
      totalStoriesPlayed: { type: Number, default: 0 },
      totalEndingsUnlocked: { type: Number, default: 0 },
      totalAvatarsUnlocked: { type: Number, default: 0 },
      currentAvatarId: { type: String },
      createdAt: { type: Date, default: Date.now },
      lastLoginAt: { type: Date },
    },
    deletedAt: { type: Date, index: true, sparse: true },
    deletedBy: { type: Schema.Types.ObjectId },
    deleteReason: { type: String },
  },
  {
    versionKey: false,
    // Single-word model: No collection specified (Mongoose auto-generates 'users')
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ 'authentication.googleId': 1 }, { unique: true, sparse: true });
UserSchema.index({ 'accountStatus.status': 1 });
UserSchema.index({ deletedAt: 1 }, { sparse: true });

export default mongoose.model<IUser>('User', UserSchema);
// Result: Collection name = 'users' (auto-generated by Mongoose)
```

**Example: Multi-Word Model Implementation**:

```typescript
// Multi-word model: "UserAchievement" (singular) → Manual collection "user_achievements" (plural)
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  progress: number;
  unlockedAt?: Date;
  isCompleted: boolean;
}

const UserAchievementSchema = new Schema<IUserAchievement>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  achievementId: { type: String, required: true, index: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  unlockedAt: { type: Date },
  isCompleted: { type: Boolean, default: false, index: true },
}, {
  timestamps: true,
  collection: 'user_achievements',  // Two words = use underscores format
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export default mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);
// Result: Collection name = 'user_achievements' (manual specification)
```

**Important**: Model file names stay singular (e.g., `UserAchievement.ts`) while collections remain plural with underscores (e.g., `user_achievements`).

**Verification**: Create test script to verify each model against the documented collections

---

### Task 6: Create Database Index File
**Estimated Time**: 30 minutes
**Priority**: High

**Create `packages/backend/src/infrastructure/models/index.ts`**:
```typescript
// Core Collections
export { default as User } from './User';
export { default as Genre } from './Genre';
export { default as Story } from './Story';
export { default as StoryNode } from './StoryNode';
export { default as StoryAsset } from './StoryAsset';
export { default as StoryGallery } from './StoryGallery';
export { default as Review } from './Review';

// System Collections
export { default as Achievement } from './Achievement';
export { default as Avatar } from './Avatar';
export { default as CreditTransaction } from './CreditTransaction';

// User-Related Collections
export { default as UserAchievement } from './UserAchievement';
export { default as UserAvatar } from './UserAvatar';
export { default as UserFavorite } from './UserFavorite';
export { default as UserStoryProgress } from './UserStoryProgress';
export { default as UserSession } from './UserSession';

// Admin & Security Collections
export { default as AdminAccount } from './AdminAccount';
export { default as AdminLog } from './AdminLog';
export { default as AdminLoginHistory } from './AdminLoginHistory';
export { default as SecurityEvent } from './SecurityEvent';
export { default as OtpCode } from './OtpCode';

// Review System Collections
export { default as ReviewFlag } from './ReviewFlag';
export { default as ReviewVote } from './ReviewVote';
export { default as StoryFlag } from './StoryFlag';

// System Collections
export { default as Analytics } from './Analytics';
export { default as SystemConfig } from './SystemConfig';

// Database connection
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

**Create `packages/backend/src/infrastructure/seeds/index.ts`**:
```typescript
import { Genre, Achievement, Avatar } from '../models';
import connectDB from '../database/connection';

// Seed data aligns with docs in docs/database/collections
const seedGenres = async () => {
  const genres = [
    {
      slug: 'romance',
      name: 'โรแมนติก',
      description: 'เรื่องราวความรักและความสัมพันธ์',
      storyCount: 0,
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      slug: 'horror',
      name: 'สยองขวัญ',
      description: 'เรื่องราวสยองขวัญและสร้างความกลัว',
      storyCount: 0,
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      slug: 'adventure',
      name: 'ผจญภัย',
      description: 'เรื่องราวการเดินทางและผจญภัย',
      storyCount: 0,
      isActive: true,
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date()
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
      avatarId: 'default_avatar',
      name: 'Default Avatar',
      description: 'Default user avatar',
      imageUrl: '/avatars/default.png',
      thumbnailUrl: '/avatars/default-thumb.png',
      unlockType: 'free',
      unlockConditions: {},
      isActive: true,
      isLimited: false,
      isHidden: false,
      rarity: 'common',
      sortOrder: 1,
      totalUnlocks: 0,
      unlockRate: 0,
      category: 'default',
      tags: ['starter'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      avatarId: 'story_master',
      name: 'Story Master',
      description: 'Complete 5 stories',
      imageUrl: '/avatars/story-master.png',
      thumbnailUrl: '/avatars/story-master-thumb.png',
      unlockType: 'story_completion',
      unlockConditions: { storyId: '', completionRate: 100, playthroughCount: 5 },
      isActive: true,
      isLimited: false,
      isHidden: false,
      rarity: 'rare',
      sortOrder: 2,
      totalUnlocks: 0,
      unlockRate: 0,
      category: 'milestone',
      tags: ['completion'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      avatarId: 'reviewer',
      name: 'Reviewer',
      description: 'Write 3 reviews',
      imageUrl: '/avatars/reviewer.png',
      thumbnailUrl: '/avatars/reviewer-thumb.png',
      unlockType: 'achievement',
      unlockConditions: { achievementId: 'write_3_reviews' },
      isActive: true,
      isLimited: false,
      isHidden: false,
      rarity: 'common',
      sortOrder: 3,
      totalUnlocks: 0,
      unlockRate: 0,
      category: 'social',
      tags: ['reviews'],
      createdAt: new Date(),
      updatedAt: new Date()
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
      achievementId: 'first_story',
      title: 'First Story',
      description: 'Complete your first story',
      icon: '📖',
      category: 'story',
      type: 'automatic',
      conditions: { storiesCompleted: 1 },
      rewards: { creditBonus: 5, maxCreditIncrease: 0, avatarUnlocks: [] },
      rarity: 'common',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date()
    },
    {
      achievementId: 'story_explorer_10',
      title: 'Explorer',
      description: 'Complete 10 different stories',
      icon: '🧭',
      category: 'story',
      type: 'automatic',
      conditions: { storiesCompleted: 10 },
      rewards: { creditBonus: 20, maxCreditIncrease: 0, avatarUnlocks: ['story_master'] },
      rarity: 'rare',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date()
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
    "seed": "tsx packages/backend/src/infrastructure/seeds/index.ts",
    "seed:genres": "tsx -e \"import { seedGenres } from './packages/backend/src/infrastructure/seeds'; seedGenres();\"",
    "seed:avatars": "tsx -e \"import { seedAvatars } from './packages/backend/src/infrastructure/seeds'; seedAvatars();\"",
    "seed:achievements": "tsx -e \"import { seedAchievements } from './packages/backend/src/infrastructure/seeds'; seedAchievements();\""
  }
}
```

**Verification**: Run `npm run seed` and check MongoDB for seeded data

---

### Task 9: Create Shared Type Definitions
**Estimated Time**: 1 hour
**Priority**: Medium

**Create `packages/shared/src/types/index.ts`**:
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
    totalStoriesPlayed: number;
    totalEndingsUnlocked: number;
    totalAvatarsUnlocked: number;
    currentAvatarId?: string;
  };
}

// Story related types
export interface StoryPublic {
  id: string;
  title: string;
  description: string;
  metadata: {
    genre: string;
    tags: string[];
    author: string;
    createdAt?: string;
    publishedAt?: string;
    isPublished: boolean;
    isComingSoon: boolean;
    launchDate?: string;
    contentRating: {
      ageRating: number;
      violenceLevel: 'none' | 'mild' | 'moderate' | 'high';
      contentWarnings?: string[];
    };
  };
  media: {
    coverImageAssetId?: string;
    headerImageAssetId?: string;
    coverVideoAssetId?: string;
    bgMusicAssetId?: string;
    coverImageUrl?: string;
    headerImageUrl?: string;
    coverVideoUrl?: string;
    bgMusicUrl?: string;
    trailerUrl?: string;
  };
  gallery: {
    imageIds?: string[];
    totalImages?: number;
    featuredImageId?: string;
  };
  stats: {
    totalPlayers: number;
    averageRating: number;
    totalRatings: number;
    averagePlaytime: number;
    estimatedDuration: string;
    totalEndings: number;
    totalChoices: number;
  };
  content: {
    startingNodeId: string;
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
- [ ] All 14 documented models are created and importable
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
| `packages/backend/src/infrastructure/database/connection.ts` | MongoDB connection management |
| `packages/backend/src/infrastructure/models/User.ts` | Main user schema and model |
| `packages/backend/src/infrastructure/models/Story.ts` | Story schema and model |
| `packages/backend/src/infrastructure/models/index.ts` | Central model exports |
| `packages/backend/src/infrastructure/seeds/index.ts` | Database initialization |
| `packages/shared/src/types/index.ts` | Shared TypeScript types |
| `apps/admin/vitest.config.ts` | Admin app testing configuration |

---

## 📊 Progress Tracking

- **Total Tasks**: 10
- **Completed**: 10 ✅
- **In Progress**: 0
- **Remaining**: 0
- **Estimated Completion**: 16-18 hours
- **Actual Completion**: ~18 hours
- **Completion Date**: December 13, 2025
- **Status**: **FULLY COMPLETED**

---

## 📝 Notes & Considerations

1. **Simplified Architecture**: Following the new simplified structure with consolidated backend package containing all business logic
2. **Database Design**: All schemas should follow the documented structure in `docs/database/collections/`
3. **Security**: Password hashing implemented with bcrypt, proper indexing for performance
4. **Type Safety**: Leverage TypeScript throughout for better developer experience
5. **Testing**: Each model should have basic tests created
6. **Environment**: Keep production and development configurations separate
7. **Error Handling**: Implement proper error handling for database operations
8. **Performance**: Add appropriate indexes for frequently queried fields
9. **Workspace Dependencies**: Backend package depends on shared package for types and constants

---

*Last Updated: December 13, 2025*
*Status: ✅ COMPLETED - Ready for Milestone 1.2*
*Next Steps: Begin Milestone 1.2: API Foundation*
