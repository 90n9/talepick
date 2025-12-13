# TalePick Admin API Specification

> **Version**: 1.0.0
> **Base URL**: `https://admin.talepick.com`
> **Architecture**: Next.js 16 App Router API Routes
> **Documentation**: Updated December 13, 2025

## 🏗️ Architecture Overview

TalePick uses Next.js 16 with App Router for both frontend and admin applications. APIs are implemented as Next.js API routes within each app:

- **Frontend App**: `https://www.talepick.com` → API routes at `/api/*`
- **Admin App**: `https://admin.talepick.com` → API routes at `/api/*`

Both apps share the same backend package (`@talepick/backend`) containing business logic, database models, and use cases following Clean Architecture principles.

## 🚀 API Route Structure

### Development URLs
- **Frontend**: `http://localhost:3000` → API at `http://localhost:3000/api/*`
- **Admin**: `http://localhost:3001` → API at `http://localhost:3001/api/*`

### Production URLs
- **Frontend**: `https://www.talepick.com` → API at `https://www.talepick.com/api/*`
- **Admin**: `https://admin.talepick.com` → API at `https://admin.talepick.com/api/*`

### File Structure
```
/apps/frontend/app/api/
├── auth/
│   ├── register/route.ts
│   ├── login/route.ts
│   └── verify-otp/route.ts
├── stories/
│   ├── route.ts
│   └── [id]/route.ts
├── users/
│   ├── route.ts
│   └── [id]/route.ts
└── health/route.ts

/apps/admin/app/api/
├── auth/
│   ├── login/route.ts
│   └── refresh/route.ts
├── users/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── suspend/route.ts
├── stories/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── publish/route.ts
├── analytics/
│   ├── dashboard/route.ts
│   └── export/route.ts
└── health/route.ts
```

### Shared Backend Package
All API routes import and use the shared backend package:

```typescript
// Example API route structure
import { NextRequest, NextResponse } from 'next/server';
import { container } from 'tsyringe';
import { GetUsersUseCase } from '@talepick/backend/src/application/use-cases';
import { MongoDBUserRepository } from '@talepick/backend/src/infrastructure/repositories';

export async function GET(request: NextRequest) {
  try {
    const getUsersUseCase = container.resolve(GetUsersUseCase);
    const users = await getUsersUseCase.execute();

    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SYSTEM_001',
          message: 'Internal server error'
        }
      },
      { status: 500 }
    );
  }
}
```

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Dashboard Analytics](#2-dashboard-analytics)
3. [User Management](#3-user-management)
4. [Story Management](#4-story-management)
5. [Achievement Management](#5-achievement-management)
6. [Genre Management](#6-genre-management)
7. [Review & Moderation](#7-review--moderation)
8. [Analytics & Reporting](#8-analytics--reporting)
9. [System Configuration](#9-system-configuration)
10. [Admin Account Management](#10-admin-account-management)
11. [Error Handling](#11-error-handling)
12. [Rate Limiting & Security](#12-rate-limiting--security)

---

## 1. Authentication & Authorization

### 1.1 Admin Login

**POST** `/api/auth/login`

Authenticate admin users and receive JWT tokens.

**Request Body:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

**Response:**
```typescript
interface LoginResponse {
  success: true;
  data: {
    admin: AdminAccount;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
```

### 1.2 Admin Logout

**POST** `/api/auth/logout`

Invalidate the current admin session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
interface LogoutResponse {
  success: true;
  message: "Successfully logged out";
}
```

### 1.3 Refresh Token

**POST** `/api/auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```typescript
interface RefreshRequest {
  refreshToken: string;
}
```

### 1.4 Get Current Admin

**GET** `/api/auth/me`

Get current authenticated admin information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
interface CurrentAdminResponse {
  success: true;
  data: AdminAccount;
}
```

### 1.5 Password Reset Flow

**POST** `/api/auth/forgot-password`
```typescript
interface ForgotPasswordRequest {
  email: string;
}
```

**POST** `/api/auth/verify-otp`
```typescript
interface VerifyOTPRequest {
  email: string;
  otp: string;
}
```

**POST** `/api/auth/reset-password`
```typescript
interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}
```

### 1.6 Admin Account Schema

```typescript
interface AdminAccount {
  id: string;
  username: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'ANALYST';
  permissions: string[];
  profile: {
    displayName: string;
    avatar: {
      type: 'default' | 'custom' | 'gravatar';
      value: string;
    };
    bio?: string;
  };
  security: {
    lastLogin: Date;
    loginAttempts: number;
    lockedUntil?: Date;
    passwordChangedAt: Date;
    twoFactorEnabled: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    emailNotifications: boolean;
  };
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. Dashboard Analytics

### 2.1 Dashboard Overview

**GET** `/api/analytics/dashboard`

Get comprehensive dashboard statistics and trends.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (optional): `7d` | `30d` | `90d` | `1y` (default: `30d`)
- `compare` (optional): `true` | `false` (default: `true`)

**Response:**
```typescript
interface DashboardAnalyticsResponse {
  success: true;
  data: {
    overview: {
      registeredUsers: number;
      dailyActiveUsers: number;
      storyPlaysToday: number;
      creditsConsumedToday: number;
      estimatedRevenue: number;
      ratingsToday: number;
      achievementsToday: number;
      systemErrors: number;
      trends: {
        users: number; // % change
        plays: number; // % change
        revenue: number; // % change
      };
    };
    charts: {
      dailyStats: Array<{
        date: string;
        activeUsers: number;
        storyPlays: number;
        creditsUsed: number;
        revenue: number;
      }>;
      userDistribution: {
        registered: number;
        guests: number;
        percentage: { registered: number; guests: number };
      };
      storyFunnel: Array<{
        stage: string;
        count: number;
        percentage: number;
        dropOffRate?: number;
      }>;
      creditHeatmap: Array<{
        day: string;
        hourlyUsage: number[];
        totalUsage: number;
      }>;
    };
    topContent: {
      stories: Array<{
        id: string;
        title: string;
        genre: string;
        totalPlayers: number;
        completionRate: number;
        rating: number;
        revenue: number;
      }>;
      genres: Array<{
        name: string;
        storyCount: number;
        totalPlays: number;
        averageRating: number;
      }>;
    };
    system: {
      logs: Array<{
        id: string;
        type: 'error' | 'warning' | 'info';
        level: 'critical' | 'high' | 'medium' | 'low';
        message: string;
        location: string;
        timestamp: Date;
        resolved: boolean;
      }>;
      performance: {
        averageResponseTime: number;
        uptime: number;
        databaseConnections: number;
        memoryUsage: number;
      };
    };
  };
}
```

---

## 3. User Management

### 3.1 List Users

**GET** `/api/users`

Get paginated list of users with advanced filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
```typescript
interface UserFilters {
  search?: string;           // Search by username, email, or display name
  type?: 'all' | 'guest' | 'registered';
  status?: 'all' | 'active' | 'suspended' | 'banned' | 'under_review';
  credits?: 'all' | 'low' | 'high' | 'zero';
  achievements?: 'all' | 'none' | 'high_achiever';
  ratings?: 'all' | 'none' | 'has_ratings';
  stories?: 'all' | 'none' | 'completed';
  registrationDate?: 'all' | 'today' | 'week' | 'month' | 'year';
  lastActive?: 'all' | 'today' | 'week' | 'month';
  sortBy?: 'createdAt' | 'lastLoginAt' | 'credits' | 'storiesPlayed' | 'username';
  sortOrder?: 'asc' | 'desc';
  page?: number;            // Default: 1
  limit?: number;           // Default: 20, Max: 100
}
```

**Response:**
```typescript
interface UsersListResponse {
  success: true;
  data: {
    users: UserResponse[];
    meta: {
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
      filters: {
        activeFilters: Record<string, any>;
        availableFilters: {
          statuses: Array<{ value: string; count: number }>;
          types: Array<{ value: string; count: number }>;
        };
      };
      statistics: {
        totalUsers: number;
        activeUsers: number;
        suspendedUsers: number;
        bannedUsers: number;
        averageCredits: number;
        totalStoriesPlayed: number;
      };
    };
  };
}
```

### 3.2 Get User Details

**GET** `/api/users/:id`

Get comprehensive user details including activity history.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
interface UserDetailsResponse {
  success: true;
  data: UserResponse;
}
```

### 3.3 User Response Schema

```typescript
interface UserResponse {
  id: string;
  username: string;
  email?: string;
  profile: {
    displayName: string;
    avatar: {
      type: 'default' | 'custom' | 'google';
      value: string;
    };
    bio?: string;
  };
  authentication: {
    authMethod: 'email' | 'google' | 'guest';
    isGuest: boolean;
    emailVerified: boolean;
    hasPassword: boolean;
    twoFactorEnabled: boolean;
  };
  gameStats: {
    credits: number;
    maxCredits: number;
    totalStoriesPlayed: number;
    totalEndingsUnlocked: number;
    totalAvatarsUnlocked: number;
    totalPlaytime: number;
    lastLoginAt: Date;
    lastCreditRefill: Date;
    createdAt: Date;
  };
  accountStatus: {
    status: 'active' | 'suspended' | 'banned' | 'under_review';
    reason?: string;
    moderatedBy?: string;
    moderatedAt?: Date;
    expiresAt?: Date;
  };
  achievements: {
    unlocked: Array<{
      id: string;
      title: string;
      description: string;
      unlockedAt: Date;
    }>;
    total: number;
    progress: Array<{
      achievementId: string;
      title: string;
      currentProgress: number;
      requiredProgress: number;
      percentage: number;
    }>;
  };
  ratings: Array<{
    storyId: string;
    title: string;
    rating: number;
    comment?: string;
    createdAt: Date;
    isEdited: boolean;
  }>;
  storyProgress: Array<{
    storyId: string;
    title: string;
    progress: number;
    status: 'playing' | 'completed' | 'abandoned';
    lastPlayed: Date;
    playtime: number;
    choices: number;
  }>;
  activityLogs: Array<{
    id: string;
    action: string;
    details: string;
    ip?: string;
    userAgent?: string;
    timestamp: Date;
  }>;
  financial: {
    totalCreditsEarned: number;
    totalCreditsSpent: number;
    totalRefills: number;
    totalAchievementsEarned: number;
    estimatedValue: number;
  };
}
```

### 3.4 User Management Actions

**Suspend User**
```http
POST /api/users/:id/suspend
Authorization: Bearer <token>

{
  "reason": "Violation of community guidelines",
  "duration": 7, // days, optional, null for permanent
  "notifyUser": true
}
```

**Ban User**
```http
POST /api/users/:id/ban
Authorization: Bearer <token>

{
  "reason": "Multiple violations",
  "permanent": true,
  "notifyUser": false
}
```

**Adjust Credits**
```http
POST /api/users/:id/adjust-credits
Authorization: Bearer <token>

{
  "amount": 100,
  "type": "grant" | "deduct",
  "reason": "Compensation for system downtime",
  "notifyUser": true
}
```

**Reset Password**
```http
POST /api/users/:id/reset-password
Authorization: Bearer <token>

{
  "sendEmail": true,
  "temporaryPassword": "generated-temp-password" // optional
}
```

### 3.5 User Activity & Progress

**GET** `/api/users/:id/activity-history`

**Query Parameters:**
- `type` (optional): `all` | `login` | `story` | `achievement` | `purchase`
- `period` (optional): `7d` | `30d` | `90d` | `all`
- `page` (optional): Default: 1
- `limit` (optional): Default: 20

**GET** `/api/users/:id/story-progress`

Get detailed progress for all stories played by user.

---

## 4. Story Management

### 4.1 List Stories

**GET** `/api/stories`

**Query Parameters:**
```typescript
interface StoryFilters {
  search?: string;
  status?: 'all' | 'published' | 'draft' | 'archived' | 'suspended';
  genre?: string;
  author?: string;
  contentRating?: 'all' | '0' | '13' | '16' | '18';
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'totalPlayers' | 'rating' | 'revenue';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
interface StoriesListResponse {
  success: true;
  data: {
    stories: StoryResponse[];
    meta: {
      pagination: PaginationMeta;
      filters: {
        genres: Array<{ id: string; name: string; count: number }>;
        authors: Array<{ id: string; name: string; count: number }>;
        ratings: Array<{ rating: string; count: number }>;
      };
      statistics: {
        totalStories: number;
        publishedStories: number;
        totalPlays: number;
        averageRating: number;
        totalRevenue: number;
      };
    };
  };
}
```

### 4.2 Story Response Schema

```typescript
interface StoryResponse {
  id: string;
  title: string;
  description: string;
  metadata: {
    genre: string;
    tags: string[];
    author: string;
    isPublished: boolean;
    isComingSoon: boolean;
    launchDate?: Date;
    contentRating: {
      ageRating: 0 | 13 | 16 | 18;
      violenceLevel: 'none' | 'mild' | 'moderate' | 'high';
      contentWarnings: string[];
    };
    language: string;
    estimatedDuration: number; // minutes
  };
  media: {
    coverImageUrl?: string;
    headerImageUrl?: string;
    coverVideoUrl?: string;
    bgMusicUrl?: string;
    trailerUrl?: string;
    gallery: {
      images: Array<{
        id: string;
        url: string;
        alt?: string;
        order: number;
      }>;
      totalImages: number;
    };
  };
  stats: {
    totalPlayers: number;
    averageRating: number;
    totalRatings: number;
    averagePlaytime: number;
    estimatedDuration: string;
    totalEndings: number;
    totalChoices: number;
    completionRate: number;
    revenue: number;
    views: number;
    shares: number;
  };
  content: {
    startingNodeId?: string;
    totalNodes: number;
    wordCount: number;
    lastEdited: Date;
    editorVersion: string;
  };
  moderation: {
    status: 'approved' | 'pending' | 'suspended' | 'removed';
    reportCount: number;
    moderatedBy?: string;
    moderatedAt?: Date;
    reason?: string;
    notes?: string;
  };
  monetization: {
    pricePerPlay: number;
    creatorRevenue: number;
    platformFee: number;
    totalRevenue: number;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
```

### 4.3 Story CRUD Operations

**Create Story**
```http
POST /api/stories
Authorization: Bearer <token>

{
  "title": "Story Title",
  "description": "Story description",
  "genre": "romance",
  "tags": ["romance", "drama"],
  "contentRating": {
    "ageRating": 13,
    "violenceLevel": "mild",
    "contentWarnings": []
  },
  "estimatedDuration": 30
}
```

**Update Story**
```http
PUT /api/stories/:id
Authorization: Bearer <token>
```

**Delete Story**
```http
DELETE /api/stories/:id
Authorization: Bearer <token>

{
  "reason": "Content policy violation",
  "notifyAuthor": true
}
```

### 4.4 Story Content Management

**Get Story Nodes**
```http
GET /api/stories/:id/nodes
Authorization: Bearer <token>
```

**Create Story Node**
```http
POST /api/stories/:id/nodes
Authorization: Bearer <token>

{
  "title": "Chapter 1",
  "content": "Story content here...",
  "choices": [
    {
      "text": "Choice 1",
      "nextNodeId": "node2"
    },
    {
      "text": "Choice 2",
      "nextNodeId": "node3"
    }
  ],
  "image": "image_url",
  "audio": "audio_url",
  "isEnding": false,
  "order": 1
}
```

**Story Node Schema**
```typescript
interface StoryNode {
  id: string;
  storyId: string;
  title?: string;
  content: string;
  choices: Array<{
    id: string;
    text: string;
    nextNodeId?: string;
    conditions?: {
      type: 'achievement' | 'credit' | 'custom';
      value: any;
    };
    consequences?: {
      type: 'achievement' | 'credit' | 'story_flag';
      value: any;
    };
  }>;
  media: {
    image?: string;
    audio?: string;
    video?: string;
    backgroundMusic?: string;
  };
  isEnding: boolean;
  endingType?: 'good' | 'bad' | 'neutral' | 'secret';
  flags?: string[]; // Story progression flags
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.5 Story Publication

**Publish Story**
```http
POST /api/stories/:id/publish
Authorization: Bearer <token>

{
  "publishImmediately": true,
  "launchDate": "2025-01-15T10:00:00Z",
  "notifyFollowers": true
}
```

**Unpublish Story**
```http
POST /api/stories/:id/unpublish
Authorization: Bearer <token>

{
  "reason": "Content review required",
  "temporary": true
}
```

---

## 5. Achievement Management

### 5.1 List Achievements

**GET** `/api/achievements`

**Query Parameters:**
- `type` (optional): `all` | `AUTO` | `MANUAL`
- `status` (optional): `all` | `active` | `inactive`
- `sortBy` (optional): `createdAt` | `usersUnlocked` | `title`

**Response:**
```typescript
interface AchievementsListResponse {
  success: true;
  data: {
    achievements: Achievement[];
    statistics: {
      total: number;
      active: number;
      totalUnlocks: number;
      averageUnlockRate: number;
    };
  };
}
```

### 5.2 Achievement Schema

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'AUTO' | 'MANUAL';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  triggerType: 'STORY_COUNT' | 'PLAY_TIME' | 'RATING_COUNT' | 'COMPLETION_RATE' | 'SPECIAL' | 'LOGIN_STREAK';
  threshold?: number;
  conditions?: {
    genre?: string;
    difficulty?: string;
    customRules?: Record<string, any>;
  };
  rewards: {
    credits: number;
    maxCredits?: number;
    avatar?: string;
    badge?: string;
  };
  usersUnlocked: number;
  unlockTrend: number; // % change in last 30 days
  statistics: {
    totalEligibleUsers: number;
    unlockRate: number;
    averageUnlockTime: number; // days
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.3 Achievement Management

**Create Achievement**
```http
POST /api/achievements
Authorization: Bearer <token>

{
  "title": "Story Master",
  "description": "Complete 50 stories",
  "type": "AUTO",
  "triggerType": "STORY_COUNT",
  "threshold": 50,
  "rewards": {
    "credits": 500,
    "maxCredits": 2000
  },
  "rarity": "epic",
  "isActive": true
}
```

**Toggle Achievement Status**
```http
POST /api/achievements/:id/toggle
Authorization: Bearer <token>
```

**Grant Achievement to User**
```http
POST /api/users/:userId/achievements/:achievementId/grant
Authorization: Bearer <token>

{
  "reason": "Manual reward for contest winner",
  "notifyUser": true
}
```

**Revoke Achievement**
```http
DELETE /api/users/:userId/achievements/:achievementId
Authorization: Bearer <token>

{
  "reason": "Error in achievement system"
}
```

---

## 6. Genre Management

### 6.1 Genre CRUD

**GET** `/api/genres`
**POST** `/api/genres`
**PUT** `/api/genres/:id`
**DELETE** `/api/genres/:id`

### 6.2 Genre Schema

```typescript
interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  storyCount: number;
  totalPlays: number;
  averageRating: number;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 6.3 Genre Management Operations

**Create Genre**
```http
POST /api/genres
Authorization: Bearer <token>

{
  "name": "Science Fiction",
  "description": "Stories set in futuristic or alternate worlds",
  "icon": "rocket",
  "color": "#3B82F6",
  "featured": true
}
```

**Toggle Genre Status**
```http
POST /api/genres/:id/toggle
Authorization: Bearer <token>
```

---

## 7. Review & Moderation

### 7.1 Review Management

**GET** `/api/reviews`

**Query Parameters:**
```typescript
interface ReviewFilters {
  status?: 'all' | 'approved' | 'pending' | 'rejected' | 'flagged';
  rating?: '1' | '2' | '3' | '4' | '5';
  hasSpoiler?: boolean;
  hasComment?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  storyId?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'rating' | 'upVotes';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
interface ReviewsListResponse {
  success: true;
  data: {
    reviews: Review[];
    statistics: {
      totalReviews: number;
      pendingReviews: number;
      flaggedReviews: number;
      averageRating: number;
    };
  };
}
```

### 7.2 Review Schema

```typescript
interface Review {
  id: string;
  userId: string;
  storyId: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    isGuest: boolean;
  };
  story: {
    id: string;
    title: string;
    author: string;
    genre: string;
  };
  rating: number;
  reviewText: string;
  isSpoiler: boolean;
  isEdited: boolean;
  editedAt?: Date;
  upVotes: number;
  downVotes: number;
  reports: Array<{
    id: string;
    reason: string;
    reportedBy: string;
    createdAt: Date;
  }>;
  adminReply?: {
    id: string;
    text: string;
    adminId: string;
    adminName: string;
    createdAt: Date;
    isEdited: boolean;
    editedAt?: Date;
  };
  moderation: {
    status: 'approved' | 'pending' | 'rejected' | 'flagged';
    flaggedCount: number;
    moderatedBy?: string;
    moderatedAt?: Date;
    reason?: string;
    notes?: string;
  };
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.3 Review Moderation Actions

**Approve Review**
```http
PUT /api/reviews/:id/approve
Authorization: Bearer <token>

{
  "notes": "Review meets community guidelines"
}
```

**Reject Review**
```http
PUT /api/reviews/:id/reject
Authorization: Bearer <token>

{
  "reason": "Contains inappropriate language",
  "notifyUser": true,
  "notes": "Specific policy violations cited"
}
```

**Reply to Review**
```http
POST /api/reviews/:id/reply
Authorization: Bearer <token>

{
  "text": "Thank you for your detailed feedback!",
  "notifyUser": true
}
```

### 7.4 Content Moderation

**GET** `/api/reports`

Get list of reported content requiring moderation.

**Query Parameters:**
- `type` (optional): `all` | `review` | `story` | `user` | `comment`
- `status` (optional): `all` | `pending` | `resolved` | `dismissed`
- `priority` (optional): `all` | `high` | `medium` | `low`

**Review Report**
```http
PUT /api/reports/:id/review
Authorization: Bearer <token>

{
  "action": "remove_content" | "warn_user" | "suspend_user" | "dismiss",
  "reason": "Policy violation confirmed",
  "internalNotes": "User has previous warnings",
  "notifyReporter": true
}
```

---

## 8. Analytics & Reporting

### 8.1 Advanced Analytics

**User Analytics**
```http
GET /api/analytics/users
Authorization: Bearer <token>

{
  "period": "30d",
  "metrics": ["demographics", "retention", "engagement"],
  "segmentBy": "device" | "country" | "age" | "acquisition_source"
}
```

**Story Analytics**
```http
GET /api/analytics/stories
Authorization: Bearer <token>
```

**Revenue Analytics**
```http
GET /api/analytics/revenue
Authorization: Bearer <token>
```

### 8.2 Analytics Response Schema

```typescript
interface AnalyticsResponse {
  success: true;
  data: {
    period: {
      start: string;
      end: string;
      comparison: {
        start: string;
        end: string;
      };
    };
    metrics: {
      users: {
        total: number;
        new: number;
        active: number;
        returning: number;
        churned: number;
        demographics: {
          byDevice: Record<string, number>;
          byCountry: Record<string, number>;
          byAge: Record<string, number>;
          byGender: Record<string, number>;
        };
        acquisition: {
          sources: Record<string, number>;
          costPerAcquisition: Record<string, number>;
        };
        retention: {
          day1: number;
          day7: number;
          day30: number;
          cohortAnalysis: Array<{
            cohort: string;
            size: number;
            retentionRates: number[];
          }>;
        };
      };
      engagement: {
        sessionDuration: {
          average: number;
          median: number;
          distribution: Array<{ range: string; count: number }>;
        };
        pageViews: number;
        bounceRate: number;
        storyCompletionRate: number;
        achievementRate: number;
        socialActions: {
          shares: number;
          comments: number;
          ratings: number;
        };
      };
      stories: {
        total: number;
        published: number;
        plays: number;
        completions: number;
        averageRating: number;
        topGenres: Array<{ genre: string; count: number; growth: number }>;
        performance: Array<{
          storyId: string;
          title: string;
          plays: number;
          completionRate: number;
          rating: number;
          revenue: number;
        }>;
      };
      revenue: {
        total: number;
        recurring: number;
        oneTime: number;
        bySource: Record<string, number>;
        projections: {
          monthly: number;
          quarterly: number;
          yearly: number;
        };
        averageRevenuePerUser: number;
        lifetimeValue: number;
      };
    };
    insights: Array<{
      type: 'trend' | 'anomaly' | 'opportunity' | 'warning';
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      confidence: number;
      recommendations: string[];
    }>;
  };
}
```

### 8.3 Export Analytics

**GET** `/api/analytics/export`

Export analytics data in various formats.

**Query Parameters:**
- `type` (required): `users` | `stories` | `revenue` | `engagement`
- `format` (required): `csv` | `xlsx` | `json` | `pdf`
- `period` (required): `7d` | `30d` | `90d` | `1y` | `custom`
- `dateRange` (optional): `{ start: string; end: string }`
- `fields` (optional): string[] - specific fields to include
- `filters` (optional): Record<string, any>

---

## 9. System Configuration

### 9.1 Get System Configuration

**GET** `/api/config`

**Response:**
```typescript
interface SystemConfig {
  credits: {
    initialCredits: number;
    maxCredits: number;
    refillInterval: number; // milliseconds
    refillAmount: number;
    storyCost: number;
    bonusCredits: {
      registration: number;
      firstStory: number;
      ratingBonus: number;
      achievementBonus: number;
    };
  };
  features: {
    registrationsEnabled: boolean;
    guestAccessEnabled: boolean;
    socialSharingEnabled: boolean;
    commentsEnabled: boolean;
    achievementsEnabled: boolean;
    leaderboardsEnabled: boolean;
  };
  limits: {
    maxStoriesPerDay: number;
    maxRatingLength: number;
    maxCommentLength: number;
    maxUploadSize: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  content: {
    autoApproveStories: boolean;
    autoApproveReviews: boolean;
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
    contentFilters: Array<{
      type: string;
      enabled: boolean;
      sensitivity: 'low' | 'medium' | 'high';
    }>;
  };
  maintenance: {
    enabled: boolean;
    message: string;
    startTime?: Date;
    endTime?: Date;
    affectedFeatures: string[];
  };
  notifications: {
    email: {
      enabled: boolean;
      smtpConfig: {
        host: string;
        port: number;
        secure: boolean;
      };
      templates: Record<string, boolean>;
    };
    push: {
      enabled: boolean;
      vapidKeys: {
        publicKey: string;
        privateKey: string;
      };
    };
  };
  analytics: {
    trackingEnabled: boolean;
    dataRetentionDays: number;
    anonymizeIp: boolean;
    cookieConsent: boolean;
  };
}
```

### 9.2 Update System Configuration

**PUT** `/api/config`

**Request Body:** Partial SystemConfig object

```http
PUT /api/config
Authorization: Bearer <token>

{
  "credits": {
    "initialCredits": 100,
    "maxCredits": 1000,
    "refillInterval": 300000, // 5 minutes
    "refillAmount": 10
  },
  "features": {
    "registrationsEnabled": true,
    "guestAccessEnabled": false
  }
}
```

### 9.3 Maintenance Mode

**Enable Maintenance**
```http
PUT /api/config/maintenance
Authorization: Bearer <token>

{
  "enabled": true,
  "message": "System maintenance in progress. We'll be back shortly!",
  "startTime": "2025-01-15T02:00:00Z",
  "endTime": "2025-01-15T06:00:00Z",
  "affectedFeatures": ["story_play", "user_registration"]
}
```

---

## 10. Admin Account Management

### 10.1 Admin Account CRUD

**GET** `/api/accounts`
**POST** `/api/accounts`
**GET** `/api/accounts/:id`
**PUT** `/api/accounts/:id`
**DELETE** `/api/accounts/:id`

### 10.2 Admin Permissions

**GET** `/api/accounts/permissions`

Get available permissions and their descriptions.

**Response:**
```typescript
interface PermissionsResponse {
  success: true;
  data: {
    roles: Array<{
      name: string;
      displayName: string;
      description: string;
      permissions: string[];
    }>;
    permissions: Array<{
      id: string;
      name: string;
      description: string;
      category: 'users' | 'stories' | 'analytics' | 'system' | 'moderation';
      level: 'read' | 'write' | 'delete' | 'admin';
    }>;
  };
}
```

### 10.3 Admin Account Actions

**Suspend Admin**
```http
POST /api/accounts/:id/suspend
Authorization: Bearer <token>

{
  "reason": "Security policy violation",
  "duration": 30, // days
  "notifyUser": true
}
```

**Activate Admin**
```http
POST /api/accounts/:id/activate
Authorization: Bearer <token>
```

---

## 11. Error Handling

### 11.1 Standard Response Format

All API endpoints follow this standard response format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    field?: string; // For validation errors
    timestamp: string;
    requestId: string;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

### 11.2 Error Codes

#### Authentication Errors
- `AUTH_001` - Invalid credentials
- `AUTH_002` - Token expired
- `AUTH_003` - Token invalid
- `AUTH_004` - Insufficient permissions
- `AUTH_005` - Account locked
- `AUTH_006` - Two-factor required
- `AUTH_007` - Email not verified

#### User Errors
- `USER_001` - User not found
- `USER_002` - User already exists
- `USER_003` - User account suspended
- `USER_004` - User account banned
- `USER_005` - Invalid user status

#### Story Errors
- `STORY_001` - Story not found
- `STORY_002` - Story already published
- `STORY_003` - Story not published
- `STORY_004` - Invalid story content
- `STORY_005` - Story node not found
- `STORY_006` - Circular story nodes

#### Validation Errors
- `VALIDATION_001` - Invalid input data
- `VALIDATION_002` - Required field missing
- `VALIDATION_003` - Invalid email format
- `VALIDATION_004` - Password too weak
- `VALIDATION_005` - Invalid date range
- `VALIDATION_006` - File too large
- `VALIDATION_007` - Invalid file type

#### System Errors
- `SYSTEM_001` - Internal server error
- `SYSTEM_002` - Database error
- `SYSTEM_003` - External service error
- `SYSTEM_004` - Rate limit exceeded
- `SYSTEM_005` - Maintenance mode active
- `SYSTEM_006` - Feature disabled

#### Business Logic Errors
- `BUSINESS_001` - Insufficient credits
- `BUSINESS_002` - Story already played
- `BUSINESS_003` - Achievement already unlocked
- `BUSINESS_004` - Review already submitted
- `BUSINESS_005` - Daily limit exceeded

### 11.3 HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## 12. Rate Limiting & Security

### 12.1 Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 5 requests | per minute |
| Search/Discovery | 100 requests | per minute |
| CRUD Operations | 60 requests | per minute |
| Analytics | 30 requests | per minute |
| File Upload | 10 requests | per minute |
| Bulk Operations | 5 requests | per hour |

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### 12.2 Security Headers

All API responses include these security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 12.3 CORS Configuration

```http
Access-Control-Allow-Origin: https://admin.talepick.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### 12.4 API Versioning

API version is specified in the URL path and headers:

```http
# URL versioning (preferred)
/api/v1/admin/users

# Header versioning
Accept: application/vnd.talepick.v1+json
```

### 12.5 Request ID

Every request includes a unique identifier for tracking:

```http
X-Request-ID: req_1234567890abcdef
```

---

## Implementation Notes

### Database Models Reference

This API specification is based on the following database models:

1. **User Model** (`/packages/backend/src/infrastructure/models/User.ts`)
   - Authentication and profile data
   - Game statistics and credits
   - Account status and moderation

2. **AdminAccount Model** (`/packages/backend/src/infrastructure/models/AdminAccount.ts`)
   - Admin authentication and roles
   - Permissions and security settings
   - Audit logs and activity tracking

3. **Story Model** (`/packages/backend/src/infrastructure/models/Story.ts`)
   - Story metadata and content
   - Media files and assets
   - Statistics and moderation data

4. **StoryNode Model** (`/packages/backend/src/infrastructure/models/StoryNode.ts`)
   - Individual story nodes
   - Choices and branching logic
   - Media and conditional logic

5. **Achievement Model** (`/packages/backend/src/infrastructure/models/Achievement.ts`)
   - Achievement definitions and conditions
   - Rewards and unlocking logic
   - User progress tracking

6. **Review Model** (`/packages/backend/src/infrastructure/models/Review.ts`)
   - User reviews and ratings
   - Moderation and admin replies
   - Voting and reporting

7. **Analytics Model** (`/packages/backend/src/infrastructure/models/Analytics.ts`)
   - Event tracking and metrics
   - Aggregated statistics
   - Performance monitoring

### Authentication Flow

1. Admin users authenticate via `/api/auth/login`
2. Receive JWT access token (15 min expiry) and refresh token (7 days)
3. Include `Authorization: Bearer <token>` header in all API requests
4. Use refresh token to obtain new access tokens
5. All admin operations require appropriate permissions

### Pagination

List endpoints support pagination with these parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Pagination metadata is included in the response:
```typescript
{
  "page": 1,
  "limit": 20,
  "total": 500,
  "totalPages": 25,
  "hasNext": true,
  "hasPrev": false
}
```

### Search and Filtering

Most list endpoints support advanced filtering:
- Text search across relevant fields
- Filter by status, type, date ranges
- Sort by multiple fields
- Custom filter combinations

### Webhooks

The system supports webhooks for real-time notifications:

```typescript
interface WebhookEvent {
  id: string;
  type: 'user.created' | 'story.published' | 'review.flagged';
  data: any;
  timestamp: Date;
  signature: string; // HMAC-SHA256
}
```

Configure webhooks via the admin panel or API.

### API Client SDKs

Official client SDKs are available for:
- JavaScript/TypeScript (Node.js, Browser)
- Python
- PHP
- Ruby

Install via npm: `@talepick/admin-api-sdk`

### Support

For API support and questions:
- Documentation: https://docs.talepick.com/api
- Support email: api-support@talepick.com
- Status page: https://status.talepick.com
- Developer Discord: https://discord.gg/talepick
