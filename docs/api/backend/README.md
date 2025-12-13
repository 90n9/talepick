# TalePick Admin API Specification

> **Version**: 1.0.0  
> **Base URL**: `https://admin.talepick.com`  
> **API Prefix**: `/api`  
> **Updated**: 2025-12-13

## 1. Scope

This document defines the request/response contract for the admin-facing HTTP API. It is written to be machine-checkable (AI) and focuses on input/output shapes, types, and error semantics.

## 2. Conventions

- **Content type**: JSON for all requests/responses unless stated otherwise.
- **Request body**: `Content-Type: application/json` is required for endpoints with a JSON body.
- **IDs**: MongoDB ObjectId strings (24 hex chars) unless explicitly noted.
- **Timestamps**: ISO 8601 strings in UTC (RFC 3339), e.g. `2025-12-13T00:00:00.000Z`.
- **Pagination**: `page` (1-based) and `limit`.
- **Auth header**: `Authorization: Bearer <accessToken>`.
- **Request ID**: optionally pass `x-request-id` or `x-correlation-id`; API may echo back `requestId` in responses.

## 3. Standard Response Envelope

All endpoints return `ApiResponse<T>` on success and `ApiError` on failure, except `/api/health` which is a raw health payload (no envelope).

```ts
export type ISODateString = string; // e.g. "2025-12-13T00:00:00.000Z"
export type ObjectId = string; // Mongo ObjectId hex string (24 chars)

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: ISODateString;
  requestId?: string;
}

export interface ApiPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type ApiPaginatedResponse<T> = ApiResponse<{
  items: T[];
  meta: ApiPaginationMeta;
}>;

export enum ErrorCode {
  // Server errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
  timestamp: ISODateString;
  requestId?: string;
}
```

## 4. Authentication

- **Admin access token**: short-lived JWT used in `Authorization` header.
- **Refresh token**: long-lived token used only with `/api/auth/refresh`.
- **Separation**: admin tokens and user tokens are signed with different keys and must not be accepted across apps.

## 5. Data Models (DB-aligned)

Schemas below align with `/packages/backend/src/infrastructure/models/*` unless marked as a derived DTO.

