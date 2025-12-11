# TalePick Database Design

## Overview

TalePick is a Thai-language interactive story platform. This document outlines the MongoDB database schema designed to support user management, interactive stories, branching narratives, achievements, credits system, and more.

**Platform**: MongoDB with Docker Compose
**Connection**: mongodb://root:example@localhost:27017
**Character Encoding**: UTF-8 (to support Thai language)
**Language Support**: Thai language only

---

## Collections

### 1. Users

Core user authentication and profile data.

```javascript
{
  _id: ObjectId,
  email: String,              // unique, indexed
  username: String,           // unique, indexed
  passwordHash: String,       // bcrypt hash, optional for OAuth users

  // Soft Delete Fields
  deletedAt: Date,
  deletedBy: ObjectId,
  deleteReason: String,

  profile: {
    displayName: String,
    avatar: {
      type: String,           // 'default' | 'custom' | 'google'
      value: String           // URL or avatar ID
    },
    bio: String,
    profileImageUrl: String   // from Google profile
  },

  authentication: {
    authMethod: String,       // 'email' | 'google' | 'guest'
    isGuest: Boolean,
    googleId: String,         // for OAuth, unique indexed
    emailVerified: Boolean,
    hasPassword: Boolean
  },

  accountStatus: {
    status: String,           // 'active' | 'suspended' | 'banned' | 'under_review' | 'locked'
    reason: String,
    moderatedBy: ObjectId,
    moderatedAt: Date,
    notes: String,
    suspensionEndsAt: Date,
    lockType: String,         // 'manual' | 'auto_security' | 'auto_fraud' | 'auto_spam'
    lockExpiresAt: Date
  },

  gameStats: {
    credits: Number,
    maxCredits: Number,
    lastCreditRefill: Date,
    totalStoriesPlayed: Number,
    totalEndingsUnlocked: Number,
    totalAchievementsUnlocked: Number,  // denormalized count
    totalFavorites: Number,             // denormalized count

    // Kept separate from main arrays for optimal performance
    unlockedAvatars: [{
      avatarId: String,       // references Avatars collection
      unlockedAt: Date,
      unlockSource: {
        type: String,
        sourceId: String,
        sourceName: String,
        details: String
      }
    }],

    ratedStoriesForBonus: [String],
    currentAvatarId: String,
    createdAt: Date,
    lastLoginAt: Date
  },

  settings: {
    soundEnabled: Boolean,
    notificationsEnabled: Boolean,
    autoPlayNext: Boolean
  },

  adminMetadata: {
    createdBy: ObjectId,
    createdMethod: String,
    lastModifiedBy: ObjectId,
    adminNotes: String,
    flaggedForReview: Boolean,
    reviewReason: String,
    VIPStatus: String,
    supportLevel: String,
    tags: [String]
  }
}
```

**Indexes**:
- `email` (unique)
- `username` (unique)
- `deletedAt` (sparse)
- `authentication.googleId` (unique, sparse)
- `authentication.authMethod`
- `accountStatus.status`
- `accountStatus.moderatedAt`

---

### 2. UserAchievements

Separate collection for user achievement unlocks to prevent unbounded array growth.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  achievementId: String,      // references Achievements.achievementId

  unlockedAt: Date,
  unlockSource: {
    type: String,             // 'story_completion' | 'automatic' | 'event' | 'admin_grant'
    sourceId: String,
    sourceName: String,
    details: String
  },

  progress: {
    current: Number,          // current progress
    target: Number,           // target for completion
    isCompleted: Boolean
  },

  category: String,           // 'story' | 'social' | 'special' | 'milestone'
  rarity: String,             // 'common' | 'rare' | 'epic' | 'legendary'
  pointsAwarded: Number,

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ userId: 1, achievementId: 1 }` (unique)
- `{ userId: 1, unlockedAt: -1 }`
- `{ achievementId: 1, unlockedAt: -1 }`
- `{ category: 1, rarity: 1 }`

---

### 3. UserFavorites

Separate collection for user favorites to enable rich metadata and efficient queries.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  storyId: ObjectId,          // references Stories

  addedAt: Date,

  storyInfo: {
    title: String,
    description: String,
    genre: String,
    coverImageUrl: String,
    author: String,
    averageRating: Number,
    totalPlayers: Number,
    isPublished: Boolean,
    tags: [String]
  },

  userInteraction: {
    lastViewedAt: Date,
    viewCount: Number,
    hasPlayed: Boolean,
    hasCompleted: Boolean,
    userRating: Number,
    hasReviewed: Boolean
  },

  category: String,           // 'favorite' | 'want_to_play' | 'bookmark'
  tags: [String],             // user-defined tags

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ userId: 1, storyId: 1 }` (unique)
- `{ userId: 1, category: 1, addedAt: -1 }`
- `{ storyId: 1, addedAt: -1 }`
- `{ userId: 1, "userInteraction.hasPlayed": 1 }`

---

### 4. Stories

