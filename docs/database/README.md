# TalePick Database Overview

> **Thai-language interactive story platform** • MongoDB • Single Instance Architecture

---

## 🚀 Quick Start

**Platform**: MongoDB with Docker Compose
**Connection**: `mongodb://root:example@localhost:27017`
**Language**: Thai language only
**Character Encoding**: UTF-8

**Core Features**:
- Interactive branching stories
- User achievement & avatar system
- Credit-based gameplay
- Multi-authentication methods
- Content moderation & security

---

## 📋 Database Naming Convention

**Important**: All MongoDB collections in this project follow the `lowercase_with_underscores` naming convention.

- **Standard Format**: `collection_names` (lowercase, plural, underscores)
- **Reference**: See [MongoDB Naming Convention Guide](./MONGODB_NAMING_CONVENTION.md)
- **Examples**: `users`, `user_favorites`, `admin_accounts`, `story_nodes`

---

## 📊 Database Architecture

### Total Collections: 24

### Visual Architecture

```mermaid
graph TB
    subgraph "Core User System"
        Users[Users Collection]
        UserProgress[UserStoryProgress]
        UserAchievements[UserAchievements]
        UserFavorites[UserFavorites]
    end

    subgraph "Content System"
        Stories[Stories Collection]
        StoryNodes[StoryNodes]
        StoryAssets[StoryAssets]
        Genres[Genres]
    end

    subgraph "Game Mechanics"
        Achievements[Achievements]
        Avatars[Avatars]
        Credits[CreditTransactions]
    end

    subgraph "Social & Community"
        Reviews[Reviews]
        ReviewVotes[ReviewVotes]
        Flags[Content Flags]
    end

    subgraph "Security & Admin"
        Security[SecurityEvents]
        Admin[AdminAccounts]
        OTP[OTPCodes]
        Sessions[UserSessions]
    end

    Users --> UserProgress
    Users --> UserAchievements
    Users --> UserFavorites
    Users --> Reviews
    Users --> Credits

    Stories --> StoryNodes
    Stories --> StoryAssets
    Stories --> Reviews
    Stories --> Genres

    Achievements --> UserAchievements
    Avatars --> UserAchievements

    style Users fill:#e3f2fd
    style Stories fill:#f3e5f5
    style Achievements fill:#fff3e0
```

---

## 🗂️ Collection Categories

### User Management (5 collections)
- [Users](./collections/USERS.md) - Core user data with multi-auth support
- [UserAchievements](./collections/USER_ACHIEVEMENTS.md) - Achievement tracking
- [UserAvatars](./collections/USER_AVATARS.md) - Avatar ownership & usage
- [UserFavorites](./collections/USER_FAVORITES.md) - Story favorites
- [UserStoryProgress](./collections/USER_STORY_PROGRESS.md) - Game progress tracking

### Content System (5 collections)
- [Stories](./collections/STORIES.md) - Story metadata & moderation
- [StoryNodes](./collections/STORY_NODES.md) - Story content & branching
- [StoryAssets](./collections/STORY_ASSETS.md) - Media file management
- [StoryGallery](./collections/STORY_GALLERY.md) - Story image galleries
- [Genres](./collections/GENRES.md) - Story categories

### Game Mechanics (3 collections)
- [Achievements](./collections/ACHIEVEMENTS.md) - Achievement definitions
- [Avatars](./collections/AVATARS.md) - Avatar definitions & unlocks
- [CreditTransactions](./collections/CREDIT_TRANSACTIONS.md) - Credit economy

### Community & Moderation (4 collections)
- [Reviews](./collections/REVIEWS.md) - User reviews & ratings
- [ReviewVotes](./collections/review-votes.md) - Review voting system
- [ReviewFlags](./collections/review-flags.md) - Review reporting
- [StoryFlags](./collections/story-flags.md) - Story content reporting

### Security & Admin (6 collections)
- [SecurityEvents](./collections/security-events.md) - Security monitoring
- [AdminAccounts](./collections/admin-accounts.md) - Admin user management
- [AdminLoginHistory](./collections/admin-login-history.md) - Admin tracking
- [AdminLogs](./collections/admin-logs.md) - Admin audit trail
- [OTPCodes](./collections/otp-codes.md) - Email verification
- [UserSessions](./collections/user-sessions.md) - Session management

### Analytics & Monitoring (1 collection)
- [Analytics](./collections/analytics.md) - Event tracking with TTL

### System Configuration (1 collection)
- [SystemConfig](./collections/system-config.md) - Runtime settings

---

## 🔗 Key Relationships

### Entity Relationship Overview

```mermaid
erDiagram
    Users ||--o{ UserStoryProgress : "plays"
    Users ||--o{ UserAchievements : "earns"
    Users ||--o{ UserFavorites : "favorites"
    Users ||--o{ Reviews : "writes"
    Users ||--o{ CreditTransactions : "transacts"

    Stories ||--o{ StoryNodes : "contains"
    Stories ||--o{ UserStoryProgress : "tracks"
    Stories ||--o{ Reviews : "receives"
    Stories }o--|| Genres : "categorized as"

    Achievements ||--o{ UserAchievements : "unlocked by"
    Achievements ||--o{ Avatars : "rewards"

    Users {
        ObjectId _id PK
        String email UK
        String username UK
        String authMethod
        String status
        Number credits
    }

    Stories {
        ObjectId _id PK
        String title
        String genre FK
        Boolean isPublished
        Object contentRating
        Number averageRating
    }

    UserAchievements {
        ObjectId _id PK
        ObjectId userId FK
        String achievementId FK
        Date unlockedAt
        Boolean isCompleted
    }
```

---

## 📖 Additional Documentation

### Topics & Guides
- [Security & Authentication](./topics/security.md) - Account management, OTP, auto-detection
- [Game Mechanics](./topics/game-mechanics.md) - Credit system, achievements, avatars
- [Performance Optimization](./topics/performance.md) - Indexing, caching, design patterns
- [Data Protection & Compliance](./topics/compliance.md) - GDPR, encryption, access control
- [Content Rating System](./topics/content-rating.md) - Age classification, content warnings
- [Deployment & Operations](./topics/deployment.md) - Docker setup, monitoring, backups

### Query Examples & Patterns
- [Common Query Patterns](./topics/query-patterns.md) - Frequent database operations
- [Data Flow Examples](./topics/data-flows.md) - User registration, story playthrough, achievements

---

## 🚀 Deployment

### Environment Setup

**MongoDB Configuration**:
```yaml
# docker-compose.yml
version: '3.8'
services:
  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    volumes:
      - mongo_data:/data/db
      - ./init-scripts:/docker-entrypoint-initdb.d
```

**Connection String**: `mongodb://root:example@localhost:27017`

---

*See individual collection and topic documents for detailed information*