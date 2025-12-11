# TalePick Folder Structure Design

> **Next.js 16 Monorepo** • Clean Architecture • Shared API Layer • MongoDB • 2025

---

## 📁 Root Directory Structure

```
talepick/
├── 📄 README.md
├── 📄 docker-compose.yml
├── 📄 package.json
├── 📄 tsconfig.json (root)
├── 📄 .gitignore
├── 📄 .env.example
├── 📄 FOLDER_STRUCTURE.md
├── 📄 PROJECT_ROADMAP.md
├── 📄 database-design-final.md
│
├── 📂 apps/                    # Next.js applications
│   ├── 📂 frontend/            # Main user application (port 3000)
│   └── 📂 admin/               # Admin dashboard (port 3001)
│
├── 📂 packages/                # Shared packages (Clean Architecture layers)
│   ├── 📂 domain/              # Domain layer (Entities, Use Cases)
│   ├── 📂 application/         # Application layer (Use Case implementations)
│   ├── 📂 infrastructure/      # Infrastructure layer (Database, External APIs)
│   ├── 📂 presentation/        # Presentation layer (API Controllers, DTOs)
│   ├── 📂 shared/              # Shared utilities and types
│   └── 📂 testing/             # Testing utilities and mocks
│
├── 📂 docs/                    # Documentation
│   ├── 📂 api/                 # API documentation
│   ├── 📂 deployment/          # Deployment guides
│   └── 📂 development/         # Development guides
│
├── 📂 scripts/                 # Build and deployment scripts
│   ├── 📄 setup.sh
│   ├── 📄 deploy.sh
│   └── 📄 seed-db.js
│
├── 📂 .github/                 # GitHub workflows
│   └── 📂 workflows/
│
└── 📂 tools/                   # Development tools and generators
    └── 📄 create-model.js
```

---

## 🏗️ Clean Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │   Frontend      │    │     Admin       │                 │
│  │   (Next.js)     │    │   (Next.js)     │                 │
│  └─────────────────┘    └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER (Packages)                 │
│  • API Controllers (/packages/presentation/controllers)       │
│  • DTOs (/packages/presentation/dtos)                       │
│  • API Middleware (/packages/presentation/middleware)        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                            │
│  • Use Cases (/packages/application/use-cases)               │
│  • Application Services (/packages/application/services)       │
│  • Interfaces (/packages/application/interfaces)              │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                              │
│  • Entities (/packages/domain/entities)                     │
│  • Value Objects (/packages/domain/value-objects)           │
│  • Repository Interfaces (/packages/domain/repositories)     │
│  • Domain Services (/packages/domain/services)               │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                         │
│  • Database (/packages/infrastructure/database)               │
│  • External APIs (/packages/infrastructure/external)          │
│  • Email (/packages/infrastructure/email)                    │
│  • Storage (/packages/infrastructure/storage)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Apps Structure

### Frontend App (`/apps/frontend/`)

```
apps/frontend/
├── 📄 next.config.js
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 tailwind.config.ts
├── 📄 .env.local.example
├── 📄 .gitignore
│
├── 📂 public/                  # Static assets
│   ├── 📂 images/
│   ├── 📂 icons/
│   └── 📄 favicon.ico
│
├── 📂 app/                     # Next.js App Router
│   ├── 📄 layout.tsx           # Root layout
│   ├── 📄 page.tsx             # Home page
│   ├── 📄 globals.css
│   ├── 📄 loading.tsx
│   ├── 📄 error.tsx
│   ├── 📄 not-found.tsx
│   │
│   ├── 📂 (auth)/              # Authentication routes group
│   │   ├── 📂 login/
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 signup/
│   │   │   └── 📄 page.tsx
│   │   └── 📂 forgot-password/
│   │       └── 📄 page.tsx
│   │
│   ├── 📂 (story)/             # Story routes group
│   │   ├── 📂 library/
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 [id]/
│   │   │   └── 📄 page.tsx
│   │   └── 📂 play/
│   │       └── 📄 [id]/
│   │           └── 📄 page.tsx
│   │
│   ├── 📂 profile/
│   │   └── 📄 page.tsx
│   ├── 📂 support/
│   │   └── 📄 page.tsx
│   ├── 📂 oracle/
│   │   └── 📄 page.tsx
│   │
│   ├── 📂 lib/                  # App-specific libraries
│   │   ├── 📄 auth-context.tsx
│   │   ├── 📄 constants.ts
│   │   ├── 📄 data.ts
│   │   └── 📄 client.ts
│   │
│   ├── 📂 ui/                   # Reusable UI components
│   │   ├── 📂 components/
│   │   │   ├── 📄 Button.tsx
│   │   │   ├── 📄 Card.tsx
│   │   │   ├── 📄 Modal.tsx
│   │   │   ├── 📄 StoryCard.tsx
│   │   │   └── 📄 Player.tsx
│   │   ├── 📄 layout.tsx
│   │   └── 📄 globals.css
│   │
│   └── 📂 api/                  # Frontend API routes
│       ├── 📂 auth/
│       │   ├── 📄 register/route.ts
│       │   ├── 📄 login/route.ts
│       │   ├── 📄 logout/route.ts
│       │   └── 📄 verify-otp/route.ts
│       ├── 📂 stories/
│       │   ├── 📄 route.ts
│       │   └── 📂 [id]/
│       │       ├── 📄 route.ts
│       │       └── 📂 play/
│       │           └── 📄 route.ts
│       ├── 📂 users/
│       │   ├── 📄 profile/route.ts
│       │   └── 📄 favorites/route.ts
│       └── 📄 health/route.ts
│
├── 📂 test/                    # Test files
│   ├── 📄 setup.tsx
│   ├── 📄 test-utils.tsx
│   └── 📂 __mocks__/
│
└── 📂 .next/                   # Next.js build output
```

### Admin App (`/apps/admin/`)

```
apps/admin/
├── 📄 next.config.js
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 tailwind.config.ts
├── 📄 .env.local.example
├── 📄 .gitignore
│
├── 📂 public/                  # Static assets
│   └── 📂 images/
│
├── 📂 app/                     # Next.js App Router
│   ├── 📄 layout.tsx           # Admin layout
│   ├── 📄 page.tsx             # Dashboard
│   ├── 📄 globals.css
│   ├── 📄 loading.tsx
│   ├── 📄 error.tsx
│   │
│   ├── 📂 (auth)/              # Admin authentication
│   │   ├── 📂 login/
│   │   │   └── 📄 page.tsx
│   │   └── 📂 forgot-password/
│   │       └── 📄 page.tsx
│   │
│   ├── 📂 dashboard/           # Main dashboard
│   │   └── 📄 page.tsx
│   ├── 📂 users/               # User management
│   │   └── 📄 page.tsx
│   ├── 📂 stories/             # Story management
│   │   ├── 📄 page.tsx
│   │   └── 📂 editor/
│   │       └── 📄 page.tsx
│   ├── 📂 reviews/             # Review management
│   │   └── 📄 page.tsx
│   ├── 📂 analytics/           # Analytics dashboard
│   │   └── 📄 page.tsx
│   ├── 📂 settings/            # System settings
│   │   └── 📄 page.tsx
│   │
│   ├── 📂 lib/                  # Admin-specific libraries
│   │   ├── 📄 auth-context.tsx
│   │   ├── 📄 constants.ts
│   │   └── 📄 types.ts
│   │
│   ├── 📂 ui/                   # Admin UI components
│   │   ├── 📂 components/
│   │   │   ├── 📄 Sidebar.tsx
│   │   │   ├── 📄 DataTable.tsx
│   │   │   ├── 📄 Charts.tsx
│   │   │   └── 📄 Forms.tsx
│   │   └── 📄 layout.tsx
│   │
│   └── 📂 api/                  # Admin API routes
│       ├── 📂 auth/
│       │   ├── 📄 login/route.ts
│       │   └── 📄 logout/route.ts
│       ├── 📂 admin/
│       │   ├── 📄 users/route.ts
│       │   ├── 📂 stories/route.ts
│       │   ├── 📂 reviews/route.ts
│       │   └── 📂 analytics/route.ts
│       └── 📄 health/route.ts
│
└── 📂 test/                    # Test files
    └── 📄 setup.tsx
```