Interactive story content and metadata.

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,

  // Soft Delete Fields
  deletedAt: Date,
  deletedBy: ObjectId,
  deleteReason: String,

  metadata: {
    genre: String,            // references Genres.slug
    tags: [String],
    author: String,
    createdAt: Date,
    updatedAt: Date,
    publishedAt: Date,
    isPublished: Boolean,
    isComingSoon: Boolean,
    isNew: Boolean,
    isPopular: Boolean,
    launchDate: Date,
    contentRating: {
      ageRating: Number,      // 0, 13, 16, 18+
      violenceLevel: String,  // 'none' | 'mild' | 'moderate' | 'high'
      contentWarnings: [String]
    }
  },

  media: {
    coverImageAssetId: String,
    headerImageAssetId: String,
    coverVideoAssetId: String,
    bgMusicAssetId: String,
    galleryAssetIds: [String],
    coverImageUrl: String,
    headerImageUrl: String,
    coverVideoUrl: String,
    bgMusicUrl: String
  },

  stats: {
    totalPlayers: Number,
    averageRating: Number,
    totalRatings: Number,
    averagePlaytime: Number,
    estimatedDuration: String,
    totalEndings: Number,
    totalChoices: Number,
    totalNodes: Number
  },

  content: {
    startingNodeId: String,
    nodes: [ObjectId]         // references StoryNodes
  },

  moderation: {
    status: String,           // 'approved' | 'pending' | 'suspended' | 'removed'
    reportCount: Number,
    moderatedBy: ObjectId,
    moderatedAt: Date,
    reason: String
  }
}
```

**Indexes**:
- `metadata.genre`
- `metadata.isPublished`
- `metadata.isComingSoon`
- `metadata.contentRating.ageRating`
- `deletedAt` (sparse)
- `moderation.status`
- `stats.totalPlayers` (descending)
- `stats.averageRating` (descending)

---

### 5. StoryNodes

Individual story nodes with content and choices.

```javascript
{
  _id: ObjectId,
  storyId: ObjectId,          // references Stories
  nodeId: String,             // unique within story

  segments: [{
    type: String,             // 'text' | 'image' | 'video'
    url: String,
    text: String,
    duration: Number          // auto-advance duration in ms
  }],

  media: {
    bgMusicAssetId: String,
    backgroundImageAssetId: String,
    bgMusicUrl: String,
    backgroundImageUrl: String
  },

  choices: [{
    id: String,
    text: String,
    nextNodeId: String,
    requirements: {
      achievementId: String,
      minCredits: Number,
      playedStoryId: String
    },
    costs: {
      credits: Number
    }
  }],

  rewards: {
    achievementId: String,
    credits: Number,
    avatarIds: [String]       // references Avatars.avatarId
  },

  isEnding: Boolean,
  endingData: {
    title: String,
    description: String,
    type: String,             // 'good' | 'bad' | 'neutral'
    isSecret: Boolean,
    isRare: Boolean
  },

  analytics: {
    totalVisits: Number,
    choiceDistribution: [{
      choiceId: String,
      count: Number
    }]
  },

  layout: {                  // for visual editor
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },

  editorMetadata: {
    createdBy: ObjectId,
    lastModifiedBy: ObjectId,
    editorVersion: String,
    lastEditorAction: String
  }
}
```

**Indexes**:
- `storyId`
- `nodeId` + `storyId` (unique)
- `isEnding`

---

### 6. UserStoryProgress

User progress tracking for individual stories.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  storyId: ObjectId,          // references Stories
  status: String,             // 'in_progress' | 'completed' | 'abandoned'

  currentPlaythrough: {
    number: Number,
    startedAt: Date,
    currentNodeId: String,
    choices: [{
      nodeId: String,
      choiceId: String,
      timestamp: Date
    }],
    playtime: Number,         // time in this playthrough (ms)
    creditsSpent: Number
  },

  totalStats: {
    totalPlaytime: Number,    // across all playthroughs (ms)
    totalCreditsSpent: Number,
    totalPlaythroughs: Number
  },

  unlockedEndings: [{
    endingNodeId: String,
    unlockedAt: Date,
    playthroughNumber: Number
  }],

  achievements: [String],     // unlocked during this story

  ratings: {
    userRating: Number,       // 1-5
    reviewText: String,
    ratedAt: Date,
    reviewUpdatedAt: Date
  },

  favorites: {
    isFavorite: Boolean,
    addedAt: Date
  },

  createdAt: Date,
  updatedAt: Date,
  lastPlayedAt: Date
}
```

**Indexes**:
- `userId` + `storyId` (unique)
- `userId` + `status`
- `storyId` + `status`
- `updatedAt`

---

### 7. Achievements

System-wide achievement definitions.

```javascript
{
  _id: ObjectId,
  achievementId: String,      // unique identifier
  title: String,
  description: String,
  icon: String,               // emoji or icon URL
  category: String,           // 'story' | 'social' | 'special' | 'milestone'
  type: String,               // 'automatic' | 'conditional' | 'hidden'

  conditions: {
    storiesCompleted: Number,
    storiesInGenre: { genre: String, count: Number },
    specificStoryId: String,
    allEndingsInStory: String,
    reviewsWritten: Number,
    totalPlaytime: Number,
    creditsSpent: Number,
    loginStreak: Number
  },

  rewards: {
    creditBonus: Number,
    maxCreditIncrease: Number,
    avatarUnlocks: [String]   // avatar IDs
  },

  rarity: String,             // 'common' | 'rare' | 'epic' | 'legendary'
  isActive: Boolean,
  sortOrder: Number,
  createdAt: Date
}
```

**Indexes**:
- `achievementId` (unique)
- `category`
- `type`
- `isActive`

---

### 8. Avatars

Avatar definitions and unlock conditions.