```ts
// Admin accounts (from AdminAccount.ts)
export type AdminRole = 'Super Admin' | 'Story Editor' | 'User Manager' | 'Achievement Manager';
export type AdminStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';
export type AdminAuthMethod = 'email' | 'google' | 'both';
export type AdminAvatarType = 'default' | 'custom' | 'google';

export interface AdminAccountPublic {
  id: ObjectId;
  username: string;
  email: string;
  authentication: {
    authMethod: AdminAuthMethod;
    googleId?: string;
    googleEmail?: string;
    googleProfile?: {
      displayName: string;
      profileImageUrl: string;
      locale: string;
    };
    hasPassword: boolean;
    lastPasswordChange?: ISODateString;
  };
  role: AdminRole;
  permissions: string[];
  status: AdminStatus;
  profile: {
    displayName: string;
    avatar: { type: AdminAvatarType; value?: string };
    bio?: string;
  };
  lastActive?: ISODateString;
  lastLogin?: ISODateString;
  createdBy?: ObjectId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// Users (from User.ts) (admin view)
export type UserAuthMethod = 'email' | 'google' | 'guest';
export type UserAvatarType = 'default' | 'custom' | 'google';
export type UserAccountStatus = 'active' | 'suspended' | 'banned' | 'under_review' | 'locked';
export type UserLockType = 'manual' | 'auto_security' | 'auto_fraud';

export interface AdminUser {
  id: ObjectId;
  email: string;
  username: string;
  profile: {
    displayName: string;
    avatar: { type: UserAvatarType; value: string };
    bio?: string;
    profileImageUrl?: string;
  };
  authentication: {
    authMethod: UserAuthMethod;
    isGuest: boolean;
    emailVerified: boolean;
    hasPassword: boolean;
  };
  accountStatus: {
    status: UserAccountStatus;
    reason?: string;
    moderatedBy?: ObjectId;
    moderatedAt?: ISODateString;
    suspensionEndsAt?: ISODateString;
    lockType?: UserLockType;
    lockExpiresAt?: ISODateString;
  };
  gameStats: {
    credits: number;
    maxCredits: number;
    lastCreditRefill: ISODateString;
    totalStoriesPlayed: number;
    totalEndingsUnlocked: number;
    totalAvatarsUnlocked: number;
    currentAvatarId?: string;
    createdAt: ISODateString;
    lastLoginAt?: ISODateString;
  };
  deletedAt?: ISODateString;
  deleteReason?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// Stories (from Story.ts) (admin view)
export type StoryModerationStatus = 'approved' | 'pending' | 'suspended' | 'removed';
export type StoryViolenceLevel = 'none' | 'mild' | 'moderate' | 'high';
export type StoryAgeRating = 0 | 13 | 16 | 18;

export interface AdminStory {
  id: ObjectId;
  title: string;
  description: string;
  metadata: {
    genre: string;
    tags: string[];
    author: string;
    createdAt: ISODateString;
    publishedAt?: ISODateString;
    isPublished: boolean;
    isComingSoon: boolean;
    launchDate?: ISODateString;
    contentRating: {
      ageRating: StoryAgeRating;
      violenceLevel: StoryViolenceLevel;
      contentWarnings: string[];
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
    imageIds: string[];
    totalImages: number;
    featuredImageId?: string;
  };
  stats: {
    totalPlayers: number;
    averageRating: number;
    totalRatings: number;
    averagePlaytime: number;
    estimatedDuration?: string;
    totalEndings: number;
    totalChoices: number;
  };
  content: { startingNodeId?: string };
  moderation: {
    status: StoryModerationStatus;
    reportCount: number;
    moderatedBy?: ObjectId;
    moderatedAt?: ISODateString;
  };
  deletedAt?: ISODateString;
  deletedBy?: ObjectId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// Genres (from Genre.ts)
export interface Genre {
  id: ObjectId;
  slug: string;
  name: string;
  description: string;
  storyCount: number;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// Achievements (from Achievement.ts)
export type AchievementCategory = 'story' | 'social' | 'special' | 'milestone';
export type AchievementType = 'automatic' | 'conditional' | 'hidden';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: ObjectId;
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  type: AchievementType;
  conditions: {
    storiesCompleted?: number;
    storiesInGenre?: { genre: string; count: number };
    specificStoryId?: string;
    allEndingsInStory?: string;
    reviewsWritten?: number;
    totalPlaytime?: number;
    creditsSpent?: number;
    loginStreak?: number;
  };
  rewards: {
    creditBonus?: number;
    maxCreditIncrease?: number;
    avatarUnlocks?: string[];
  };
  rarity: AchievementRarity;
  isActive: boolean;
  sortOrder: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// Reviews (from Review.ts)
export type ReviewModerationStatus = 'approved' | 'pending' | 'rejected' | 'flagged';
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: ObjectId;
  userId: ObjectId;
  storyId: ObjectId;
  rating: ReviewRating;
  reviewText: string;
  upVotes: number;
  downVotes: number;
  isSpoiler: boolean;
  adminReply?: {
    text?: string;
    adminId?: ObjectId;
    repliedAt?: ISODateString;
  };
  moderation: {
    status: ReviewModerationStatus;
    flaggedCount: number;
    moderatedBy?: ObjectId;
    moderatedAt?: ISODateString;
    reason?: string;
  };
  deletedAt?: ISODateString;
  deletedBy?: ObjectId;
  deleteReason?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// Flags (from StoryFlag.ts / ReviewFlag.ts)
export type StoryFlagReason =
  | 'inappropriate_content'
  | 'copyright'
  | 'malware'
  | 'spam'
  | 'misinformation'
  | 'other';
export type StoryFlagStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export type ReviewFlagReason = 'spam' | 'harassment' | 'offensive' | 'spoiler' | 'other';
export type ReviewFlagStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

// Analytics events (from Analytics.ts)
export type AnalyticsEventType =
  | 'story_start'
  | 'story_complete'
  | 'choice'
  | 'achievement_unlock'
  | 'story_view'
  | 'user_action'
  | 'story_abandon'
  | 'node_view'
  | 'level_up'
  | 'user_register'
  | 'user_login'
  | 'user_logout'
  | 'profile_update'
  | 'app_start'
  | 'feature_usage'
  | 'error_occurred'
  | 'performance_issue';
```