---

## 📦 Clean Architecture Packages Structure

### Domain Layer (`/packages/domain/`)

```typescript
packages/domain/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts                 # Main exports
│
├── 📂 entities/                # Domain entities (no external dependencies)
│   ├── 📄 User.ts
│   ├── 📄 Story.ts
│   ├── 📄 StoryNode.ts
│   ├── 📄 Achievement.ts
│   ├── 📄 Review.ts
│   ├── 📄 CreditTransaction.ts
│   └── 📄 UserSession.ts
│
├── 📂 value-objects/           # Immutable value objects
│   ├── 📄 Email.ts
│   ├── 📄 Credits.ts
│   ├── 📄 StoryRating.ts
│   ├── 📄 UserProfile.ts
│   └── 📄 AchievementProgress.ts
│
├── 📂 repositories/            # Repository interfaces (no implementation)
│   ├── 📄 IUserRepository.ts
│   ├── 📄 IStoryRepository.ts
│   ├── 📄 IAchievementRepository.ts
│   ├── 📄 IReviewRepository.ts
│   └── 📄 ICreditTransactionRepository.ts
│
├── 📂 services/                # Domain services (business logic)
│   ├── 📄 CreditService.ts
│   ├── 📄 AchievementService.ts
│   ├── 📄 StoryProgressService.ts
│   └── 📄 UserRatingService.ts
│
├── 📂 events/                  # Domain events
│   ├── 📄 UserRegisteredEvent.ts
│   ├── 📄 StoryCompletedEvent.ts
│   ├── 📄 AchievementUnlockedEvent.ts
│   └── 📄 CreditSpentEvent.ts
│
├── 📂 errors/                  # Domain-specific errors
│   ├── 📄 UserNotFoundError.ts
│   ├── 📄 InsufficientCreditsError.ts
│   ├── 📄 StoryNotFoundError.ts
│   └── 📄 AchievementNotFoundError.ts
│
└── 📂 types/                   # Domain types
    ├── 📄 user.types.ts
    ├── 📄 story.types.ts
    ├── 📄 achievement.types.ts
    └── 📄 common.types.ts
```

### Application Layer (`/packages/application/`)

```typescript
packages/application/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts
│
├── 📂 use-cases/                # User-specific use case implementations
│   ├── 📂 auth/
│   │   ├── 📄 RegisterUserUseCase.ts
│   │   ├── 📄 LoginUserUseCase.ts
│   │   ├── 📄 LogoutUserUseCase.ts
│   │   ├── 📄 VerifyOTPUseCase.ts
│   │   └── 📄 ResetPasswordUseCase.ts
│   ├── 📂 users/
│   │   ├── 📄 GetUserProfileUseCase.ts
│   │   ├── 📄 UpdateUserProfileUseCase.ts
│   │   ├── 📄 GetUserFavoritesUseCase.ts
│   │   ├── 📄 AddToFavoritesUseCase.ts
│   │   └── 📄 UpdateAvatarUseCase.ts
│   ├── 📂 stories/
│   │   ├── 📄 GetPublishedStoriesUseCase.ts
│   │   ├── 📄 GetStoryDetailUseCase.ts
│   │   ├── 📄 PlayStoryUseCase.ts
│   │   ├── 📄 MakeStoryChoiceUseCase.ts
│   │   ├── 📄 CompleteStoryUseCase.ts
│   │   ├── 📄 RateStoryUseCase.ts
│   │   └── 📄 ReviewStoryUseCase.ts
│   ├── 📂 achievements/
│   │   ├── 📄 GetUserAchievementsUseCase.ts
│   │   ├── 📄 UnlockAchievementUseCase.ts
│   │   └── 📄 GetAvailableAchievementsUseCase.ts
│   ├── 📂 reviews/
│   │   ├── 📄 CreateReviewUseCase.ts
│   │   ├── 📄 GetStoryReviewsUseCase.ts
│   │   ├── 📄 VoteReviewUseCase.ts
│   │   └── 📄 ReportReviewUseCase.ts
│   └── 📂 credits/
│       ├── 📄 GetUserCreditsUseCase.ts
│       ├── 📄 SpendCreditsUseCase.ts
│       └── 📄 GetCreditHistoryUseCase.ts
│
├── 📂 use-cases-admin/          # Admin-specific use case implementations
│   ├── 📂 auth/
│   │   ├── 📄 AdminLoginUseCase.ts
│   │   ├── 📄 AdminLogoutUseCase.ts
│   │   └── 📄 ValidateAdminSessionUseCase.ts
│   ├── 📂 users/
│   │   ├── 📄 GetAllUsersUseCase.ts
│   │   ├── 📄 GetUserDetailsUseCase.ts
│   │   ├── 📄 SuspendUserUseCase.ts
│   │   ├── 📄 BanUserUseCase.ts
│   │   ├── 📄 ResetUserPasswordUseCase.ts
│   │   └── 📄 GetUserAnalyticsUseCase.ts
│   ├── 📂 stories/
│   │   ├── 📄 GetAllStoriesUseCase.ts
│   │   ├── 📄 GetStoryAdminDetailsUseCase.ts
│   │   ├── 📄 CreateStoryUseCase.ts
│   │   ├── 📄 UpdateStoryUseCase.ts
│   │   ├── 📄 DeleteStoryUseCase.ts
│   │   ├── 📄 PublishStoryUseCase.ts
│   │   ├── 📄 UnpublishStoryUseCase.ts
│   │   ├── 📄 ApproveStoryUseCase.ts
│   │   └── 📄 GetStoryAnalyticsUseCase.ts
│   ├── 📂 reviews/
│   │   ├── 📄 GetAllReviewsUseCase.ts
│   │   ├── 📄 ModerateReviewUseCase.ts
│   │   ├── 📄 DeleteReviewUseCase.ts
│   │   ├── 📄 ReplyToReviewUseCase.ts
│   │   └── 📄 GetReportedReviewsUseCase.ts
│   ├── 📂 achievements/
│   │   ├── 📄 CreateAchievementUseCase.ts
│   │   ├── 📄 UpdateAchievementUseCase.ts
│   │   ├── 📄 DeleteAchievementUseCase.ts
│   │   ├── 📄 GrantAchievementUseCase.ts
│   │   └── 📄 GetAchievementStatsUseCase.ts
│   ├── 📂 analytics/
│   │   ├── 📄 GetDashboardAnalyticsUseCase.ts
│   │   ├── 📄 GetUserAnalyticsUseCase.ts
│   │   ├── 📄 GetStoryAnalyticsUseCase.ts
│   │   ├── 📄 GetRevenueAnalyticsUseCase.ts
│   │   └── 📄 GetSystemHealthUseCase.ts
│   ├── 📂 content/
│   │   ├── 📄 ReviewFlaggedContentUseCase.ts
│   │   ├── 📄 ApproveContentUseCase.ts
│   │   ├── 📄 RejectContentUseCase.ts
│   │   └── 📄 BulkContentModerationUseCase.ts
│   └── 📂 system/
│       ├── 📄 GetSystemConfigUseCase.ts
│       ├── 📄 UpdateSystemConfigUseCase.ts
│       ├── 📄 GetAdminLogsUseCase.ts
│       └── 📄 BackupDatabaseUseCase.ts
│
├── 📂 services/                # Application services
│   ├── 📂 user/
│   │   ├── 📄 UserAuthService.ts
│   │   ├── 📄 UserService.ts
│   │   └── 📄 UserCreditService.ts
│   ├── 📂 admin/
│   │   ├── 📄 AdminAuthService.ts
│   │   ├── 📄 AdminUserService.ts
│   │   └── 📄 AdminAnalyticsService.ts
│   ├── 📂 shared/
│   │   ├── 📄 StoryService.ts
│   │   ├── 📄 AchievementService.ts
│   │   ├── 📄 NotificationService.ts
│   │   └── 📄 EmailService.ts
│   └── 📂 external/
│       ├── 📄 GoogleOAuthService.ts
│       ├── 📄 GeminiAIService.ts
│       └── 📄 StorageService.ts
│
├── 📂 dto/                     # Data Transfer Objects
│   ├── 📂 user/
│   │   ├── 📂 auth/
│   │   │   ├── 📄 RegisterUserDTO.ts
│   │   │   ├── 📄 LoginUserDTO.ts
│   │   │   └── 📄 VerifyOTPDTO.ts
│   │   ├── 📂 stories/
│   │   │   ├── 📄 GetStoriesDTO.ts
│   │   │   ├── 📄 MakeChoiceDTO.ts
│   │   │   └── 📄 CompleteStoryDTO.ts
│   │   └── 📂 users/
│   │       ├── 📄 UpdateProfileDTO.ts
│   │       └── 📄 FavoriteStoryDTO.ts
│   └── 📂 admin/
│       ├── 📂 auth/
│       │   ├── 📄 AdminLoginDTO.ts
│       │   └── 📄 AdminSessionDTO.ts
│       ├── 📂 users/
│       │   ├── 📄 SuspendUserDTO.ts
│       │   ├── 📄 BanUserDTO.ts
│       │   └── 📄 UserAnalyticsDTO.ts
│       ├── 📂 stories/
│       │   ├── 📄 CreateStoryDTO.ts
│       │   ├── 📄 UpdateStoryDTO.ts
│       │   └── 📄 ModerationDTO.ts
│       └── 📂 system/
│           ├── 📄 SystemConfigDTO.ts
│           └── 📄 AdminLogDTO.ts
│
├── 📂 validators/              # Input validation
│   ├── 📂 user/
│   │   ├── 📄 auth.validator.ts
│   │   ├── 📄 story.validator.ts
│   │   ├── 📄 user.validator.ts
│   │   └── 📄 review.validator.ts
│   └── 📂 admin/
│       ├── 📄 admin-auth.validator.ts
│       ├── 📄 user-management.validator.ts
│       ├── 📂 content-moderation.validator.ts
│       └── 📂 system-config.validator.ts
│
└── 📂 interfaces/              # Application interfaces
    ├── 📂 user/
    │   ├── 📄 IAuthService.ts
    │   ├── 📄 IUserService.ts
    │   └── 📄 ICreditService.ts
    └── 📂 admin/
        ├── 📄 IAdminAuthService.ts
        ├── 📄 IAdminUserService.ts
        ├── 📄 IAnalyticsService.ts
        └── 📂 IModerationService.ts
```