```javascript
{
  _id: ObjectId,
  avatarId: String,           // unique identifier
  name: String,
  description: String,
  imageUrl: String,
  thumbnailUrl: String,

  unlockType: String,         // 'free' | 'achievement' | 'story_completion' | 'special_event'
  unlockConditions: {
    achievementId: String,
    storyId: String,
    endingId: String,
    completionRate: Number,
    playthroughCount: Number,
    specialEventId: String,
    minLevel: Number
  },

  isActive: Boolean,
  isLimited: Boolean,
  isHidden: Boolean,
  rarity: String,             // 'common' | 'rare' | 'epic' | 'legendary'
  sortOrder: Number,

  totalUnlocks: Number,
  unlockRate: Number,
  firstUnlockedAt: Date,

  category: String,
  tags: [String],
  artist: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `avatarId` (unique)
- `unlockType`
- `isActive`
- `rarity`
- `category`
- `totalUnlocks` (descending)

---

### 9. StoryAssets

Media assets for stories.

```javascript
{
  _id: ObjectId,
  assetId: String,            // unique identifier
  storyId: ObjectId,          // references Stories

  name: String,
  description: String,
  originalFilename: String,

  type: String,               // 'image' | 'audio' | 'video' | 'document'
  mimeType: String,
  url: String,
  thumbnailUrl: String,

  storage: {
    provider: String,         // 'local' | 'aws_s3' | 'google_cloud' | 'cloudflare'
    bucket: String,
    key: String,
    region: String
  },

  size: Number,               // file size in bytes
  dimensions: {               // for images and videos
    width: Number,
    height: Number
  },
  duration: Number,           // for audio/video in seconds

  usage: [{
    context: String,          // 'cover_image' | 'background_music' | 'scene_background'
    nodeId: String,
    sortOrder: Number
  }],

  status: String,             // 'uploading' | 'processing' | 'ready' | 'failed' | 'archived'
  moderation: {
    status: String,           // 'pending' | 'approved' | 'rejected'
    reviewedBy: ObjectId,
    reviewedAt: Date,
    notes: String
  },

  tags: [String],
  category: String,
  uploadedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `assetId` (unique)
- `storyId`
- `type`
- `status`
- `moderation.status`
- `storage.provider`

---

### 10. Genres

Story genre classifications.

```javascript
{
  _id: ObjectId,
  slug: String,               // unique identifier, URL-friendly
  name: String,               // Thai display name
  description: String,
  storyCount: Number,         // Denormalized for performance
  isActive: Boolean,
  sortOrder: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `slug` (unique)
- `isActive`
- `sortOrder`

---

### 11. Reviews

User reviews for stories.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  storyId: ObjectId,          // references Stories
  rating: Number,             // 1-5
  reviewText: String,
  upVotes: Number,
  downVotes: Number,
  isSpoiler: Boolean,

  // Soft Delete Fields
  deletedAt: Date,
  deletedBy: ObjectId,
  deleteReason: String,

  adminReply: {
    text: String,
    adminId: ObjectId,
    repliedAt: Date
  },

  moderation: {
    status: String,           // 'approved' | 'pending' | 'rejected' | 'flagged'
    flaggedCount: Number,
    moderatedBy: ObjectId,
    moderatedAt: Date,
    reason: String
  },

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `userId` + `storyId` (unique)
- `storyId` + `rating`
- `storyId` + `createdAt`
- `deletedAt` (sparse)
- `moderation.status`

---

### 12. CreditTransactions

Credit transaction history.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  transactionType: String,    // 'earn' | 'spend' | 'refund' | 'bonus'
  source: String,             // 'choice' | 'review' | 'achievement' | 'refill' | 'purchase'
  amount: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  relatedId: String,
  description: String,
  metadata: {
    storyTitle: String,
    choiceText: String,
    achievementName: String
  },

  // Soft Delete Fields
  deletedAt: Date,
  deletedBy: ObjectId,
  deleteReason: String,

  createdAt: Date,
  expiresAt: Date             // for temporary credits
}
```

**Indexes**:
- `userId` + `createdAt`
- `transactionType`
- `source`
- `deletedAt` (sparse)

---

### 13. OTPCodes

OTP verification codes.

```javascript
{
  _id: ObjectId,
  email: String,              // indexed for lookup
  code: String,               // 6-digit OTP code
  type: String,               // 'registration' | 'password_reset'
  userId: ObjectId,           // references Users (optional)
  attempts: Number,
  maxAttempts: Number,
  usedAt: Date,
  createdAt: Date,
  expiresAt: Date,            // usually 10 minutes after creation
  ipAddress: String,
  userAgent: String,
  metadata: {
    username: String,
    passwordHash: String,
    displayName: String,
    source: String
  }
}
```

**Indexes**:
- `email` + `type` + `usedAt` (sparse)
- `code` + `expiresAt` (TTL: 24 hours)
- `userId` (sparse)
- `expiresAt` (TTL: 24 hours)

---

### 14. SecurityEvents

Security monitoring and events.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  eventType: String,          // 'failed_login' | 'multiple_failed_attempts' | 'suspicious_ip'
  severity: String,           // 'low' | 'medium' | 'high' | 'critical'
  status: String,             // 'detected' | 'investigating' | 'resolved' | 'false_positive'
  description: String,
  eventDetails: {
    loginAttempts: Number,
    timeWindow: Number,
    ipAddress: String,
    userAgent: String,
    riskScore: Number
  },
  actionTaken: String,        // 'none' | 'account_locked' | 'ip_blocked' | 'admin_notified'
  actionDetails: {
    lockDuration: Number,
    autoUnlockAt: Date,
    requiresManualReview: Boolean
  },
  resolvedBy: ObjectId,
  resolvedAt: Date,
  timestamp: Date
}
```

**Indexes**:
- `userId` + `timestamp`
- `eventType`
- `severity`
- `status`
- `timestamp` (TTL: 2 years)

---

### 15. AdminAccounts

Administrator account management.

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,

  authentication: {
    authMethod: String,       // 'email' | 'google' | 'both'
    googleId: String,
    googleEmail: String,
    googleProfile: {
      displayName: String,
      profileImageUrl: String,
      locale: String
    },
    hasPassword: Boolean,
    lastPasswordChange: Date
  },

  role: String,               // 'Super Admin' | 'Story Editor' | 'User Manager' | 'Achievement Manager'
  permissions: [String],
  status: String,             // 'active' | 'inactive' | 'suspended' | 'pending_verification'
  profile: {
    displayName: String,
    avatar: {
      type: String,
      value: String
    },
    bio: String
  },
  lastActive: Date,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId
}
```

