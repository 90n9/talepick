# TalePick Frontend API Specification

> **Version**: 1.0.0  
> **Base URL**: `https://www.talepick.com`  
> **API Prefix**: `/api`  
> **Updated**: 2025-12-13

## 1. Scope

This document defines the request/response contract for the user-facing (frontend) HTTP API. It is written to be machine-checkable (AI) and focuses on input/output shapes, types, and error semantics.

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

- **User access token**: short-lived JWT used in `Authorization` header.
- **Refresh token**: long-lived token used only with `/api/auth/refresh`.
- **Guest users**: treated as regular users with `authentication.isGuest = true` and an auto-generated `email`/`username` to satisfy DB constraints.
- **Separation**: user tokens and admin tokens are signed with different keys and must not be accepted across apps.

## 5. Data Models (DB-aligned)

Schemas below align with `/packages/backend/src/infrastructure/models/*` unless marked as a derived DTO.

```ts
// User (from User.ts)
export type UserAuthMethod = 'email' | 'google' | 'guest';
export type UserAvatarType = 'default' | 'custom' | 'google';
export type UserAccountStatus = 'active' | 'suspended' | 'banned' | 'under_review' | 'locked';
export type UserLockType = 'manual' | 'auto_security' | 'auto_fraud';

export interface UserProfile {
  displayName: string;
  avatar: { type: UserAvatarType; value: string };
  bio?: string;
  profileImageUrl?: string;
}

export interface UserAuthentication {
  authMethod: UserAuthMethod;
  isGuest: boolean;
  emailVerified: boolean;
  hasPassword: boolean;
}

export interface UserAccountStatusInfo {
  status: UserAccountStatus;
  reason?: string;
  moderatedBy?: ObjectId;
  moderatedAt?: ISODateString;
  suspensionEndsAt?: ISODateString;
  lockType?: UserLockType;
  lockExpiresAt?: ISODateString;
}

export interface UserGameStats {
  credits: number;
  maxCredits: number;
  lastCreditRefill: ISODateString;
  totalStoriesPlayed: number;
  totalEndingsUnlocked: number;
  totalAvatarsUnlocked: number;
  currentAvatarId?: string;
  createdAt: ISODateString;
  lastLoginAt?: ISODateString;
}

export interface UserPublic {
  id: ObjectId;
  email: string;
  username: string;
  profile: UserProfile;
  authentication: UserAuthentication;
  gameStats: UserGameStats;
  accountStatus: UserAccountStatusInfo;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// Auth DTOs (derived)
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface AuthSession {
  tokens: AuthTokens;
  user: UserPublic;
}

// Story (from Story.ts)
export type StoryModerationStatus = 'approved' | 'pending' | 'suspended' | 'removed';
export type StoryViolenceLevel = 'none' | 'mild' | 'moderate' | 'high';
export type StoryAgeRating = 0 | 13 | 16 | 18;

export interface StoryContentRating {
  ageRating: StoryAgeRating;
  violenceLevel: StoryViolenceLevel;
  contentWarnings: string[];
}

export interface StoryMetadata {
  genre: string; // references Genre.slug
  tags: string[];
  author: string;
  createdAt: ISODateString;
  publishedAt?: ISODateString;
  isPublished: boolean;
  isComingSoon: boolean;
  launchDate?: ISODateString;
  contentRating: StoryContentRating;
}

export interface StoryMedia {
  coverImageAssetId?: string;
  headerImageAssetId?: string;
  coverVideoAssetId?: string;
  bgMusicAssetId?: string;
  coverImageUrl?: string;
  headerImageUrl?: string;
  coverVideoUrl?: string;
  bgMusicUrl?: string;
  trailerUrl?: string;
}

export interface StoryGalleryRef {
  imageIds: string[]; // references StoryGallery.galleryImageId
  totalImages: number;
  featuredImageId?: string;
}

export interface StoryStats {
  totalPlayers: number;
  averageRating: number;
  totalRatings: number;
  averagePlaytime: number;
  estimatedDuration?: string;
  totalEndings: number;
  totalChoices: number;
}

export interface StoryContent {
  startingNodeId?: string;
}

export interface StoryModeration {
  status: StoryModerationStatus;
  reportCount: number;
  moderatedBy?: ObjectId;
  moderatedAt?: ISODateString;
}

export interface StoryPublic {
  id: ObjectId;
  title: string;
  description: string;
  metadata: Pick<StoryMetadata, 'genre' | 'tags' | 'author' | 'isComingSoon' | 'launchDate'>;
  media: Pick<StoryMedia, 'coverImageUrl' | 'headerImageUrl' | 'trailerUrl'>;
  gallery: StoryGalleryRef;
  stats: Pick<
    StoryStats,
    'averageRating' | 'totalRatings' | 'totalPlayers' | 'estimatedDuration' | 'totalEndings'
  >;
}

export interface StoryDetail extends StoryPublic {
  content: StoryContent;
  moderation: Pick<StoryModeration, 'status' | 'reportCount'>;

  // Derived (user-context) fields
  isFavorite?: boolean;
  userProgress?: {
    endingsUnlocked: string[];
    lastPlayedAt?: ISODateString;
  };
}

// Story graph (from StoryNode.ts) (derived DTO)
export type StoryNodeSegmentType = 'text' | 'image' | 'video';
export type StoryEndingType = 'good' | 'bad' | 'neutral' | 'secret';

export interface StoryNodeSegment {
  type: StoryNodeSegmentType;
  url?: string;
  text?: string;
  duration?: number;
}

export interface StoryNodeChoice {
  id: string;
  text: string;
  nextNodeId?: string;
  requirements?: {
    achievementId?: string;
    minCredits?: number;
    playedStoryId?: string;
  };
  costs?: { credits?: number };
}

export interface StoryNodePublic {
  nodeId: string;
  segments: StoryNodeSegment[];
  media: {
    bgMusicUrl?: string;
    backgroundImageUrl?: string;
  };
  choices: StoryNodeChoice[];
  rewards: {
    achievementId?: string;
    credits?: number;
    avatarIds?: string[];
  };
  isEnding: boolean;
  endingData?: {
    title?: string;
    description?: string;
    type?: StoryEndingType;
    isSecret?: boolean;
    isRare?: boolean;
  };
}

// Reviews (from Review.ts)
export type ReviewModerationStatus = 'approved' | 'pending' | 'rejected' | 'flagged';
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface ReviewPublic {
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
  createdAt: ISODateString;
}

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

// Reporting (from StoryFlag.ts / ReviewFlag.ts)
export type StoryFlagReason =
  | 'inappropriate_content'
  | 'copyright'
  | 'malware'
  | 'spam'
  | 'misinformation'
  | 'other';
export type ReviewFlagReason = 'spam' | 'harassment' | 'offensive' | 'spoiler' | 'other';

// Achievements (from Achievement.ts / UserAchievement.ts)
export type AchievementCategory = 'story' | 'social' | 'special' | 'milestone';
export type AchievementType = 'automatic' | 'conditional' | 'hidden';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface UserAchievement {
  id: ObjectId;
  achievementId: string;
  unlockedAt: ISODateString;
  unlockSource: {
    type: 'story_completion' | 'automatic' | 'event' | 'admin_grant';
    sourceId?: string;
    sourceName?: string;
    details?: string;
  };
  category: AchievementCategory;
  rarity: AchievementRarity;
  pointsAwarded: number;
  title: string;
  description: string;
  icon: string;
}

// Credits (from User.gameStats + CreditTransaction.ts) (derived DTO)
export interface CreditBalance {
  credits: number;
  maxCredits: number;
  lastCreditRefill: ISODateString;
  refillIntervalMs: number;
}

export type CreditTransactionSource =
  | 'choice'
  | 'review'
  | 'achievement'
  | 'refill'
  | 'purchase';
```