### Infrastructure Layer (`/packages/infrastructure/`)

```typescript
packages/infrastructure/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts
│
├── 📂 database/                # Database implementation
│   ├── 📂 connection/
│   │   ├── 📄 mongodb.ts
│   │   ├── 📄 connection.ts
│   │   └── 📄 health.ts
│   ├── 📂 repositories/            # Repository implementations
│   │   ├── 📄 MongoUserRepository.ts
│   │   ├── 📄 MongoStoryRepository.ts
│   │   ├── 📄 MongoAchievementRepository.ts
│   │   ├── 📄 MongoReviewRepository.ts
│   │   └── 📄 MongoCreditTransactionRepository.ts
│   ├── 📂 models/                 # Mongoose models
│   │   ├── 📄 UserSchema.ts
│   │   ├── 📄 StorySchema.ts
│   │   ├── 📄 AchievementSchema.ts
│   │   ├── 📄 ReviewSchema.ts
│   │   └── 📄 CreditTransactionSchema.ts
│   └── 📂 seeds/                  # Database seeding
│       ├── 📄 users.ts
│       ├── 📄 stories.ts
│       └── 📄 achievements.ts
│
├── 📂 email/                   # Email implementation
│   ├── 📄 NodeMailerEmailService.ts
│   ├── 📄 EmailTemplates.ts
│   └── 📄 EmailConfig.ts
│
├── 📂 storage/                 # File storage implementation
│   ├── 📄 LocalFileStorage.ts
│   ├── 📄 S3FileStorage.ts
│   └── 📄 CloudinaryFileStorage.ts
│
├── 📂 external/                # External API integrations
│   ├── 📄 GoogleOAuthService.ts
│   ├── 📄 GeminiAIService.ts
│   └── 📄 AnalyticsService.ts
│
├── 📂 cache/                   # Caching implementation
│   ├── 📄 RedisCache.ts
│   ├── 📄 MemoryCache.ts
│   └── 📄 CacheService.ts
│
└── 📂 logging/                 # Logging implementation
    ├── 📄 WinstonLogger.ts
    └── 📄 LoggerConfig.ts
```

### Presentation Layer (`/packages/presentation/`)