**Indexes**:
- `email` (unique)
- `username` (unique)
- `authentication.googleId` (unique, sparse)
- `authentication.googleEmail` (unique, sparse)
- `role`
- `status`
- `lastActive`

---

## System Collections

### SystemConfig

System configuration and settings.

```javascript
{
  _id: ObjectId,
  key: String,                // unique identifier
  value: Mixed,
  description: String,
  category: String,           // 'game' | 'security' | 'payment' | 'feature'
  isPublic: Boolean,
  lastModifiedBy: ObjectId,
  lastModifiedAt: Date
}
```

**Default configurations**:
- `CREDIT_REFILL_INTERVAL`: 300000 (5 minutes in ms)
- `DEFAULT_MAX_CREDITS`: 100
- `CHOICE_COST`: 1
- `REVIEW_BONUS_CREDITS`: 5
- `OTP_EXPIRE_MINUTES`: 10
- `OTP_MAX_ATTEMPTS`: 3
- `OTP_RESEND_COOLDOWN_SECONDS`: 60

---

## Authentication Examples

### Email Registration Flow

1. **Initial Registration**: User document created with `emailVerified: false`
2. **OTP Generation**: Code stored in `OTPCodes` collection
3. **Verification**: After successful OTP, set `emailVerified: true`

### Password Reset Flow

1. **Request**: Generate OTP in `OTPCodes` with type `password_reset`
2. **Verification**: Verify OTP code
3. **Reset**: Update user password hash

### Google OAuth Registration

1. **Registration**: User created with `authMethod: 'google'` and `emailVerified: true`
2. **Profile**: Auto-populate from Google profile data
3. **Avatar**: Set avatar type to `'google'` with profile image URL

---

## Query Patterns

### Common Queries

**Get user's achievements with details**:
```javascript
db.UserAchievements.aggregate([
  { $match: { userId: ObjectId("user_id") } },
  { $sort: { unlockedAt: -1 } },
  { $limit: 20 },
  { $lookup: {
    from: "Achievements",
    localField: "achievementId",
    foreignField: "achievementId",
    as: "achievement"
  }}
]);
```

**Get user's favorite stories by genre**:
```javascript
db.UserFavorites.find({
  userId: ObjectId("user_id"),
  "storyInfo.genre": "romance"
}).sort({ addedAt: -1 });
```

**Get user's unlocked avatars**:
```javascript
const user = db.users.findOne(
  { _id: ObjectId("user_id") },
  { "gameStats.unlockedAvatars": 1 }
);

const avatarIds = user.gameStats.unlockedAvatars.map(ua => ua.avatarId);
return db.avatars.find({
  avatarId: { $in: avatarIds },
  isActive: true
});
```

**Find published stories for specific age rating**:
```javascript
db.stories.find({
  "metadata.isPublished": true,
  "metadata.contentRating.ageRating": { $lte: 16 },
  deletedAt: null
}).sort({ "stats.averageRating": -1 });
```

### Soft Delete Patterns

**Find active records only**:
```javascript
db.users.find({ deletedAt: null });
db.stories.find({ deletedAt: null, "metadata.isPublished": true });
db.reviews.find({ storyId: ObjectId("..."), deletedAt: null });
```

**Soft delete implementation**:
```javascript
db.users.updateOne(
  { _id: userId },
  {
    $set: {
      deletedAt: new Date(),
      deletedBy: adminId,
      deleteReason: "User request - GDPR deletion"
    }
  }
);
```

---

## Content Rating System

### Age Rating Scale
- **0**: General audiences, all ages
- **13**: Recommended for 13+, mild content
- **16**: Recommended for 16+, moderate content
- **18**: Adults only (18+), mature content

### Violence Level Scale
- **'none'**: No violence at all
- **'mild'**: Fantasy/cartoon violence, light conflicts
- **'moderate'**: Realistic violence, some blood
- **'high'**: Graphic violence, gore, intense scenes

### Content Warnings
Specific content types: `['sexual_content', 'drug_use', 'strong_language', 'horror', 'psychological', 'gambling']`

---

## Performance Considerations

### Indexing Strategy
- Compound indexes for common query patterns
- Sparse indexes for optional fields
- TTL indexes for temporary data (sessions, analytics, OTP codes)

### Data Optimization
- Separate collections for unbounded arrays (achievements, favorites)
- ID-only references to avoid data duplication
- Denormalized counts for frequently accessed aggregates
- Soft delete implementation for data retention

### Query Optimization
- Use projection to limit returned fields
- Implement pagination for large result sets
- Leverage compound indexes for complex filters
- Consider aggregation pipelines for complex reporting

---

## Security Considerations

### Data Protection
- Encryption for sensitive fields (passwords, PII)
- Field-level security for admin-only data
- Audit logs for admin actions
- Rate limiting for API endpoints

### Access Control
- Role-based permissions (user, moderator, admin)
- Row-level security for user data
- Account status management (suspended, banned, locked)
- Automatic security detection and response

### Privacy Compliance
- Data anonymization for analytics
- Right to deletion (soft delete implementation)
- Consent management for data processing
- Security event monitoring and logging

---

## Database Relationships

### Entity Relationship Diagram