## 6. Endpoints

### 6.1 Authentication

#### POST `/api/auth/login`

**Auth**: none

**Request Body**
```ts
export interface AuthLoginRequest {
  email: string;
  password: string;
}
```

**Response 200**
```ts
export type AuthLoginResponse = ApiResponse<AuthSession>;
```

**Errors**
- `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`, `ACCOUNT_NOT_VERIFIED`

---

#### POST `/api/auth/login/google`

**Auth**: none

**Request Body**
```ts
export interface AuthGoogleLoginRequest {
  idToken: string;
}
```

**Response 200**
```ts
export type AuthGoogleLoginResponse = ApiResponse<AuthSession>;
```

**Errors**
- `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`

---

#### POST `/api/auth/guest`

**Auth**: none

**Request Body**
```ts
export interface AuthGuestRequest {
  locale?: string; // e.g. "th-TH"
}
```

**Response 200**
```ts
export type AuthGuestResponse = ApiResponse<AuthSession>;
```

---

#### POST `/api/auth/signup`

Creates a registration OTP (`OtpCode.type = "registration"`). User is created only after OTP verification.

**Auth**: none

**Request Body**
```ts
export interface AuthSignupRequest {
  email: string;
  password: string;
  username: string;
  displayName: string;
}
```

**Response 200**
```ts
export interface AuthOtpIssued {
  email: string;
  otpExpiresAt: ISODateString;
  resendCooldownSeconds: number;
}

export type AuthSignupResponse = ApiResponse<AuthOtpIssued>;
```