```typescript
packages/presentation/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts
│
├── 📂 controllers/             # User API Controllers
│   ├── 📂 auth/
│   │   ├── 📄 RegisterUserController.ts
│   │   ├── 📄 LoginUserController.ts
│   │   ├── 📄 VerifyOTPController.ts
│   │   ├── 📄 LogoutUserController.ts
│   │   └── 📄 ResetPasswordController.ts
│   ├── 📂 users/
│   │   ├── 📄 GetUserProfileController.ts
│   │   ├── 📄 UpdateUserProfileController.ts
│   │   ├── 📄 GetUserFavoritesController.ts
│   │   ├── 📄 AddToFavoritesController.ts
│   │   └── 📄 UpdateAvatarController.ts
│   ├── 📂 stories/
│   │   ├── 📄 GetPublishedStoriesController.ts
│   │   ├── 📄 GetStoryDetailController.ts
│   │   ├── 📄 PlayStoryController.ts
│   │   ├── 📄 MakeStoryChoiceController.ts
│   │   ├── 📄 CompleteStoryController.ts
│   │   ├── 📄 RateStoryController.ts
│   │   └── 📄 ReviewStoryController.ts
│   ├── 📂 achievements/
│   │   ├── 📄 GetUserAchievementsController.ts
│   │   ├── 📄 GetAvailableAchievementsController.ts
│   │   └── 📄 UnlockAchievementController.ts
│   ├── 📂 reviews/
│   │   ├── 📄 CreateReviewController.ts
│   │   ├── 📄 GetStoryReviewsController.ts
│   │   ├── 📄 VoteReviewController.ts
│   │   └── 📄 ReportReviewController.ts
│   └── 📂 credits/
│       ├── 📄 GetUserCreditsController.ts
│       ├── 📄 SpendCreditsController.ts
│       └── 📄 GetCreditHistoryController.ts
│
├── 📂 controllers-admin/      # Admin API Controllers
│   ├── 📂 auth/
│   │   ├── 📄 AdminLoginController.ts
│   │   ├── 📄 AdminLogoutController.ts
│   │   └── 📄 ValidateAdminSessionController.ts
│   ├── 📂 users/
│   │   ├── 📄 GetAllUsersController.ts
│   │   ├── 📄 GetUserDetailsController.ts
│   │   ├── 📄 SuspendUserController.ts
│   │   ├── 📄 BanUserController.ts
│   │   ├── 📄 ResetUserPasswordController.ts
│   │   └── 📄 GetUserAnalyticsController.ts
│   ├── 📂 stories/
│   │   ├── 📄 GetAllStoriesController.ts
│   │   ├── 📄 GetStoryAdminDetailsController.ts
│   │   ├── 📄 CreateStoryController.ts
│   │   ├── 📄 UpdateStoryController.ts
│   │   ├── 📄 DeleteStoryController.ts
│   │   ├── 📄 PublishStoryController.ts
│   │   ├── 📄 UnpublishStoryController.ts
│   │   ├── 📄 ApproveStoryController.ts
│   │   └── 📄 GetStoryAnalyticsController.ts
│   ├── 📂 reviews/
│   │   ├── 📄 GetAllReviewsController.ts
│   │   ├── 📄 ModerateReviewController.ts
│   │   ├── 📄 DeleteReviewController.ts
│   │   ├── 📄 ReplyToReviewController.ts
│   │   └── 📄 GetReportedReviewsController.ts
│   ├── 📂 achievements/
│   │   ├── 📄 CreateAchievementController.ts
│   │   ├── 📄 UpdateAchievementController.ts
│   │   ├── 📄 DeleteAchievementController.ts
│   │   ├── 📄 GrantAchievementController.ts
│   │   └── 📄 GetAchievementStatsController.ts
│   ├── 📂 analytics/
│   │   ├── 📄 GetDashboardAnalyticsController.ts
│   │   ├── 📄 GetUserAnalyticsController.ts
│   │   ├── 📄 GetStoryAnalyticsController.ts
│   │   ├── 📄 GetRevenueAnalyticsController.ts
│   │   └── 📄 GetSystemHealthController.ts
│   ├── 📂 content/
│   │   ├── 📄 ReviewFlaggedContentController.ts
│   │   ├── 📄 ApproveContentController.ts
│   │   ├── 📄 RejectContentController.ts
│   │   └── 📄 BulkContentModerationController.ts
│   └── 📂 system/
│       ├── 📄 GetSystemConfigController.ts
│       ├── 📄 UpdateSystemConfigController.ts
│       ├── 📄 GetAdminLogsController.ts
│       └── 📄 BackupDatabaseController.ts
│
├── 📂 middleware/              # API middleware
│   ├── 📂 user/
│   │   ├── 📄 user-auth.middleware.ts
│   │   ├── 📄 user-validation.middleware.ts
│   │   └── 📄 user-rate-limit.middleware.ts
│   ├── 📂 admin/
│   │   ├── 📄 admin-auth.middleware.ts
│   │   ├── 📄 admin-validation.middleware.ts
│   │   ├── 📄 admin-permissions.middleware.ts
│   │   └── 📄 admin-audit.middleware.ts
│   └── 📂 shared/
│       ├── 📄 error-middleware.ts
│       ├── 📄 cors-middleware.ts
│       └── 📄 logging.middleware.ts
│
├── 📂 serializers/             # Response serialization
│   ├── 📂 user/
│   │   ├── 📄 UserSerializer.ts
│   │   ├── 📄 UserProfileSerializer.ts
│   │   └── 📄 UserStatsSerializer.ts
│   ├── 📂 admin/
│   │   ├── 📄 AdminSerializer.ts
│   │   ├── 📄 UserManagementSerializer.ts
│   │   └── 📄 AdminStatsSerializer.ts
│   ├── 📂 shared/
│   │   ├── 📄 StorySerializer.ts
│   │   ├── 📄 AchievementSerializer.ts
│   │   ├── 📄 ReviewSerializer.ts
│   │   └── 📄 AnalyticsSerializer.ts
│   └── 📂 responses/
│       ├── 📄 SuccessResponse.ts
│       ├── 📄 ErrorResponse.ts
│       ├── 📄 ValidationError.ts
│       ├── 📄 PaginatedResponse.ts
│       └── 📄 AdminResponse.ts
│
├── 📂 routes/                  # Route definitions
│   ├── 📂 user/
│   │   ├── 📄 auth-routes.ts
│   │   ├── 📄 user-routes.ts
│   │   ├── 📄 story-routes.ts
│   │   └── 📄 achievement-routes.ts
│   ├── 📂 admin/
│   │   ├── 📄 admin-auth-routes.ts
│   │   ├── 📄 user-management-routes.ts
│   │   ├── 📂 content-management-routes.ts
│   │   └── 📄 analytics-routes.ts
│   └── 📂 shared/
│       ├── 📄 health-routes.ts
│       └── 📄 system-routes.ts
│
└── 📂 types/                   # Presentation layer types
    ├── 📂 user/
    │   ├── 📄 user-api.types.ts
    │   └── 📄 user-response.types.ts
    ├── 📂 admin/
    │   ├── 📄 admin-api.types.ts
    │   └── 📄 admin-response.types.ts
    └── 📂 shared/
        ├── 📄 common-api.types.ts
        └── 📄 pagination.types.ts
```

### Shared Layer (`/packages/shared/`)

```typescript
packages/shared/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts
│
├── 📂 types/                   # Shared TypeScript types
│   ├── 📄 api.types.ts
│   ├── 📄 common.types.ts
│   ├── 📄 environment.types.ts
│   └── 📄 testing.types.ts
│
├── 📂 utils/                   # Utility functions
│   ├── 📄 date.ts
│   ├── 📄 string.ts
│   ├── 📄 validation.ts
│   ├── 📄 crypto.ts
│   └── 📄 array.ts
│
├── 📂 constants/               # Application constants
│   ├── 📄 api.ts
│   ├── 📄 auth.ts
│   ├── 📄 game.ts
│   └── 📄 errors.ts
│
├── 📂 config/                  # Configuration
│   ├── 📄 env.ts
│   ├── 📄 database.ts
│   └── 📄 app.ts
│
└── 📂 enums/                   # Enum definitions
    ├── 📄 user-status.enum.ts
    ├── 📄 story-status.enum.ts
    ├── 📄 achievement-type.enum.ts
    └── 📄 review-status.enum.ts
```

---

## 🔧 Next.js API Architecture Clarification

### **No `/packages/api/` Folder Needed!**

Since we're using **Next.js API Routes**, we don't need a separate `/packages/api/` folder. The API structure is:

```typescript
apps/frontend/api/              # User API routes (Next.js)
├── 📂 auth/
│   ├── 📄 register/route.ts     # Uses RegisterUserController
│   ├── 📄 login/route.ts        # Uses LoginUserController
│   └── 📄 logout/route.ts       # Uses LogoutUserController
├── 📂 users/
│   ├── 📄 profile/route.ts      # Uses GetUserProfileController
│   └── 📄 favorites/route.ts    # Uses GetFavoritesController
└── 📂 stories/
    ├── 📄 route.ts             # Uses GetPublishedStoriesController
    └── 📂 [id]/
        ├── 📄 route.ts         # Uses GetStoryDetailController
        └── 📄 play/route.ts     # Uses PlayStoryController

apps/admin/api/                 # Admin API routes (Next.js)
├── 📂 auth/
│   ├── 📄 login/route.ts        # Uses AdminLoginController
│   └── 📄 logout/route.ts       # Uses AdminLogoutController
├── 📂 users/
│   ├── 📄 route.ts             # Uses GetAllUsersController
│   └── 📂 [id]/
│       ├── 📄 suspend/route.ts  # Uses SuspendUserController
│       └── 📄 analytics/route.ts # Uses GetUserAnalyticsController
└── 📂 stories/
    ├── 📄 route.ts             # Uses GetAllStoriesController
    └── 📂 [id]/
        ├── 📄 route.ts         # Uses GetStoryAdminDetailsController
        └── 📄 approve/route.ts  # Uses ApproveStoryController
```

### **Middleware Implementation Strategy**

#### **Option 1: Next.js Middleware (Recommended)**

```typescript
// apps/frontend/middleware.ts - User middleware
import { NextRequest, NextResponse } from 'next/server';
import { UserAuthMiddleware } from '@shared/presentation/middleware/user/user-auth.middleware';

export async function middleware(request: NextRequest) {
  // Only apply to user API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return UserAuthMiddleware.execute(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*']
};
```

```typescript
// apps/admin/middleware.ts - Admin middleware
import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthMiddleware } from '@shared/presentation/middleware/admin/admin-auth.middleware';

export async function middleware(request: NextRequest) {
  // Only apply to admin API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return AdminAuthMiddleware.execute(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*']
};
```

#### **Option 2: Per-Route Middleware (For Complex Validation)**

```typescript
// apps/frontend/api/users/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserAuthMiddleware } from '@shared/presentation/middleware/user/user-auth.middleware';
import { GetUserProfileController } from '@shared/presentation/controllers/users/GetUserProfileController';

export async function GET(request: NextRequest) {
  // Apply user authentication
  const authResult = await UserAuthMiddleware.execute(request);
  if (!authResult.success) {
    return authResult.response; // Returns 401/403
  }

  // User is authenticated, proceed with controller
  const controller = new GetUserProfileController();
  return await controller.handle(authResult.user, request);
}

export async function PUT(request: NextRequest) {
  // Same authentication + validation
  const authResult = await UserAuthMiddleware.execute(request);
  if (!authResult.success) {
    return authResult.response;
  }

  // Add additional validation for PUT requests
  const validationMiddleware = new UserValidationMiddleware();
  const validationResult = await validationMiddleware.execute(request);
  if (!validationResult.success) {
    return validationResult.response; // Returns 400
  }

  const controller = new UpdateUserProfileController();
  return await controller.handle(authResult.user, validationResult.data);
}
```

### **Middleware Location Strategy**

#### **📁 Where to Put Middleware:**

```typescript
packages/presentation/middleware/
├── 📂 user/                    # User-specific middleware
│   ├── 📄 user-auth.middleware.ts     # User JWT validation
│   ├── 📄 user-validation.middleware.ts # User input validation
│   ├── 📄 user-rate-limit.middleware.ts # User rate limiting
│   └── 📄 user-audit.middleware.ts     # User action logging
│
├── 📂 admin/                   # Admin-specific middleware
│   ├── 📄 admin-auth.middleware.ts     # Admin JWT validation
│   ├── 📄 admin-permissions.middleware.ts # Admin role checking
│   ├── 📄 admin-validation.middleware.ts # Admin input validation
│   ├── 📄 admin-audit.middleware.ts     # Admin action logging
│   └── 📄 admin-security.middleware.ts # Additional security checks
│
└── 📂 shared/                  # Shared middleware
    ├── 📄 error-middleware.ts          # Error handling
    ├── 📄 cors-middleware.ts          # CORS configuration
    ├── 📄 logging-middleware.ts       # Request logging
    └── 📄 health-check.middleware.ts   # Health check bypass
```

### **Recommended Implementation Pattern**

#### **1. Use Next.js Middleware for Global Auth:**

```typescript
// apps/frontend/middleware.ts
import { UserAuthMiddleware } from '@shared/presentation/middleware/user/user-auth.middleware';

export async function middleware(request: NextRequest) {
  // Global user authentication for all API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return UserAuthMiddleware.execute(request);
  }
  return NextResponse.next();
}
```

#### **2. Use Route-Level Middleware for Additional Logic:**

```typescript
// apps/frontend/api/stories/[id]/play/route.ts
import { StoryPlayValidationMiddleware } from '@shared/presentation/middleware/user/story-play-validation.middleware';
import { MakeStoryChoiceController } from '@shared/presentation/controllers/stories/MakeStoryChoiceController';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Additional validation specific to story choices
  const validation = await StoryPlayValidationMiddleware.execute(request, params);
  if (!validation.success) {
    return validation.response;
  }

  // Proceed with business logic (user already authenticated by global middleware)
  const controller = new MakeStoryChoiceController();
  return await controller.handle(validation.data, request);
}
```

### **Why This Approach:**

✅ **Next.js Native** - Uses built-in Next.js middleware system
✅ **Performance** - Middleware runs at edge (if configured)
✅ **Simplicity** - No custom routing needed
✅ **Type Safety** - Full TypeScript support
✅ **Flexibility** - Can combine global and route-level middleware

### **Middleware Implementation Example:**

```typescript
// packages/presentation/middleware/user/user-auth.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserJWTService } from '@shared/infrastructure/jwt/UserJWTService';
import { MongoUserRepository } from '@shared/infrastructure/repositories/MongoUserRepository';

export class UserAuthMiddleware {
  private static jwtService = new UserJWTService();
  private static userRepository = new MongoUserRepository();

  static async execute(request: NextRequest): Promise<{
    success: boolean;
    user?: any;
    response?: NextResponse;
  }> {
    try {
      const token = this.extractToken(request);
      if (!token) {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'UNAUTHORIZED', message: 'No token provided' },
            { status: 401 }
          )
        };
      }

      const payload = await this.jwtService.verifyUser(token);
      const user = await this.userRepository.findById(payload.userId);

      if (!user || user.accountStatus.status !== 'active') {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'UNAUTHORIZED', message: 'Invalid or inactive user' },
            { status: 401 }
          )
        };
      }

      // Attach user to request headers for controllers to use
      const headers = new Headers(request.headers);
      headers.set('x-user-id', user.id);
      headers.set('x-user-email', user.email);

      return { success: true, user };

    } catch (error) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'UNAUTHORIZED', message: 'Invalid token' },
          { status: 401 }
        )
      };
    }
  }

  private static extractToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
```

This approach gives you the best of both worlds: Next.js's native API route system with clean, reusable middleware from your shared packages! 🚀

### Testing Layer (`/packages/testing/`)