```mermaid
erDiagram
    Users ||--o{ UserStoryProgress : "has progress"
    Users ||--o{ UserAchievements : "earns"
    Users ||--o{ UserFavorites : "favorites"
    Users ||--o{ Reviews : "writes"
    Users ||--o{ CreditTransactions : "owns"
    Users ||--o{ OTPCodes : "receives"
    Users ||--o{ SecurityEvents : "triggers"

    Stories ||--o{ StoryNodes : "contains"
    Stories ||--o{ UserStoryProgress : "tracked by"
    Stories ||--o{ Reviews : "receives"
    Stories ||--o{ StoryAssets : "uses"
    Stories }o--|| Genres : "belongs to"

    Achievements ||--o{ UserAchievements : "unlocked by"
    Achievements ||--o{ Avatars : "rewards"

    StoryNodes ||--o{ StoryAssets : "references"

    Reviews ||--o{ ReviewVotes : "receives"
    Reviews ||--o{ ReviewFlags : "flagged in"

    AdminAccounts ||--o{ AdminLogs : "creates"
    AdminAccounts ||--o{ AdminLoginHistory : "logs"

    SystemConfig ||--o{ "System Wide" : "configures"

    Users {
        ObjectId _id PK
        String email UK
        String username UK
        String passwordHash
        Object profile
        Object authentication
        Object accountStatus
        Object gameStats
        Object settings
        Object adminMetadata
        Date deletedAt
    }

    UserAchievements {
        ObjectId _id PK
        ObjectId userId FK
        String achievementId FK
        Date unlockedAt
        Object unlockSource
        Object progress
        String category
        String rarity
        Number pointsAwarded
    }

    UserFavorites {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId storyId FK
        Date addedAt
        Object storyInfo
        Object userInteraction
        String category
        Array tags
    }

    Stories {
        ObjectId _id PK
        String title
        String description
        Object metadata
        Object media
        Object stats
        Object content
        Object moderation
        Date deletedAt
    }

    StoryNodes {
        ObjectId _id PK
        ObjectId storyId FK
        String nodeId
        Array segments
        Array choices
        Object rewards
        Boolean isEnding
        Object endingData
    }

    Achievements {
        ObjectId _id PK
        String achievementId UK
        String title
        String description
        String icon
        String category
        String type
        Object conditions
        Object rewards
        String rarity
    }

    Avatars {
        ObjectId _id PK
        String avatarId UK
        String name
        String description
        String imageUrl
        String unlockType
        Object unlockConditions
        Boolean isActive
    }

    Genres {
        ObjectId _id PK
        String slug UK
        String name
        String description
        Number storyCount
    }
```

### User-Centric Relationships

```mermaid
graph TD
    User[Users] --> Auth[Authentication]

    User --> Progress[UserStoryProgress]
    Progress --> Stories[Stories]

    User --> Achievements[UserAchievements]
    Achievements --> AchievementDefs[Achievements]

    User --> Favorites[UserFavorites]
    Favorites --> Stories

    User --> Credits[CreditTransactions]

    User --> Reviews[Reviews]
    Reviews --> Stories

    User --> AvatarSystem[Avatar System]
    AvatarSystem --> Avatars[Avatars]
    AchievementDefs --> Avatars

    User --> Security[SecurityEvents]
    User --> OTP[OTPCodes]

    Stories --> Nodes[StoryNodes]
    Stories --> Assets[StoryAssets]
    Stories --> Genres[Genres]

    style User fill:#e1f5fe
    style Stories fill:#f3e5f5
    style AchievementDefs fill:#fff3e0
```

### Story System Flow

```mermaid
flowchart LR
    Author[Admin/User] -->|Creates| Story[Stories]

    Story -->|Contains| Nodes[StoryNodes]
    Story -->|Uses| Assets[StoryAssets]
    Story -->|Belongs to| Genre[Genres]

    User[Users] -->|Plays| Progress[UserStoryProgress]
    Progress -->|Tracks| Story

    User -->|Writes| Review[Reviews]
    Review -->|Rates| Story

    Progress -->|Unlocks| Achievement[UserAchievements]
    Achievement -->|References| AchievementDefs[Achievements]

    User -->|Favorites| Favorites[UserFavorites]
    Favorites -->|References| Story

    Nodes -->|May reward| AchievementDefs
    AchievementDefs -->|May unlock| Avatars[Avatars]

    User -->|Earns| Credits[CreditTransactions]
    Progress -->|Consumes| Credits

    style Story fill:#e8f5e8
    style User fill:#fff0f5
    style Progress fill:#fff8dc
```