**Errors**
- `VALIDATION_ERROR`, `CONFLICT`, `RATE_LIMIT_EXCEEDED`

---

#### POST `/api/auth/signup/verify-otp`

Verifies registration OTP and returns a logged-in session.

**Auth**: none

**Request Body**
```ts
export interface AuthVerifyOtpRequest {
  email: string;
  otp: string; // 6 digits
}
```

**Response 200**
```ts
export type AuthVerifyOtpResponse = ApiResponse<AuthSession>;
```

**Errors**
- `VALIDATION_ERROR`, `BAD_REQUEST`, `RATE_LIMIT_EXCEEDED`

---

#### POST `/api/auth/signup/resend-otp`

**Auth**: none

**Request Body**
```ts
export interface AuthResendOtpRequest {
  email: string;
}
```

**Response 200**
```ts
export type AuthResendOtpResponse = ApiResponse<AuthOtpIssued>;
```

**Errors**
- `VALIDATION_ERROR`, `RATE_LIMIT_EXCEEDED`

---

#### POST `/api/auth/password/forgot`

Creates a password reset OTP (`OtpCode.type = "password_reset"`).

**Auth**: none

**Request Body**
```ts
export interface AuthForgotPasswordRequest {
  email: string;
}
```

**Response 200**
```ts
export type AuthForgotPasswordResponse = ApiResponse<AuthOtpIssued>;
```

---

#### POST `/api/auth/password/verify-otp`

Verifies password reset OTP and issues a short-lived reset token.

**Auth**: none

**Request Body**
```ts
export interface AuthVerifyPasswordOtpRequest {
  email: string;
  otp: string; // 6 digits
}
```

**Response 200**
```ts
export interface PasswordResetToken {
  resetToken: string;
  expiresAt: ISODateString;
}

export type AuthVerifyPasswordOtpResponse = ApiResponse<PasswordResetToken>;
```

---

#### POST `/api/auth/password/reset`

Resets password and returns a new logged-in session.

**Auth**: none

**Request Body**
```ts
export interface AuthPasswordResetRequest {
  resetToken: string;
  newPassword: string;
}
```

**Response 200**
```ts
export type AuthPasswordResetResponse = ApiResponse<AuthSession>;
```

**Errors**
- `VALIDATION_ERROR`, `BAD_REQUEST`

---

#### POST `/api/auth/refresh`

**Auth**: none

**Request Body**
```ts
export interface AuthRefreshRequest {
  refreshToken: string;
}
```

**Response 200**
```ts
export type AuthRefreshResponse = ApiResponse<{
  tokens: AuthTokens;
}>;
```

**Errors**
- `VALIDATION_ERROR`, `TOKEN_INVALID`, `TOKEN_EXPIRED`

### 6.2 User

#### GET `/api/users/me`

**Auth**: user access token

**Response 200**
```ts
export type GetMeResponse = ApiResponse<UserPublic>;
```

**Errors**
- `UNAUTHORIZED`, `TOKEN_INVALID`, `TOKEN_EXPIRED`

---

#### PATCH `/api/users/me`

**Auth**: user access token

**Request Body**
```ts
export interface UpdateMeRequest {
  profile?: Partial<Pick<UserProfile, 'displayName' | 'avatar' | 'bio'>>;
}
```

**Response 200**
```ts
export type UpdateMeResponse = ApiResponse<UserPublic>;
```

---

#### POST `/api/users/me/password`

**Auth**: user access token

**Request Body**
```ts
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

**Response 200**
```ts
export type ChangePasswordResponse = ApiResponse<{ message: string }>;
```

---

#### GET `/api/users/me/history`

**Auth**: user access token

**Query**
```ts
export interface UserHistoryQuery {
  page?: number;
  limit?: number;
}
```

**Response 200** (derived from `UserStoryProgress` + `Story`)
```ts
export interface UserHistoryItem {
  storyId: ObjectId;
  storyTitle: string;
  coverImageUrl?: string;
  genre: string;
  estimatedDuration?: string;
  endingId?: string;
  endingTitle?: string;
  endingType?: StoryEndingType;
  playedAt: ISODateString;
}