```typescript
packages/testing/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts
│
├── 📂 mocks/                   # Mock implementations
│   ├── 📂 repositories/
│   │   ├── 📄 MockUserRepository.ts
│   │   ├── 📄 MockStoryRepository.ts
│   │   └── 📄 MockAchievementRepository.ts
│   ├── 📂 services/
│   │   ├── 📄 MockEmailService.ts
│   │   ├── 📄 MockStorageService.ts
│   │   └── 📄 MockExternalAPIService.ts
│   └── 📂 database/
│       ├── 📄 MockDatabaseConnection.ts
│       └── 📄 MemoryDatabase.ts
│
├── 📂 fixtures/                # Test data fixtures
│   ├── 📄 users.ts
│   ├── 📄 stories.ts
│   ├── 📄 achievements.ts
│   └── 📄 reviews.ts
│
├── 📂 utils/                   # Testing utilities
│   ├── 📄 setup-test-database.ts
│   ├── 📄 clear-test-database.ts
│   ├── 📄 create-test-user.ts
│   └── 📄 create-test-story.ts
│
├── 📂 helpers/                 # Test helpers
│   ├── 📄 request-helpers.ts
│   ├── 📄 auth-helpers.ts
│   └── 📄 validation-helpers.ts
│
└── 📂 factories/               # Test data factories
    ├── 📄 UserFactory.ts
    ├── 📄 StoryFactory.ts
    ├── 📄 AchievementFactory.ts
    └── 📄 ReviewFactory.ts
```

### Database Package (`/packages/infrastructure/database/`)

```
packages/database/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts                 # Main exports
│
├── 📂 config/
│   ├── 📄 connection.ts       # MongoDB connection
│   ├── 📄 indexes.ts          # Database indexes
│   └── 📄 migrations/         # Database migrations (if needed)
│
├── 📂 models/                 # Mongoose models (added incrementally)
│   ├── 📄 User.ts             # Core user model
│   ├── 📄 Story.ts            # Story model
│   ├── 📄 StoryNode.ts        # Story content model
│   ├── 📄 UserSession.ts      # Session management
│   ├── 📄 Achievement.ts      # Achievement system
│   ├── 📄 UserAchievement.ts  # User achievement tracking
│   ├── 📄 Review.ts           # Review system
│   ├── 📄 CreditTransaction.ts # Credit economy
│   └── 📂 __tests__/          # Model tests
│
├── 📂 seeds/                  # Database seeding
│   ├── 📄 users.ts
│   ├── 📄 stories.ts
│   ├── 📄 achievements.ts
│   └── 📄 index.ts
│
└── 📂 utils/                  # Database utilities
    ├── 📄 validators.ts
    ├── 📄 helpers.ts
    └── 📄 aggregations.ts
```

### API Package (`/packages/api/`)

```
packages/api/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts
│
├── 📂 middleware/             # Shared API middleware
│   ├── 📄 auth.ts             # Authentication middleware
│   ├── 📄 validation.ts       # Request validation
│   ├── 📄 rate-limit.ts       # Rate limiting
│   ├── 📄 cors.ts             # CORS configuration
│   ├── 📄 error-handler.ts    # Error handling
│   └── 📄 logging.ts          # Request logging
│
├── 📂 routes/                 # Shared route logic
│   ├── 📂 auth/
│   │   ├── 📄 register.ts
│   │   ├── 📄 login.ts
│   │   └── 📄 logout.ts
│   ├── 📂 stories/
│   │   ├── 📄 crud.ts
│   │   └── 📄 search.ts
│   └── 📂 users/
│       └── 📄 profile.ts
│
├── 📂 services/               # Business logic services
│   ├── 📄 auth-service.ts
│   ├── 📄 email-service.ts
│   ├── 📄 otp-service.ts
│   ├── 📄 story-service.ts
│   └── 📄 user-service.ts
│
├── 📂 utils/                  # API utilities
│   ├── 📄 response.ts         # Standardized API responses
│   ├── 📄 validation.ts       # Input validation schemas
│   ├── 📄 pagination.ts       # Pagination utilities
│   └── 📄 security.ts         # Security helpers
│
└── 📂 types/                  # API types
    ├── 📄 api.types.ts
    ├── 📄 request.types.ts
    └── 📄 response.types.ts
```

### Auth Package (`/packages/auth/`)

```
packages/auth/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts
│
├── 📂 strategies/             # Authentication strategies
│   ├── 📄 email-auth.ts       # Email/password auth
│   ├── 📄 google-auth.ts      # Google OAuth
│   └── 📄 guest-auth.ts       # Guest session auth
│
├── 📂 services/               # Auth services
│   ├── 📄 jwt-service.ts      # JWT token management
│   ├── 📄 password-service.ts  # Password hashing/validation
│   ├── 📄 session-service.ts  # Session management
│   └── 📄 otp-service.ts      # OTP generation/verification
│
├── 📂 middleware/             # Auth middleware
│   ├── 📄 require-auth.ts     # Require authentication
│   ├── 📄 require-admin.ts    # Require admin privileges
│   └── 📄 optional-auth.ts    # Optional authentication
│
├── 📂 utils/                  # Auth utilities
│   ├── 📄 validators.ts       # Auth validation schemas
│   ├── 📄 helpers.ts          # Helper functions
│   └── 📄 constants.ts        # Auth constants
│
└── 📂 types/                  # Auth types
    ├── 📄 auth.types.ts
    ├── 📄 user.types.ts
    └── 📄 session.types.ts
```

### Types Package (`/packages/types/`)

```
packages/types/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts
│
├── 📂 core/                   # Core type definitions
│   ├── 📄 user.types.ts
│   ├── 📄 story.types.ts
│   ├── 📄 achievement.types.ts
│   ├── 📄 review.types.ts
│   └── 📄 common.types.ts
│
├── 📂 api/                    # API request/response types
│   ├── 📄 auth.types.ts
│   ├── 📄 story.types.ts
│   ├── 📄 user.types.ts
│   └── 📄 admin.types.ts
│
├── 📂 database/               # Database model types
│   ├── 📄 user.model.ts
│   ├── 📄 story.model.ts
│   └── 📄 achievement.model.ts
│
└── 📂 ui/                     # UI component types
    ├── 📄 form.types.ts
    ├── 📄 component.types.ts
    └── 📄 layout.types.ts
```

### Utils Package (`/packages/utils/`)

```
packages/utils/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts
│
├── 📂 format/                 # Formatting utilities
│   ├── 📄 date.ts
│   ├── 📄 currency.ts
│   └── 📄 text.ts
│
├── 📂 validation/             # Validation utilities
│   ├── 📄 schemas.ts
│   ├── 📄 validators.ts
│   └── 📄 sanitizers.ts
│
├── 📂 helpers/                # General helpers
│   ├── 📄 array.ts
│   ├── 📄 object.ts
│   ├── 📄 string.ts
│   └── 📄 async.ts
│
├── 📂 constants/              # Shared constants
│   ├── 📄 api.ts
│   ├── 📄 auth.ts
│   └── 📄 game.ts
│
└── 📂 client/                 # Client-side utilities
    ├── 📄 api.ts
    ├── 📄 storage.ts
    └── 📄 device.ts
```

### Config Package (`/packages/config/`)

```
packages/config/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 index.ts
│
├── 📂 database/               # Database configuration
│   ├── 📄 mongodb.ts
│   └── 📄 connection.ts
│
├── 📂 auth/                   # Auth configuration
│   ├── 📄 jwt.ts
│   ├── 📄 oauth.ts
│   └── 📄 otp.ts
│
├── 📂 app/                    # App configuration
│   ├── 📄 env.ts              # Environment validation
│   ├── 📄 constants.ts
│   └── 📄 features.ts         # Feature flags
│
├── 📂 services/               # External service config
│   ├── 📄 email.ts
│   ├── 📄 storage.ts
│   └── 📄 analytics.ts
│
└── 📂 development/            # Development configuration
    ├── 📄 testing.ts
    └── 📄 logging.ts
```