## 6. Endpoints

### 6.1 Authentication

#### POST `/api/auth/login`

**Auth**: none

**Request Body**
```ts
export interface AdminLoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

**Response 200**
```ts
export type AdminLoginResponse = ApiResponse<{
  admin: AdminAccountPublic;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresInSeconds: number;
  };
}>;
```

**Errors**
- `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`, `ACCOUNT_NOT_VERIFIED`

---

#### POST `/api/auth/logout`

**Auth**: admin access token

**Response 200**
```ts
export type AdminLogoutResponse = ApiResponse<{ message: string }>;
```

---

#### POST `/api/auth/refresh`

**Auth**: none

**Request Body**
```ts
export interface AdminRefreshRequest {
  refreshToken: string;
}
```

**Response 200**
```ts
export type AdminRefreshResponse = ApiResponse<{
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresInSeconds: number;
  };
}>;
```

---

#### GET `/api/auth/me`

**Auth**: admin access token

**Response 200**
```ts
export type AdminMeResponse = ApiResponse<AdminAccountPublic>;
```

---

#### POST `/api/auth/forgot-password`

**Auth**: none

**Request Body**
```ts
export interface AdminForgotPasswordRequest {
  email: string;
}
```

**Response 200**
```ts
export type AdminForgotPasswordResponse = ApiResponse<{
  email: string;
  otpExpiresAt: ISODateString;
  resendCooldownSeconds: number;
}>;
```

---

#### POST `/api/auth/verify-otp`

**Auth**: none

**Request Body**
```ts
export interface AdminVerifyOtpRequest {
  email: string;
  otp: string; // 6 digits
}
```

**Response 200**
```ts
export type AdminVerifyOtpResponse = ApiResponse<{
  resetToken: string;
  expiresAt: ISODateString;
}>;
```

---

#### POST `/api/auth/reset-password`

**Auth**: none

**Request Body**
```ts
export interface AdminResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}
```

**Response 200**
```ts
export type AdminResetPasswordResponse = ApiResponse<{ message: string }>;
```

### 6.2 Dashboard Analytics

#### GET `/api/analytics/dashboard`

**Auth**: admin access token

**Query**
```ts
export interface DashboardQuery {
  period?: '7d' | '30d' | '90d' | '1y';
  compare?: boolean;
}
```

**Response 200** (derived from `Analytics`, `User`, `Story`, `Review`, `CreditTransaction`)
```ts
export type DashboardResponse = ApiResponse<{
  overview: {
    registeredUsers: number;
    dailyActiveUsers: number;
    storyPlaysToday: number;
    creditsConsumedToday: number;
    ratingsToday: number;
    systemErrors: number;
  };
  charts: {
    dailyStats: Array<{
      date: string; // YYYY-MM-DD
      activeUsers: number;
      storyPlays: number;
      creditsUsed: number;
    }>;
  };
}>;
```

### 6.3 User Management

#### GET `/api/users`

**Auth**: admin access token

**Query**
```ts
export interface ListUsersQuery {
  search?: string; // username, email, displayName
  type?: 'all' | 'guest' | 'registered';
  status?: 'all' | UserAccountStatus;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'credits' | 'storiesPlayed' | 'username';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

**Response 200**
```ts
export type ListUsersResponse = ApiPaginatedResponse<AdminUser>;
```

---

#### GET `/api/users/:id`

**Auth**: admin access token

**Response 200**
```ts
export type GetUserResponse = ApiResponse<AdminUser>;
```

**Errors**
- `NOT_FOUND`

---

#### GET `/api/users/:id/activity-history`

**Auth**: admin access token

**Query**
```ts
export interface UserActivityQuery {
  page?: number;
  limit?: number;
}
```

**Response 200** (derived)
```ts
export type UserActivityHistoryResponse = ApiPaginatedResponse<{
  type: 'session' | 'analytics' | 'credit_transaction';
  timestamp: ISODateString;
  details: Record<string, unknown>;
}>;
```

---

#### GET `/api/users/:id/story-progress`

**Auth**: admin access token

**Query**
```ts
export interface UserStoryProgressQuery {
  page?: number;
  limit?: number;
}
```

**Response 200** (from `UserStoryProgress`)
```ts
export type UserStoryProgressResponse = ApiPaginatedResponse<{
  storyId: ObjectId;
  playthroughId: string;
  currentNodeId: string;
  hasCompleted: boolean;
  completedAt?: ISODateString;
  endingData?: {
    endingId?: string;
    endingTitle?: string;
    endingType?: 'good' | 'bad' | 'neutral' | 'secret';
    isRare?: boolean;
  };
  lastPlayedAt: ISODateString;
  timeSpent: number;
  creditsSpent: number;
  nodesVisited: number;
  choicesMade: number;
}>;
```

### 6.4 Story Management

#### GET `/api/stories`

**Auth**: admin access token

**Query**
```ts
export interface ListStoriesQuery {
  search?: string;
  genre?: string;
  author?: string;
  status?: 'all' | 'published' | 'draft';
  moderationStatus?: 'all' | StoryModerationStatus;
  page?: number;
  limit?: number;
}
```

**Response 200**
```ts
export type ListStoriesResponse = ApiPaginatedResponse<AdminStory>;
```

### 6.5 Achievement Management

#### GET `/api/achievements`

**Auth**: admin access token

**Query**
```ts
export interface ListAchievementsQuery {
  category?: AchievementCategory;
  type?: AchievementType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
```

**Response 200**
```ts
export type ListAchievementsResponse = ApiPaginatedResponse<Achievement>;
```

### 6.6 Genre Management

#### GET `/api/genres`

**Auth**: admin access token

**Response 200**
```ts
export type ListGenresResponse = ApiResponse<Genre[]>;
```

---

#### POST `/api/genres`

**Auth**: admin access token

**Request Body**
```ts
export interface CreateGenreRequest {
  slug: string;
  name: string;
  description: string;
  icon?: string;
  color?: string; // e.g. "#FFAA00"
  isActive?: boolean;
  sortOrder?: number;
}
```

**Response 200**
```ts
export type CreateGenreResponse = ApiResponse<Genre>;
```

---

#### PUT `/api/genres/:id`

**Auth**: admin access token

**Request Body**
```ts
export type UpdateGenreRequest = Partial<CreateGenreRequest>;
```

**Response 200**
```ts
export type UpdateGenreResponse = ApiResponse<Genre>;
```

---

#### DELETE `/api/genres/:id`

**Auth**: admin access token

**Response 200**
```ts
export type DeleteGenreResponse = ApiResponse<{ deleted: true }>;
```

### 6.7 Review & Moderation

#### GET `/api/reviews`

**Auth**: admin access token

**Query**
```ts
export interface ListReviewsQuery {
  storyId?: ObjectId;
  userId?: ObjectId;
  moderationStatus?: 'all' | ReviewModerationStatus;
  page?: number;
  limit?: number;
}
```

**Response 200**
```ts
export type ListReviewsResponse = ApiPaginatedResponse<Review>;
```

---

#### GET `/api/reports`

Returns story and review reports (flags).

**Auth**: admin access token

**Query**
```ts
export interface ListReportsQuery {
  type?: 'all' | 'story' | 'review';
  status?: 'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  page?: number;
  limit?: number;
}
```

**Response 200**
```ts
export type ListReportsResponse = ApiPaginatedResponse<
  | {
      type: 'story';
      reportId: ObjectId;
      storyId: ObjectId;
      userId: ObjectId;
      reason: StoryFlagReason;
      status: StoryFlagStatus;
      createdAt: ISODateString;
    }
  | {
      type: 'review';
      reportId: ObjectId;
      reviewId: ObjectId;
      userId: ObjectId;
      reason: ReviewFlagReason;
      status: ReviewFlagStatus;
      createdAt: ISODateString;
    }
>;
```

### 6.8 Analytics & Export

#### GET `/api/analytics/export`

**Auth**: admin access token

**Query**
```ts
export interface AnalyticsExportQuery {
  from: ISODateString;
  to: ISODateString;
  format?: 'csv' | 'json';
  eventType?: AnalyticsEventType;
}
```

**Response 200**
```ts
export type AnalyticsExportResponse = ApiResponse<{
  format: 'csv' | 'json';
  downloadUrl: string;
  expiresAt: ISODateString;
}>;
```

### 6.9 System Configuration

#### GET `/api/config`

**Auth**: admin access token

**Query**
```ts
export interface ListConfigQuery {
  category?: 'game' | 'security' | 'payment' | 'feature' | 'ui';
  isPublic?: boolean;
}
```

**Response 200**
```ts
export type ListConfigResponse = ApiResponse<Array<{
  id: ObjectId;
  key: string;
  value: unknown;
  description: string;
  category: 'game' | 'security' | 'payment' | 'feature' | 'ui';
  isPublic: boolean;
  lastModifiedBy?: ObjectId;
  lastModifiedAt?: ISODateString;
  version: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}>>;
```

---

#### PUT `/api/config`

Updates one configuration entry by key.

**Auth**: admin access token

**Request Body**
```ts
export interface UpdateConfigRequest {
  key: string;
  value: unknown;
  description?: string;
  isPublic?: boolean;
  category?: 'game' | 'security' | 'payment' | 'feature' | 'ui';
}
```

**Response 200**
```ts
export type UpdateConfigResponse = ApiResponse<{ updated: true }>;
```

### 6.10 Admin Accounts

#### GET `/api/accounts`

**Auth**: admin access token

**Query**
```ts
export interface ListAdminAccountsQuery {
  role?: AdminRole;
  status?: AdminStatus;
  page?: number;
  limit?: number;
}
```

**Response 200**
```ts
export type ListAdminAccountsResponse = ApiPaginatedResponse<AdminAccountPublic>;
```

---

#### POST `/api/accounts`

**Auth**: admin access token

**Request Body**
```ts
export interface CreateAdminAccountRequest {
  username: string;
  email: string;
  password?: string;
  role: AdminRole;
  permissions: string[];
  profile: {
    displayName: string;
    avatar: { type: AdminAvatarType; value?: string };
    bio?: string;
  };
}
```

**Response 200**
```ts
export type CreateAdminAccountResponse = ApiResponse<AdminAccountPublic>;
```

---

#### GET `/api/accounts/:id`

**Auth**: admin access token

**Response 200**
```ts
export type GetAdminAccountResponse = ApiResponse<AdminAccountPublic>;
```

---

#### PUT `/api/accounts/:id`

**Auth**: admin access token

**Request Body**
```ts
export type UpdateAdminAccountRequest = Partial<CreateAdminAccountRequest> & {
  status?: AdminStatus;
};
```

**Response 200**
```ts
export type UpdateAdminAccountResponse = ApiResponse<AdminAccountPublic>;
```

---

#### DELETE `/api/accounts/:id`

**Auth**: admin access token

**Response 200**
```ts
export type DeleteAdminAccountResponse = ApiResponse<{ deleted: true }>;
```

---

#### GET `/api/accounts/permissions`

**Auth**: admin access token

**Response 200**
```ts
export type ListPermissionsResponse = ApiResponse<{
  permissions: string[];
}>;
```

### 6.11 Health

#### GET `/api/health`

**Auth**: none

**Response 200/503** (raw payload, no envelope)
```ts
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  service?: 'admin-api';
  timestamp?: ISODateString;
  uptime?: number;
  database: {
    status: 'connected' | 'disconnected' | 'error';
    error?: string;
  };
}
```