export type UserHistoryResponse = ApiPaginatedResponse<UserHistoryItem>;
```

---

#### GET `/api/users/me/achievements`

**Auth**: user access token

**Response 200**
```ts
export type UserAchievementsResponse = ApiResponse<{
  items: UserAchievement[];
  unlockedIds: string[];
}>;
```

---

#### POST `/api/users/me/favorites`

**Auth**: user access token

**Request Body**
```ts
export interface UpdateFavoriteRequest {
  storyId: ObjectId;
  action: 'add' | 'remove';
}
```

**Response 200**
```ts
export type UpdateFavoriteResponse = ApiResponse<{
  favorites: ObjectId[];
}>;
```

---

#### GET `/api/users/me/credits`

**Auth**: user access token

**Response 200**
```ts
export type GetCreditsResponse = ApiResponse<CreditBalance>;
```

---

#### POST `/api/users/me/credits/deduct`

**Auth**: user access token

**Request Body**
```ts
export interface DeductCreditsRequest {
  storyId: ObjectId;
  sessionId?: string;
  source: CreditTransactionSource;
}
```

**Response 200**
```ts
export type DeductCreditsResponse = ApiResponse<CreditBalance & { allowed: true }>;
```

**Errors**
- `BAD_REQUEST` (e.g. insufficient credits), `UNAUTHORIZED`, `TOKEN_INVALID`, `TOKEN_EXPIRED`

### 6.3 Stories

#### GET `/api/stories`

**Auth**: optional (adds user-context fields when authenticated)

**Query**
```ts
export interface ListStoriesQuery {
  search?: string;
  genre?: string; // Genre.slug
  onlyFavorites?: boolean;
  page?: number;
  limit?: number;
}
```

**Response 200**
```ts
export type ListStoriesResponse = ApiPaginatedResponse<StoryPublic & { isFavorite?: boolean }>;
```

---

#### GET `/api/stories/:id`

**Auth**: optional (adds user-context fields when authenticated)

**Response 200**
```ts
export type GetStoryResponse = ApiResponse<StoryDetail>;
```

**Errors**
- `NOT_FOUND`

---

#### GET `/api/stories/:id/endings`

**Auth**: optional (adds `unlocked` when authenticated)

**Response 200** (derived from `StoryNode.getStoryEndings`)
```ts
export interface StoryEndingSummary {
  nodeId: string;
  title?: string;
  type?: StoryEndingType;
  isSecret?: boolean;
  isRare?: boolean;
  unlocked?: boolean;
}

export type GetStoryEndingsResponse = ApiResponse<{
  endings: StoryEndingSummary[];
  total: number;
  unlockedCount?: number;
}>;
```

---

#### GET `/api/stories/:id/graph`

**Auth**: user access token

**Response 200**
```ts
export type GetStoryGraphResponse = ApiResponse<{
  startNodeId: string;
  nodes: Record<string, StoryNodePublic>;
}>;
```

---

#### POST `/api/stories/:id/session`

Creates or resumes a playthrough (`UserStoryProgress.playthroughId`).

**Auth**: user access token

**Request Body**
```ts
export interface StartStorySessionRequest {
  playthroughType?: 'normal' | 'speedrun' | 'completionist';
}
```

**Response 200**
```ts
export interface StorySessionState {
  storyId: ObjectId;
  sessionId: string; // maps to UserStoryProgress.playthroughId
  currentNodeId: string;
  hasCompleted: boolean;
  lastPlayedAt: ISODateString;
  choicesMade: number;
  nodesVisited: number;
}