---

## 🗂️ File Organization Principles

### 1. **Shared First**
- All reusable code goes in `/packages/`
- Each package is self-contained with its own package.json
- Clear boundaries between packages

### 2. **App-Specific Separation**
- `/apps/frontend/` contains only frontend-specific code
- `/apps/admin/` contains only admin-specific code
- API routes in each app are thin wrappers around shared services

### 3. **Incremental Development**
- Start with essential packages only
- Add new packages as features are developed
- Models and services grow organically

### 4. **Type Safety**
- Centralized type definitions in `/packages/types/`
- Each package exports its own types
- Cross-package type dependencies are explicit

---

## 📋 Implementation Steps

### Phase 1: Core Structure (Week 1)

```bash
# 1. Create shared packages structure
mkdir -p packages/{database,api,auth,types,utils,config}

# 2. Add basic package.json files
npm init -y -w packages/database
npm init -y -w packages/api
# ... etc

# 3. Set up TypeScript paths in root tsconfig.json
# 4. Create initial models in packages/database/models/
# 5. Set up basic API structure in packages/api/
```

### Phase 2: Development Setup (Week 1)

```bash
# 1. Configure shared dependencies
npm install mongoose @types/mongoose -w packages/database
npm install jsonwebtoken @types/jsonwebtoken -w packages/auth
npm install zod -w packages/api

# 2. Set up environment validation
# 3. Create database connection utilities
# 4. Set up basic middleware
```

### Phase 3: Feature Development (Week 2+)

```bash
# Add models as needed:
# packages/database/models/User.ts
# packages/database/models/Story.ts
# packages/database/models/Achievement.ts

# Add services as needed:
# packages/api/services/auth-service.ts
# packages/api/services/story-service.ts
# packages/auth/services/jwt-service.ts
```

---

## 🔧 Configuration Examples

### Root package.json (workspaces)
```json
{
  "name": "talepick",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  }
}
```

### TypeScript Path Aliases (root tsconfig.json)
```json
{
  "compilerOptions": {
    "paths": {
      "@shared/database": ["packages/database"],
      "@shared/api": ["packages/api"],
      "@shared/auth": ["packages/auth"],
      "@shared/types": ["packages/types"],
      "@shared/utils": ["packages/utils"],
      "@shared/config": ["packages/config"]
    }
  }
}
```

### Package Dependencies Example
```json
// packages/api/package.json
{
  "name": "@talepick/api",
  "dependencies": {
    "@talepick/database": "workspace:*",
    "@talepick/auth": "workspace:*",
    "@talepick/types": "workspace:*",
    "@talepick/utils": "workspace:*"
  }
}
```

---

## 🎯 Benefits of This Structure

### ✅ **Code Reuse**
- Shared business logic across frontend and admin
- Single source of truth for data models
- Consistent authentication and validation

### ✅ **Scalability**
- Easy to add new packages
- Clear separation of concerns
- Can scale team development efficiently

### ✅ **Maintainability**
- Centralized type definitions
- Consistent patterns across apps
- Easy to update shared logic

### ✅ **Development Speed**
- Parallel development possible
- Reusable components and utilities
- Clear development boundaries

---

## 🧪 Comprehensive Testing Strategy

### Testing Pyramid

```
                    ┌─────────────────────┐
                    │    E2E Tests (5%)    │
                    │  User Workflows     │
                    └─────────────────────┘
                ┌─────────────────────────────┐
                │    Integration Tests (15%) │
                │   API + Database Tests     │
                └─────────────────────────────┘
            ┌─────────────────────────────────────┐
            │        Unit Tests (80%)              │
            │  Domain Logic, Use Cases, Utils      │
            └─────────────────────────────────────┘
```

### Test File Naming Conventions

```typescript
// Unit Tests
User.test.ts                    // Domain entity tests
AuthService.test.ts             // Application service tests
RegisterUserUseCase.test.ts     // Use case tests
MongoUserRepository.test.ts    // Infrastructure tests
EmailService.test.ts            // External service tests

// Integration Tests
AuthAPI.integration.test.ts      // API + Database integration
StoryWorkflow.integration.test.ts // Complete story flow

// E2E Tests
UserRegistration.e2e.test.ts     // Full user registration flow
StoryPlaythrough.e2e.test.ts     // Complete story playthrough
AdminDashboard.e2e.test.ts      // Admin functionality
```

### Test Structure Template

```typescript
// Example: packages/application/use-cases/auth/RegisterUserUseCase.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterUserUseCase } from '../RegisterUserUseCase';
import { IUserRepository } from '@talepick/domain/repositories';
import { UserFactory } from '@talepick/testing/factories';
import { UserEmailAlreadyExistsError } from '@talepick/domain/errors';

describe('RegisterUserUseCase', () => {
  let registerUserUseCase: RegisterUserUseCase;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    // Setup mocks and dependencies
    mockUserRepository = {
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      create: vi.fn(),
    } as any;

    registerUserUseCase = new RegisterUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        displayName: 'Test User'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(UserFactory.create(userData));

      // Act
      const result = await registerUserUseCase.execute(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.username).toBe(userData.username);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          username: userData.username
        })
      );
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        username: 'testuser',
        password: 'password123',
        displayName: 'Test User'
      };

      const existingUser = UserFactory.create(userData);
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(registerUserUseCase.execute(userData))
        .rejects
        .toThrow(UserEmailAlreadyExistsError);
    });

    it('should hash password before creating user', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        displayName: 'Test User'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);

      const createdUser = UserFactory.create({
        ...userData,
        passwordHash: 'hashedPassword123'
      });
      mockUserRepository.create.mockResolvedValue(createdUser);

      // Act
      await registerUserUseCase.execute(userData);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordHash: expect.not.toBe(userData.password),
          passwordHash: expect.stringMatching(/^\$2[aby]\$\d+\$/)
        })
      );
    });
  });
});
```

### Testing Configuration

### Vitest Configuration (Root Level)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@shared/domain': path.resolve(__dirname, 'packages/domain'),
      '@shared/application': path.resolve(__dirname, 'packages/application'),
      '@shared/infrastructure': path.resolve(__dirname, 'packages/infrastructure'),
      '@shared/presentation': path.resolve(__dirname, 'packages/presentation'),
      '@shared/shared': path.resolve(__dirname, 'packages/shared'),
      '@shared/testing': path.resolve(__dirname, 'packages/testing')
    }
  }
});
```

### Test Setup File

```typescript
// test/setup.ts
import { vi } from 'vitest';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// Mock console methods in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};
```

### Testing Database Setup

```typescript
// packages/testing/utils/setup-test-database.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const setupTestDatabase = async () => {
  if (mongoServer) {
    return mongoServer.getUri();
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  return uri;
};

export const clearTestDatabase = async () => {
  if (!mongoose.connection.db) return;

  const collections = mongoose.connection.db.collections;
  for (const collection of collections) {
    await collection.deleteMany({});
  }
};

export const disconnectTestDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null as any;
  }
};
```

### Test Data Factories

```typescript
// packages/testing/factories/UserFactory.ts
import { faker } from '@faker-js/faker';
import { User } from '@shared/domain/entities/User';