### Primary Relationships
- **User** 1:N **UserStoryProgress** (user's progress in stories)
- **User** 1:N **UserAchievements** (user's achievements)
- **User** 1:N **UserFavorites** (user's favorites)
- **User** 1:N **Review** (user's reviews)
- **Story** 1:N **StoryNode** (story content)
- **Story** 1:N **Review** (story's reviews)
- **Story** 1:N **UserStoryProgress** (all users playing this story)

### References and Lookups
- User achievements → `Achievements` collection via `achievementId`
- User avatars → `Avatars` collection via `avatarId`
- Story requirements → `StoryNodes` with conditional logic
- Achievement unlocks → update `UserAchievements` collection
- Story genres → `Genres` collection (`Stories.metadata.genre` references `Genres.slug`)

---

## Avatar System Queries & Unlock Management

### Query Unlocked Avatars for a User

**Get all unlocked avatars with details**:
```javascript
async function getUserUnlockedAvatars(userId) {
  const user = await db.users.findOne(
    { _id: userId },
    { "gameStats.unlockedAvatars": 1 }
  );

  if (!user || !user.gameStats.unlockedAvatars.length) {
    return [];
  }

  const avatarIds = user.gameStats.unlockedAvatars.map(ua => ua.avatarId);

  return await db.avatars.find({
    avatarId: { $in: avatarIds },
    isActive: true
  }).sort({ sortOrder: 1 });
}
```

**Get avatars with unlock status**:
```javascript
async function getAvatarsWithUnlockStatus(userId) {
  const user = await db.users.findOne(
    { _id: userId },
    { "gameStats.unlockedAvatars.avatarId": 1 }
  );

  const unlockedIds = user?.gameStats.unlockedAvatars.map(ua => ua.avatarId) || [];

  const allAvatars = await db.avatars.find({ isActive: true });

  return allAvatars.map(avatar => {
    const isUnlocked = unlockedIds.includes(avatar.avatarId);
    const unlockInfo = user?.gameStats.unlockedAvatars.find(
      ua => ua.avatarId === avatar.avatarId
    );

    return {
      ...avatar.toObject(),
      isUnlocked,
      canUnlock: checkUnlockConditions(user, avatar),
      unlockInfo
    };
  });
}
```

### Avatar Analytics and Management

**Get most popular avatars**:
```javascript
async function getPopularAvatars(limit = 10) {
  return await db.avatars.find(
    { isActive: true },
    { sort: { totalUnlocks: -1 }, limit }
  );
}
```

### Additional Collections

### 16. UserSessions

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  sessionToken: String,       // JWT token ID
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String,
    ip: String
  },
  authentication: {
    authMethod: String,       // 'email' | 'google' | 'guest'
    oauthProvider: String,    // 'google', null for email/guest
    oauthAccessToken: String, // encrypted, for API calls
    oauthRefreshToken: String, // encrypted, for token refresh
    oauthExpiresAt: Date
  },
  isActive: Boolean,
  lastActivity: Date,
  createdAt: Date,
  expiresAt: Date
}
```

**Indexes**:
- `sessionToken` (unique)
- `userId` + `isActive`
- `expiresAt`

### 17. Analytics

```javascript
{
  _id: ObjectId,
  eventType: String,          // 'story_start' | 'story_complete' | 'choice' | 'achievement_unlock'
  userId: ObjectId,           // can be null for anonymous
  storyId: ObjectId,          // null for non-story events
  nodeId: String,             // for choice events
  choiceId: String,           // for choice events
  metadata: {
    timeSpent: Number,
    pathTaken: [String],
    endingType: String,
    deviceType: String,
    sessionId: String
  },
  timestamp: Date,
  sessionId: String,
  ip: String,                 // anonymized
  userAgent: String
}
```

**Indexes**:
- `eventType`
- `userId` + `timestamp`
- `storyId` + `eventType`
- `timestamp` (TTL: 90 days)

### 18. ReviewVotes

```javascript
{
  _id: ObjectId,
  reviewId: ObjectId,         // references Reviews
  userId: ObjectId,           // references Users
  voteType: String,           // 'up' | 'down'
  createdAt: Date
}
```

**Indexes**:
- `reviewId` + `userId` (unique)
- `userId`

### 19. ReviewFlags

```javascript
{
  _id: ObjectId,
  reviewId: ObjectId,         // references Reviews
  userId: ObjectId,           // user who flagged
  reason: String,             // 'spam' | 'harassment' | 'offensive' | 'spoiler' | 'other'
  detail: String,             // optional additional details
  status: String,             // 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewedBy: ObjectId,       // admin who reviewed this flag
  reviewedAt: Date,
  createdAt: Date
}
```

**Indexes**:
- `reviewId`
- `userId`
- `status` + `createdAt`
- `reviewId` + `userId` (unique)

### 20. StoryFlags

```javascript
{
  _id: ObjectId,
  storyId: ObjectId,          // references Stories
  userId: ObjectId,           // user who reported the story
  reason: String,             // 'inappropriate_content' | 'copyright' | 'malware' | 'spam' | 'misinformation' | 'other'
  detail: String,             // optional additional details
  status: String,             // 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewedBy: ObjectId,       // admin who reviewed this report
  reviewedAt: Date,
  createdAt: Date
}
```

**Indexes**:
- `storyId`
- `userId`
- `status` + `createdAt`
- `storyId` + `userId` (unique)

### 21. AdminLoginHistory

```javascript
{
  _id: ObjectId,
  adminId: ObjectId,          // references AdminAccounts

  loginTime: Date,
  method: String,             // 'email' | 'google'
  success: Boolean,

  ip: String,
  userAgent: String,

  location: {
    country: String,
    city: String,
    timezone: String
  },

  sessionId: String,
  sessionExpiresAt: Date,

  failureReason: String,      // if success: false

  createdAt: Date
}
```

**Indexes**:
- `adminId` + `loginTime`
- `ip`
- `success`
- `createdAt` (TTL: 2 years)

### 22. AdminLogs

```javascript
{
  _id: ObjectId,

  adminId: ObjectId,
  adminName: String,
  role: String,

  action: String,             // Description of action
  target: String,             // What was affected (user ID, story ID, etc.)
  targetType: String,         // 'story' | 'user' | 'system' | 'finance'

  changeDetails: {
    before: Object,
    after: Object
  },

  ip: String,
  userAgent: String,
  sessionId: String,

  timestamp: Date
}
```

**Indexes**:
- `adminId`
- `targetType`
- `timestamp`
- `action`

---

## Account Status Management

### Account Status Types

**'active'**: Normal user account with full access
- Can login, play stories, write reviews
- Earns credits normally
- Standard user experience

**'suspended'**: Temporary account restriction
- Cannot login or access services
- Account data preserved
- Temporary suspension with end date
- Often used for first offenses

**'banned'**: Permanent account termination
- Cannot login or create new accounts
- Account data archived for legal purposes
- Permanent removal from platform
- Used for severe violations

**'under_review'**: Account being investigated
- Limited access during investigation
- Can view content but not interact
- Temporary status pending admin decision
- Used for suspicious activity

**'locked'**: Automatic security lock
- Cannot login temporarily
- Automatic detection and response
- Can auto-expire or require manual review
- Used for immediate security threats
- Different lock types for different scenarios

### Status Differences: Suspended vs Banned vs Locked

| Aspect | **Suspended** | **Banned** | **Locked** |
|--------|---------------|------------|------------|
| **Who Initiates** | Admin/Manual | Admin/Manual | System/Automatic |
| **Duration** | Temporary (specified) | Permanent | Temporary (auto) |
| **Reason** | Policy violations | Severe abuse | Suspicious activity |
| **Data Access** | Preserved | Archived | Preserved |
| **Can Create New Account** | Yes | No | Yes (after lock) |
| **Review Process** | Admin decision | Final | Auto or Admin review |
| **Typical Duration** | Days to weeks | Forever | Hours to days |

### Account Status Examples

**Suspended User (Temporary)**:
```javascript
{
  email: "suspicious@example.com",
  username: "user123",
  accountStatus: {
    status: "suspended",
    reason: "Multiple review spam violations",
    moderatedBy: ObjectId("admin_001"),
    moderatedAt: new Date("2024-01-15T14:30:00Z"),
    notes: "User posted 15 identical reviews within 2 minutes. First offense, 7-day suspension.",
    suspensionEndsAt: new Date("2024-01-22T14:30:00Z")
  }
}
```

**Banned User (Permanent)**:
```javascript
{
  email: "banned@example.com",
  username: "cheater999",
  accountStatus: {
    status: "banned",
    reason: "Credit system exploitation and harassment",
    moderatedBy: ObjectId("admin_002"),
    moderatedAt: new Date("2024-01-10T09:15:00Z"),
    notes: "User exploited credit system bug to gain infinite credits. Sent threatening messages to other users. Permanent ban."
  }
}
```

**Automatically Locked User (Security)**:
```javascript
{
  email: "failedlogin@example.com",
  username: "hacker123",
  accountStatus: {
    status: "locked",
    reason: "Multiple failed login attempts detected",
    moderatedBy: null, // automatic lock
    moderatedAt: new Date("2024-01-18T03:15:00Z"),
    notes: "10 failed password attempts within 5 minutes from unusual IP address.",
    lockType: "auto_security",
    lockExpiresAt: new Date("2024-01-18T04:15:00Z"), // 1-hour lock
    lastActivityRisk: {
      level: "high",
      score: 85,
      detectedAt: new Date("2024-01-18T03:15:00Z"),
      triggers: ["multiple_failed_attempts", "unusual_ip", "rapid_attempts"]
    }
  }
}
```

---

## Automatic Security Detection & Response System

### Security Triggers and Thresholds

**1. Failed Login Attempts**:
```javascript
const securityConfig = {
  failedLoginThresholds: [
    { attempts: 3, windowMinutes: 1, lockDurationMinutes: 5 },
    { attempts: 5, windowMinutes: 5, lockDurationMinutes: 15 },
    { attempts: 10, windowMinutes: 15, lockDurationMinutes: 60 },
    { attempts: 20, windowMinutes: 60, lockDurationMinutes: 1440 } // 24 hours
  ]
}
```

**2. Unusual Activity Patterns**:
```javascript
const suspiciousPatterns = {
  rapidLogins: { count: 20, windowMinutes: 5 },
  multipleIPs: { count: 5, windowMinutes: 30 },
  rapidStoryCompletion: { storiesPerHour: 10, normalRate: 2 },
  creditExploitation: { creditsPerHour: 100, normalRate: 10 },
  reviewSpam: { reviewsPerHour: 20, windowMinutes: 60 }
}
```

### Automatic Lock Implementation

**Failed Login Detection**:
```javascript
async function detectFailedLoginAttempts(email, ipAddress) {
  const recentFailures = await db.SecurityEvents.find({
    $or: [
      { userId: user._id },
      { "eventDetails.ipAddress": ipAddress }
    ],
    eventType: "failed_login",
    timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
  }).sort({ timestamp: -1 });

  for (const threshold of securityConfig.failedLoginThresholds) {
    const recentCount = recentFailures.filter(f =>
      Date.now() - f.timestamp.getTime() < threshold.windowMinutes * 60 * 1000
    ).length;

    if (recentCount >= threshold.attempts) {
      return await lockAccount(user._id, "multiple_failed_attempts", {
        lockDurationMinutes: threshold.lockDurationMinutes,
        lockType: "auto_security",
        details: {
          attempts: recentCount,
          window: threshold.windowMinutes,
          ipAddress: ipAddress
        }
      });
    }
  }
}
```

---

## Data Flow Examples

### 1. User Story Playthrough
1. Create `UserStoryProgress` document
2. Track each node visit and choice in `progress.choices`
3. Update `UserStoryProgress.currentNodeId`
4. Create `CreditTransaction` for each choice
5. On completion, update `User.gameStats`
6. Check and unlock achievements

### Soft Delete Query Patterns

Critical collections use soft deletes with `deletedAt` field:

**Find Active Users Only**:
```javascript
db.users.find({
  deletedAt: { $eq: null }
})
```

**Find Active Stories**:
```javascript
db.stories.find({
  deletedAt: { $eq: null },
  "metadata.isPublished": true
})
```

**Find Active Reviews for a Story**:
```javascript
db.reviews.find({
  storyId: ObjectId("..."),
  deletedAt: { $eq: null }
})
```

**Soft Delete Implementation**:
```javascript
// Delete user
db.users.updateOne(
  { _id: userId },
  {
    $set: {
      deletedAt: new Date(),
      deletedBy: adminId,
      deleteReason: "User request - GDPR deletion"
    }
  }
);

// Restore story
db.stories.updateOne(
  { _id: storyId },
  {
    $unset: {
      deletedAt: 1,
      deletedBy: 1,
      deleteReason: 1
    }
  }
);
```

### 2. Achievement Unlock
1. Check conditions against user's data
2. Add to `UserAchievements` collection
3. Create `CreditTransaction` for bonus credits
4. Create analytics event in `Analytics` collection

### 3. Review Submission
1. Create `Review` document
2. Update `Story.stats.averageRating`
3. Check if first review for bonus credits
4. Create `CreditTransaction` if bonus applies

---

## Performance Considerations

### Indexing Strategy
1. **Compound indexes** for common query patterns
2. **Sparse indexes** for optional fields (OAuth IDs)
3. **TTL indexes** for temporary data (sessions, analytics)

### Data Partitioning
1. **Time-based sharding** for analytics data
2. **User-based sharding** for large-scale deployments

### Caching Strategy
Since the system runs on a single instance, we'll use in-memory application caching:

1. **Application-level caching** using Node.js in-memory storage:
   - User sessions (Map/Cache structure)
   - Story metadata (Map/Cache structure with TTL)
   - Achievement definitions (static cache on startup)
   - System configurations (fetched on startup, refreshed periodically)
   - Active stories (LRU cache for frequently accessed stories)
   - User progress (temporarily cached during active playthrough)

2. **Cache Implementation Considerations**:
   - Use Node.js built-in `Map` or dedicated caching libraries like `node-cache`
   - Implement TTL (Time To Live) for cached items
   - Set appropriate cache size limits to prevent memory issues
   - Cache warming on application startup for frequently accessed data
   - Cache invalidation strategy for data updates

3. **Memory Management**:
   - Monitor memory usage and adjust cache sizes accordingly
   - Implement cleanup for expired cache entries
   - Use weak references where appropriate for large objects

---

## Security Considerations

### Data Protection
1. **Encryption** for sensitive fields (passwords, PII)
2. **Field-level security** for admin-only data
3. **Audit logs** for admin actions

### Access Control
1. **Role-based permissions** (user, moderator, admin)
2. **Row-level security** for user data
3. **API rate limiting** to prevent abuse

### Privacy Compliance
1. **Data anonymization** for analytics
2. **Right to deletion** (GDPR compliance)
3. **Consent management** for data processing

---

## Authentication Flow Examples

### 1. Email Registration with OTP Verification

**Step 1: Initial Registration (Before OTP)**:
```javascript
// User document created but not verified
{
  email: "user@example.com",
  username: "user123",
  passwordHash: "$2b$10$...",
  authentication: {
    authMethod: "email",
    isGuest: false,
    emailVerified: false,
    hasPassword: true
  }
}
```

**Step 2: OTP Code Generated**:
```javascript
// OTP code in OTPCodes collection
{
  _id: ObjectId("..."),
  email: "user@example.com",
  code: "123456",
  type: "registration",
  userId: ObjectId("..."),
  attempts: 0,
  maxAttempts: 3,
  usedAt: null,
  createdAt: new Date("2024-01-15T10:00:00Z"),
  expiresAt: new Date("2024-01-15T10:10:00Z"),
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0..."
}
```

**Step 3: After Successful OTP Verification**:
```javascript
// User document updated
{
  email: "user@example.com",
  username: "user123",
  passwordHash: "$2b$10$...",
  authentication: {
    authMethod: "email",
    isGuest: false,
    emailVerified: true,
    hasPassword: true
  }
}
```

### 2. Password Reset with OTP

**Step 1: User Requests Password Reset**:
```javascript
// OTP code generated for password reset
{
  _id: ObjectId("..."),
  email: "user@example.com",
  code: "789012",
  type: "password_reset",
  userId: ObjectId("..."),
  attempts: 0,
  maxAttempts: 3,
  usedAt: null,
  createdAt: new Date("2024-01-15T11:00:00Z"),
  expiresAt: new Date("2024-01-15T11:10:00Z")
}
```

### 3. Google OAuth Registration
```javascript
// User document for Google OAuth
{
  email: "user@gmail.com",
  username: "user_gmail",
  passwordHash: null,
  profile: {
    displayName: "John Doe",
    profileImageUrl: "https://lh3.googleusercontent.com/...",
    avatar: {
      type: "google",
      value: "https://lh3.googleusercontent.com/..."
    }
  },
  authentication: {
    authMethod: "google",
    isGuest: false,
    googleId: "1234567890",
    emailVerified: true,
    hasPassword: false
  }
}
```

### 4. Guest User
```javascript
// User document for guest user
{
  email: null,
  username: "guest_" + randomString,
  passwordHash: null,
  authentication: {
    authMethod: "guest",
    isGuest: true,
    emailVerified: false,
    hasPassword: false
  }
}
```

---

## OTP Security and Rate Limiting

### OTP Rate Limiting Logic
Rate limiting is managed through the `OTPCodes` collection:

1. **Per Email Rate Limit**: Maximum 5 OTP requests per hour per email
2. **Cooldown Period**: 60 seconds between resend requests
3. **Attempt Limit**: Maximum 3 failed attempts per OTP code
4. **Auto Expiration**: OTP codes expire after 10 minutes
5. **Auto Cleanup**: OTP documents automatically deleted after 24 hours (TTL)

### Security Features
- **IP Address Tracking**: Track which IPs request OTP codes in `OTPCodes`
- **Device Fingerprinting**: Prevent automated attacks via `OTPCodes.userAgent`
- **Attempt Monitoring**: Block after maximum failed attempts per OTP code
- **Unique Request IDs**: Track password reset flows in `OTPCodes.metadata`
- **Centralized Management**: All OTP data in one collection for consistent security

---