export type StartStorySessionResponse = ApiResponse<StorySessionState>;
```

---

#### POST `/api/stories/:id/session/:sessionId/choice`

**Auth**: user access token

**Request Body**
```ts
export interface MakeChoiceRequest {
  nodeId: string;
  choiceId: string;
  choiceText: string;
  timeSpentMs?: number;
}
```

**Response 200**
```ts
export type MakeChoiceResponse = ApiResponse<StorySessionState & {
  nextNodeId: string;
}>;
```

---

#### POST `/api/stories/:id/session/:sessionId/complete`

**Auth**: user access token

**Request Body**
```ts
export interface CompleteStoryRequest {
  endingId: string;
  history?: Array<{ nodeId: string; choiceId: string }>;
  isRare?: boolean;
}
```

**Response 200**
```ts
export type CompleteStoryResponse = ApiResponse<{
  endingId: string;
  rewards: {
    creditsAwarded: number;
    achievementsUnlocked: string[];
    avatarsUnlocked: string[];
  };
  userProgress: {
    endingsUnlocked: string[];
    endingsCount: number;
    totalEndings: number;
  };
  nextSuggestedStories: ObjectId[];
}>;
```

### 6.4 Reviews & Reporting

#### GET `/api/stories/:id/reviews`

**Auth**: optional

**Query**
```ts
export interface ListStoryReviewsQuery {
  page?: number;
  limit?: number;
}
```

**Response 200**
```ts
export type ListStoryReviewsResponse = ApiResponse<{
  items: ReviewPublic[];
  meta: ApiPaginationMeta;
  summary: ReviewSummary;
}>;
```

---

#### POST `/api/stories/:id/reviews`

**Auth**: user access token

**Request Body**
```ts
export interface CreateReviewRequest {
  rating: ReviewRating;
  reviewText: string;
  isSpoiler?: boolean;
}
```

**Response 200**
```ts
export type CreateReviewResponse = ApiResponse<{
  reviewId: ObjectId;
  bonus?: { creditsAwarded?: number; achievementUnlocked?: string };
  summary: Pick<ReviewSummary, 'average' | 'total'>;
  user: { gameStats: Pick<UserGameStats, 'credits' | 'maxCredits'> };
}>;
```

---

#### POST `/api/stories/:id/report`

Creates a story flag (`StoryFlag`).

**Auth**: user access token

**Request Body**
```ts
export interface ReportStoryRequest {
  reason: StoryFlagReason;
  detail?: string;
}
```

**Response 200**
```ts
export type ReportStoryResponse = ApiResponse<{
  reportId: ObjectId;
  status: 'pending';
}>;
```

---

#### POST `/api/reviews/:reviewId/report`

Creates a review flag (`ReviewFlag`).

**Auth**: user access token

**Request Body**
```ts
export interface ReportReviewRequest {
  reason: ReviewFlagReason;
  detail?: string;
}
```

**Response 200**
```ts
export type ReportReviewResponse = ApiResponse<{
  reportId: ObjectId;
  status: 'pending';
}>;
```

---

#### GET `/api/reviews/highlight`

**Auth**: optional

**Query**
```ts
export interface HighlightReviewsQuery {
  limit?: number; // default: 12
}
```

**Response 200** (derived lightweight cards)
```ts
export interface HighlightReviewCard {
  id: ObjectId;
  userId: ObjectId;
  userDisplayName: string;
  userAvatar: { type: UserAvatarType; value: string };
  rating: ReviewRating;
  reviewText: string;
  createdAt: ISODateString;
  adminReply?: {
    text?: string;
    adminId?: ObjectId;
    adminDisplayName?: string;
    adminAvatar?: { type: UserAvatarType; value: string };
    repliedAt?: ISODateString;
  };
}

export type HighlightReviewsResponse = ApiResponse<HighlightReviewCard[]>;
```

### 6.5 Oracle

#### POST `/api/oracle/recommendation`

**Auth**: optional

**Request Body**
```ts
export interface OracleRecommendationRequest {
  mood: string;
  storyIds: ObjectId[];
}
```

**Response 200**
```ts
export type OracleRecommendationResponse = ApiResponse<{
  message: string;
  suggestedStoryId?: ObjectId;
}>;
```

### 6.6 App Config

#### GET `/api/config/app`

Returns public configuration entries (`SystemConfig.isPublic = true`).

**Auth**: none

**Response 200**
```ts
export type PublicConfigCategory = 'game' | 'security' | 'payment' | 'feature' | 'ui';

export type PublicConfigEntry = {
  key: string;
  value: unknown;
  description: string;
  category: PublicConfigCategory;
};

export type GetAppConfigResponse = ApiResponse<{
  configs: PublicConfigEntry[];
}>;
```

### 6.7 Health

#### GET `/api/health`

**Auth**: none

**Response 200/503** (raw payload, no envelope)
```ts
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp?: ISODateString;
  uptime?: number;
  database: {
    status: 'connected' | 'disconnected' | 'error';
    error?: string;
  };
}
```