export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    const baseUser = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      displayName: faker.person.fullName(),
      passwordHash: faker.string.alphanumeric(60),
      profile: {
        displayName: faker.person.fullName(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence()
      },
      authentication: {
        authMethod: 'email' as const,
        isGuest: false,
        emailVerified: true,
        hasPassword: true
      },
      accountStatus: {
        status: 'active' as const,
        reason: null,
        moderatedBy: null,
        moderatedAt: null
      },
      gameStats: {
        credits: 20,
        maxCredits: 20,
        lastCreditRefill: new Date(),
        totalStoriesPlayed: 0,
        totalEndingsUnlocked: 0,
        totalAvatarsUnlocked: 0,
        createdAt: new Date(),
        lastLoginAt: new Date()
      },
      createdAt: faker.date.past(),
      updatedAt: new Date()
    };

    return new User({ ...baseUser, ...overrides });
  }

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
```

### API Integration Testing

```typescript
// apps/frontend/test/integration/auth.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, clearTestDatabase } from '@shared/testing/utils';
import request from 'supertest';
import { app } from '../setup-test-app';

describe('Auth API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        displayName: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User registered successfully',
        user: expect.objectContaining({
          email: userData.email,
          username: userData.username,
          profile: expect.objectContaining({
            displayName: userData.displayName
          })
        })
      });
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
        displayName: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'VALIDATION_ERROR'
      });
    });
  });
});
```

### E2E Testing with Playwright

```typescript
// test/e2e/user-registration.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('should register a new user successfully', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/auth/signup');

    // Fill out registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="username-input"]', 'testuser');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="displayName-input"]', 'Test User');

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-dashboard"]')).toBeVisible();

    // Verify user is logged in
    await expect(page.locator('[data-testid="user-profile"]')).toContainText('Test User');
  });

  test('should show validation errors for invalid data', async ({ page }) => {
    await page.goto('/auth/signup');

    // Try to submit empty form
    await page.click('[data-testid="register-button"]');

    // Verify validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="username-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });
});
```

### Test Coverage Strategy

```json
{
  "coverage": {
    "include": [
      "packages/**/*.ts",
      "apps/**/*.ts"
    ],
    "exclude": [
      "packages/**/*.test.ts",
      "packages/**/*.spec.ts",
      "packages/**/*.d.ts",
      "test/**",
      "node_modules/**"
    ],
    "check-coverage": true,
    "per-file": true,
    "lines": 80,
    "functions": 80,
    "branches": 80,
    "statements": 80
  }
}
```

### Testing Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:integration": "vitest --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:ci": "vitest --run && npm run test:integration && npm run test:e2e"
  }
}
```

### Performance Testing

```typescript
// test/performance/story-loading.performance.test.ts
import { test, expect } from '@playwright/test';

test.describe('Story Loading Performance', () => {
  test('should load story list within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/library');
    await page.waitForSelector('[data-testid="story-list"]');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle concurrent users loading stories', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);

    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    const startTime = Date.now();

    await Promise.all(
      pages.map(page => page.goto('/library'))
    );

    await Promise.all(
      pages.map(page => page.waitForSelector('[data-testid="story-list"]'))
    );

    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(5000); // All pages should load within 5 seconds
  });
});
```

---

## 🔒 Security Architecture Benefits

### **Separate User vs Admin Systems**

#### **Why Complete Separation?**

1. **Attack Surface Isolation**
   - User authentication breach cannot compromise admin access
   - Different JWT keys prevent token reuse attacks
   - Separate credential databases limit blast radius

2. **Permission Boundaries**
   - No accidental admin privilege escalation
   - Clear separation prevents cross-contamination
   - Role-based access is enforced at architecture level

3. **Audit and Compliance**
   - Separate audit trails for users and admins
   - Different session policies (user: 7 days, admin: 8 hours)
   - Granular control over admin actions

#### **Security Flow Example:**

```typescript
// User API Route - Can only access user use cases
apps/frontend/api/stories/[id]/route.ts
  ↓
GetStoryDetailController (User)
  ↓
GetPublishedStoryUseCase (User)
  ↓
IStoryRepository (User data only)

// Admin API Route - Can access admin use cases
apps/admin/api/stories/[id]/route.ts
  ↓
GetStoryAdminDetailsController (Admin)
  ↓
GetStoryAdminDetailsUseCase (Admin)
  ↓
IStoryRepository (Full story data + analytics)
```

#### **Permission Enforcement at Multiple Levels:**

```typescript
// 1. Domain Layer - Separate entities
export class User {
  // User-specific fields only
  // No admin-related properties
}

export class Admin {
  // Admin-specific fields
  // Role and permissions
}

// 2. Application Layer - Separate use cases
export class UpdateUserProfileUseCase {
  // User can only update their own profile
  // Limited field access
}

export class SuspendUserUseCase {
  // Admin-only functionality
  // Requires admin permissions
}

// 3. Presentation Layer - Separate controllers
export class UpdateUserProfileController {
  // Calls user use cases only
  // Cannot access admin functionality
}

export class SuspendUserController {
  // Calls admin use cases only
  // Requires admin authentication
}
```

#### **JWT Key Separation Benefits:**

```typescript
// User JWT Token
{
  "userId": "user_123",
  "type": "user",
  "aud": "talepick-users"
}
// Signed with USER_JWT_SECRET

// Admin JWT Token
{
  "adminId": "admin_456",
  "role": "Super Admin",
  "permissions": ["suspend_users", "manage_stories"],
  "type": "admin",
  "aud": "talepick-admins"
}
// Signed with ADMIN_JWT_SECRET (different secret)
```

#### **Example Security Scenarios Prevented:**

1. **No Privilege Escalation**
   - User cannot accidentally call admin use cases
   - Admin controllers are completely separate
   - Different authentication middleware

2. **No Data Leakage**
   - User controllers cannot access admin data
   - Admin responses contain different fields
   - Separate serialization logic

3. **No Token Confusion**
   - User tokens cannot be used for admin endpoints
   - Different audiences and secrets
   - Token validation fails cross-system

#### **Complete Isolation Benefits:**

✅ **Security by Design** - Architecture prevents security mistakes
✅ **Clear Boundaries** - No shared authentication logic
✅ **Separate Testing** - User and admin systems tested independently
✅ **Independent Scaling** - User and admin systems can scale differently
✅ **Compliance Ready** - Easy to implement SOC2/GDPR requirements
✅ **Audit Clarity** - Separate logs for user vs admin actions

This approach ensures that even if there's a vulnerability in the user system, the admin system remains completely isolated and secure. 🛡️

---

## 🧪 Comprehensive Testing Strategy

### 1. **Test Structure**
- Use AAA pattern (Arrange, Act, Assert)
- Keep tests focused and isolated
- Use descriptive test names

### 2. **Mocking Strategy**
- Mock external dependencies
- Use factories for test data
- Reset mocks between tests

### 3. **Integration Testing**
- Test API endpoints with real database
- Test complete user workflows
- Verify database state changes

### 4. **E2E Testing**
- Test critical user journeys
- Include performance benchmarks
- Test across different browsers

### 5. **Continuous Integration**
- Run tests on every commit
- Fail builds on coverage drops
- Separate test suites for different environments

---

*This structure supports the phased development approach while maintaining flexibility for future growth and changes, with comprehensive testing at every layer.*