# TalePick Database Design

> **Thai-language interactive story platform** • MongoDB • Single Instance Architecture

---

## 🚀 Quick Overview

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

## 📊 Database Overview

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

## 🗂️ Collections Overview

### User Management (5 collections)

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| **Users** | Core user data | Multi-auth, soft delete, account status |
| **UserAchievements** | Achievement tracking | Separate from users for scalability |
| **UserAvatars** | Avatar ownership | Unlock tracking, usage analytics |
| **UserFavorites** | Story favorites | Rich metadata and interaction tracking |
| **UserStoryProgress** | Game progress | Multiple playthroughs, choice tracking |

### Content System (5 collections)

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| **Stories** | Story metadata | Content rating, moderation, media assets, gallery |
| **StoryNodes** | Story content | Branching choices, rewards, endings |
| **StoryAssets** | Media files | Multi-storage support, moderation |
| **StoryGallery** | Story image gallery | Cached URLs, metadata, ordering |
| **Genres** | Story categories | Thai language support |

### Game Mechanics (3 collections)

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| **Achievements** | Achievement definitions | Multiple types, rarity system |
| **Avatars** | User avatars | Unlock conditions, usage tracking |
| **CreditTransactions** | Credit economy | Transaction history, expiration |

### Community & Moderation (4 collections)

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| **Reviews** | User reviews | Voting, moderation, spoiler flags |
| **ReviewVotes** | Review voting | Up/down voting system |
| **ReviewFlags** | Review reporting | Community moderation |
| **StoryFlags** | Story reporting | Content reporting system |

### Security & Admin (6 collections)

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| **SecurityEvents** | Security monitoring | Automatic detection, response |
| **AdminAccounts** | Admin users | Role-based permissions |
| **AdminLoginHistory** | Admin tracking | Login history, security |
| **AdminLogs** | Admin actions | Audit trail |
| **OTPCodes** | Email verification | Rate limiting, security |
| **UserSessions** | Session management | Device tracking, OAuth |

### Analytics & Monitoring (1 collection)

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| **Analytics** | Event tracking | User behavior, story analytics, TTL cleanup |

### System Configuration (1 collection)

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| **SystemConfig** | System settings | Runtime configuration, feature flags |

**Total Collections**: 24 collections covering all aspects of the TalePick platform

---

## 📋 Detailed Schemas

### 1. Users Collection

**Purpose**: Central user authentication and profile management

```javascript
{
  _id: ObjectId,
  email: String,              // unique, indexed
  username: String,           // unique, indexed
  passwordHash: String,       // bcrypt hash (optional for OAuth)

  // Profile Information
  profile: {
    displayName: String,
    avatar: {
      type: String,           // 'default' | 'custom' | 'google'
      value: String           // URL or avatar ID
    },
    bio: String,
    profileImageUrl: String   // from Google profile
  },

  // Authentication Methods
  authentication: {
    authMethod: String,       // 'email' | 'google' | 'guest'
    isGuest: Boolean,
    googleId: String,         // for OAuth, unique indexed
    emailVerified: Boolean,
    hasPassword: Boolean
  },

  // Account Management
  accountStatus: {
    status: String,           // 'active' | 'suspended' | 'banned' | 'under_review' | 'locked'
    reason: String,
    moderatedBy: ObjectId,
    moderatedAt: Date,
    suspensionEndsAt: Date,
    lockType: String,         // 'manual' | 'auto_security' | 'auto_fraud'
    lockExpiresAt: Date
  },

  // Game Statistics
  gameStats: {
    credits: Number,
    maxCredits: Number,
    lastCreditRefill: Date,
    totalStoriesPlayed: Number,
    totalEndingsUnlocked: Number,
    totalAvatarsUnlocked: Number,  // denormalized count from UserAvatars

    currentAvatarId: String,
    createdAt: Date,
    lastLoginAt: Date
  },

  // Soft Delete Support
  deletedAt: Date,
  deletedBy: ObjectId,
  deleteReason: String
}
```

**Key Indexes**:
- `email` (unique)
- `username` (unique)
- `authentication.googleId` (unique, sparse)
- `accountStatus.status`
- `deletedAt` (sparse)

---

### 2. Stories Collection

**Purpose**: Interactive story content and metadata

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,

  // Story Metadata
  metadata: {
    genre: String,            // references Genres.slug
    tags: [String],
    author: String,
    createdAt: Date,
    publishedAt: Date,
    isPublished: Boolean,
    isComingSoon: Boolean,
    launchDate: Date,

    // Content Rating System
    contentRating: {
      ageRating: Number,      // 0, 13, 16, 18+
      violenceLevel: String,  // 'none' | 'mild' | 'moderate' | 'high'
      contentWarnings: [String]
    }
  },

  // Media Assets
  media: {
    coverImageAssetId: String,
    headerImageAssetId: String,
    coverVideoAssetId: String,
    bgMusicAssetId: String,
    coverImageUrl: String,
    headerImageUrl: String,
    coverVideoUrl: String,
    bgMusicUrl: String,
    trailerUrl: String           // YouTube/Vimeo URL for story trailer
  },

  // Story Gallery (references StoryGallery collection)
  gallery: {
    imageIds: [String],         // Array of StoryGallery image IDs
    totalImages: Number,        // Denormalized count for quick access
    featuredImageId: String     // Primary gallery image ID
  },

  // Performance Statistics
  stats: {
    totalPlayers: Number,
    averageRating: Number,
    totalRatings: Number,
    averagePlaytime: Number,
    estimatedDuration: String,
    totalEndings: Number,
    totalChoices: Number
  },

  // Story Structure
  content: {
    startingNodeId: String    // starting node ID - nodes queried from StoryNodes collection
  },

  // Moderation
  moderation: {
    status: String,           // 'approved' | 'pending' | 'suspended' | 'removed'
    reportCount: Number,
    moderatedBy: ObjectId,
    moderatedAt: Date
  },

  // Soft Delete
  deletedAt: Date,
  deletedBy: ObjectId
}
```

**Key Indexes**:
- `title` (text search)
- `metadata.genre`
- `metadata.author`
- `metadata.isPublished` + `metadata.publishedAt`
- `content.startingNodeId` (for finding starting nodes)
- `stats.totalPlayers` (descending)
- `stats.averageRating` (descending)
- `gallery.totalImages` (for filtering stories with galleries)
- `gallery.featuredImageId` (quick featured image lookup)
- `media.trailerUrl` (for stories with trailers)
- `deletedAt` (sparse)
- `moderation.status`

**Query Examples**:
```javascript
// Get story with all its nodes (using StoryNodes collection)
db.Stories.findOne({ _id: ObjectId("story_id") });
db.StoryNodes.find({ storyId: ObjectId("story_id") })
.sort({ nodeId: 1 });

// Get story's starting node
db.Stories.findOne({ _id: ObjectId("story_id") }, { "content.startingNodeId": 1 });
db.StoryNodes.findOne({
  storyId: ObjectId("story_id"),
  nodeId: "starting_node_id"
});

// Get published stories by genre
db.Stories.find({
  "metadata.isPublished": true,
  "metadata.genre": "romance"
}).sort({ "stats.totalPlayers": -1 });

// Get story statistics with node count
db.Stories.aggregate([
  { $match: { _id: ObjectId("story_id") } },
  { $lookup: {
    from: "StoryNodes",
    localField: "_id",
    foreignField: "storyId",
    as: "nodes"
  }},
  { $project: {
    title: 1,
    nodeCount: { $size: "$nodes" },
    totalPlayers: "$stats.totalPlayers",
    averageRating: "$stats.averageRating"
  }}
]);

// Content rating based filtering
db.Stories.find({
  "metadata.isPublished": true,
  "contentRating.ageRating": { $lte: 16 }
}).sort({ "stats.averageRating": -1 });

// Search stories by title with specific content warnings
db.Stories.find({
  $text: { $search: "romance story" },
  "contentRating.contentWarnings": { $nin: ["violence", "horror"] }
}).sort({ score: { $meta: "textScore" } });

// Get stories with gallery images for carousel display
db.Stories.find({
  "metadata.isPublished": true,
  "gallery.totalImages": { $gt: 0 }
})
.select({
  title: 1,
  "media.coverImageUrl": 1,
  "media.trailerUrl": 1,
  "gallery.featuredImageId": 1,
  "stats.averageRating": 1,
  "metadata.genre": 1
});

// Get story with gallery information
db.Stories.aggregate([
  { $match: { _id: ObjectId("story_id") } },
  { $lookup: {
    from: "StoryGallery",
    localField: "gallery.imageIds",
    foreignField: "galleryImageId",
    as: "galleryImages"
  }},
  { $project: {
    title: 1,
    "media.coverImageUrl": 1,
    "media.trailerUrl": 1,
    "stats.averageRating": 1,
    "metadata.genre": 1,
    gallery: {
      totalImages: 1,
      featuredImageId: 1,
      images: {
        $map: {
          input: "$galleryImages",
          as: "img",
          in: {
            galleryImageId: "$$img.galleryImageId",
            name: "$$img.name",
            caption: "$$img.caption",
            urls: "$$img.urls"
          }
        }
      }
    }
  }}
]);
```

**Content Rating Guidelines**:
- **Age 0+**: General audiences
- **Age 13+**: Mild content
- **Age 16+**: Moderate content
- **Age 18+**: Mature content only

---

### 3. UserAchievements Collection

**Purpose**: Completed achievements tracking (only created when achievement is unlocked)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  achievementId: String,      // references Achievements.achievementId

  unlockedAt: Date,           // when achievement was completed
  unlockSource: {
    type: String,             // 'story_completion' | 'automatic' | 'event' | 'admin_grant'
    sourceId: String,         // related source (story ID, event ID, etc.)
    sourceName: String,       // human-readable source name
    details: String           // additional context about completion
  },

  // Achievement metadata (denormalized for performance)
  category: String,           // 'story' | 'social' | 'special' | 'milestone'
  rarity: String,             // 'common' | 'rare' | 'epic' | 'legendary'
  pointsAwarded: Number,
  title: String,              // achievement title
  description: String,        // achievement description
  icon: String,               // achievement icon

  createdAt: Date
}
```

**Key Design Principle**:
- ✅ **Only created on completion** - no progress tracking
- ✅ **Progress calculated dynamically** by checking user activity against achievement conditions
- ✅ **Smaller documents** - no redundant progress data
- ✅ **Better performance** - simpler queries, less storage

**Benefits of Separation**:
- ✅ Prevents unbounded array growth in Users
- ✅ Enables efficient querying and pagination of completed achievements
- ✅ Supports rich completion metadata without progress complexity
- ✅ Better performance for achievement-heavy users
- ✅ Progress calculation handled at application level based on user activity

**Query Examples**:
```javascript
// Get user's completed achievements
db.UserAchievements.find({ userId: ObjectId("user_id") })
.sort({ unlockedAt: -1 });

// Get user's achievements by category
db.UserAchievements.find({
  userId: ObjectId("user_id"),
  category: "story"
}).sort({ rarity: -1, unlockedAt: -1 });

// Get recently unlocked achievements (platform-wide)
db.UserAchievements.find({})
.sort({ unlockedAt: -1 })
.limit(50);

// Check if user has specific achievement
db.UserAchievements.findOne({
  userId: ObjectId("user_id"),
  achievementId: "story_master_100"
});

// Get achievement statistics for user
db.UserAchievements.aggregate([
  { $match: { userId: ObjectId("user_id") } },
  { $group: {
    _id: "$category",
    count: { $sum: 1 },
    totalPoints: { $sum: "$pointsAwarded" },
    rareCount: {
      $sum: { $cond: [{ $in: ["$rarity", ["epic", "legendary"]] }, 1, 0] }
    }
  }},
  { $sort: { count: -1 } }
]);

// Calculate progress for incomplete achievements (application-level)
// This query would check user's activity against achievement conditions
// For example, progress for "Complete 10 Romance Stories":
db.UserProgress.aggregate([
  { $match: {
    userId: ObjectId("user_id"),
    hasCompleted: true
  }},
  { $lookup: {
    from: "Stories",
    localField: "storyId",
    foreignField: "_id",
    as: "story"
  }},
  { $unwind: "$story" },
  { $match: { "story.metadata.genre": "romance" } },
  { $count: "completedRomanceStories" }
]);
```

---

### 4. UserFavorites Collection

**Purpose**: Simple story favorite tracking (pure relationship collection)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  storyId: ObjectId,          // references Stories

  addedAt: Date,              // when user added to favorites
  createdAt: Date
}
```

**Key Design Principle**:
- ✅ **Pure relationship tracking** - just links users to stories they favorited
- ✅ **No denormalized data** - story details fetched via $lookup from Stories collection
- ✅ **Minimal storage** - small documents, optimal for high-volume favoriting
- ✅ **Simple queries** - straightforward relationship queries with joins

**Query Examples**:
```javascript
// Get user's favorite stories with full details
db.UserFavorites.aggregate([
  { $match: { userId: ObjectId("user_id") } },
  { $lookup: {
    from: "Stories",
    localField: "storyId",
    foreignField: "_id",
    as: "story"
  }},
  { $unwind: "$story" },
  { $lookup: {
    from: "UserProgress",
    localField: "storyId",
    foreignField: "storyId",
    let: { userId: "$userId" },
    pipeline: [
      { $match: { $expr: { $eq: ["$userId", "$$userId"] } } }
    ],
    as: "progress"
  }},
  { $project: {
    addedAt: 1,
    story: 1,
    hasPlayed: { $gt: [{ $size: "$progress" }, 0] },
    hasCompleted: {
      $anyElementTrue: {
        $map: {
          input: "$progress",
          as: "p",
          in: "$$p.hasCompleted"
        }
      }
    }
  }},
  { $sort: { addedAt: -1 } }
]);

// Get user's favorites by genre (using $lookup)
db.UserFavorites.aggregate([
  { $match: { userId: ObjectId("user_id") } },
  { $lookup: {
    from: "Stories",
    localField: "storyId",
    foreignField: "_id",
    as: "story"
  }},
  { $unwind: "$story" },
  { $match: { "story.metadata.genre": "romance" } },
  { $sort: { addedAt: -1 } }
]);

// Get most favorited stories (platform-wide)
db.UserFavorites.aggregate([
  { $group: {
    _id: "$storyId",
    favoriteCount: { $sum: 1 },
    firstFavorited: { $min: "$addedAt" }
  }},
  { $sort: { favoriteCount: -1 } },
  { $limit: 20 },
  { $lookup: {
    from: "Stories",
    localField: "_id",
    foreignField: "_id",
    as: "story"
  }},
  { $unwind: "$story" }
]);

// Check if user has favorited specific story
db.UserFavorites.findOne({
  userId: ObjectId("user_id"),
  storyId: ObjectId("story_id")
});

// Remove from favorites
db.UserFavorites.deleteOne({
  userId: ObjectId("user_id"),
  storyId: ObjectId("story_id")
});
```

---

### 5. UserAvatars Collection

**Purpose**: User avatar ownership and usage tracking (separated from Users for scalability)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  avatarId: String,           // references Avatars.avatarId

  // Unlock details
  unlockedAt: Date,
  unlockSource: {
    type: String,             // 'achievement' | 'story_completion' | 'event' | 'admin_grant' | 'purchase'
    sourceId: String,          // related source ID
    sourceName: String,        // human-readable name
    details: String            // additional context
  },

  // Avatar usage tracking
  usage: {
    timesUsed: Number,        // how many times user has selected this avatar
    lastUsedAt: Date,         // when this avatar was last active
    isCurrentlyActive: Boolean // if this is user's current avatar
  },

  // Avatar metadata (denormalized for performance)
  avatarInfo: {
    name: String,             // avatar display name
    rarity: String,           // 'common' | 'rare' | 'epic' | 'legendary'
    category: String,         // 'character' | 'story_specific' | 'achievement' | 'event'
    imageUrl: String,         // thumbnail URL for quick display
    thumbnailUrl: String
  },

  createdAt: Date,
  updatedAt: Date
}
```

**Key Indexes**:
- `userId` + `avatarId` (unique)
- `userId` + `"usage.isCurrentlyActive": 1` (find current avatar)
- `userId` + `unlockedAt: -1` (user's avatar collection)
- `avatarId` + `unlockedAt: -1` (avatar popularity)
- `"avatarInfo.rarity"` (filtering by rarity)

**Benefits of Separation**:
- ✅ **Prevents unbounded array growth** in Users collection
- ✅ **Enables rich usage analytics** and tracking
- ✅ **Supports avatar preferences** and selection patterns
- ✅ **Better query performance** for avatar-heavy users
- ✅ **Easy pagination** for large avatar collections

**Query Examples**:
```javascript
// Get user's current active avatar
db.UserAvatars.findOne({
  userId: ObjectId("user_id"),
  "usage.isCurrentlyActive": true
});

// Get user's avatar collection with pagination
db.UserAvatars.find({
  userId: ObjectId("user_id")
})
.sort({ unlockedAt: -1 })
.skip(20)
.limit(10);

// Get user's avatars by rarity
db.UserAvatars.find({
  userId: ObjectId("user_id"),
  "avatarInfo.rarity": "legendary"
}).sort({ "usage.timesUsed": -1 });

// Get most popular avatars platform-wide
db.UserAvatars.aggregate([
  { $group: {
    _id: "$avatarId",
    unlockCount: { $sum: 1 },
    totalUsage: { $sum: "$usage.timesUsed" }
  }},
  { $sort: { unlockCount: -1 } },
  { $limit: 20 }
]);

// Update user's active avatar
db.UserAvatars.updateMany(
  { userId: ObjectId("user_id"), "usage.isCurrentlyActive": true },
  { $set: { "usage.isCurrentlyActive": false, "usage.lastUsedAt": new Date() } }
);
db.UserAvatars.updateOne(
  { userId: ObjectId("user_id"), avatarId: "avatar_123" },
  {
    $set: { "usage.isCurrentlyActive": true },
    $inc: { "usage.timesUsed": 1 }
  }
);
```

---

### 6. SystemConfig Collection

**Purpose**: Centralized system configuration and feature flags

```javascript
{
  _id: ObjectId,
  key: String,                // unique identifier
  value: Mixed,               // can be number, string, boolean, object
  description: String,
  category: String,           // 'game' | 'security' | 'payment' | 'feature'
  isPublic: Boolean,          // can be accessed by frontend
  lastModifiedBy: ObjectId,   // admin user ID
  lastModifiedAt: Date
}
```

**Default System Configurations**:

```javascript
// Game Settings
[
  { key: "CREDIT_REFILL_INTERVAL", value: 300000, description: "5 minutes in ms" },
  { key: "DEFAULT_MAX_CREDITS", value: 100, description: "Starting credit limit" },
  { key: "CHOICE_COST", value: 1, description: "Credits per story choice" },
  { key: "REVIEW_BONUS_CREDITS", value: 5, description: "Bonus for first review" },
  { key: "CREDIT_AUTO_REFILL_ENABLED", value: true, description: "Enable automatic refill" }
]

// Security Settings
[
  { key: "OTP_EXPIRE_MINUTES", value: 10, description: "OTP code validity" },
  { key: "OTP_MAX_ATTEMPTS", value: 3, description: "Maximum failed OTP attempts" },
  { key: "OTP_RESEND_COOLDOWN_SECONDS", value: 60, description: "Resend cooldown" },
  { key: "OTP_MAX_REQUESTS_PER_HOUR", value: 5, description: "Hourly OTP limit" },
  { key: "FAILED_LOGIN_LOCK_THRESHOLD", value: 5, description: "Failed login attempts to lock" }
]

// Feature Flags
[
  { key: "SOCIAL_SHARING_ENABLED", value: true, category: "feature" },
  { key: "ACHIEVEMENT_SYSTEM_ENABLED", value: true, category: "feature" },
  { key: "STORY_COMMENTS_ENABLED", value: false, category: "feature" },
  { key: "MULTIPLAYER_ENABLED", value: false, category: "feature" }
]

// Content Moderation
[
  { key: "AUTO_MODERATION_ENABLED", value: true, description: "AI moderation" },
  { key: "REVIEW_AUTO_APPROVE_THRESHOLD", value: 4, description: "Rating threshold" },
  { key: "CONTENT_REPORT_REVIEW_REQUIRED", value: 3, description: "Reports before review" }
]
```

**Usage Examples**:
```javascript
// Get public configurations for frontend
const publicConfigs = await db.SystemConfig.find(
  { isPublic: true },
  { key: 1, value: 1, description: 1 }
);

// Get specific configuration
const creditConfig = await db.SystemConfig.findOne(
  { key: "DEFAULT_MAX_CREDITS" }
);

// Update configuration with audit trail
await db.SystemConfig.updateOne(
  { key: "CREDIT_REFILL_INTERVAL" },
  {
    $set: {
      value: 240000, // 4 minutes
      description: "Reduced from 5 minutes for testing",
      lastModifiedBy: adminId,
      lastModifiedAt: new Date()
    }
  }
);

// Get configurations by category
const gameSettings = await db.SystemConfig.find(
  { category: "game" }
);
```

**Key Indexes**:
- `key` (unique)
- `category`
- `isPublic`

### 7. StoryNodes Collection

**Purpose**: Individual story nodes with branching choices and rewards

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
    nextNodeId: String,       // or null for ending
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

  // Visual editor support
  layout: {
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

**Key Indexes**:
- `storyId`
- `nodeId` + `storyId` (unique)
- `isEnding`

---

### 8. StoryAssets Collection

**Purpose**: Media assets management for stories

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

**Key Indexes**:
- `assetId` (unique)
- `storyId`
- `type`
- `status`
- `moderation.status`

---

### 9. StoryGallery Collection

**Purpose**: Story image gallery management with cached URLs for performance optimization

```javascript
{
  _id: ObjectId,
  galleryImageId: String,        // unique identifier
  storyId: ObjectId,             // references Stories

  // Image Information
  name: String,
  description: String,
  caption: String,               // Thai caption for the image

  // Asset Reference (links to StoryAssets)
  assetId: String,               // references StoryAssets.assetId

  // Cached URLs (denormalized for performance - no joins needed)
  urls: {
    original: String,            // Full resolution image URL
    large: String,               // 1200x800 or similar
    medium: String,              // 800x533 or similar
    thumbnail: String,           // 300x200 or similar
    small: String                // 150x100 or similar
  },

  // Image Metadata
  metadata: {
    width: Number,
    height: Number,
    fileSize: Number,            // in bytes
    mimeType: String,            // 'image/jpeg', 'image/png', etc.
    aspectRatio: String          // '16:9', '4:3', etc.
  },

  // Display Settings
  display: {
    sortOrder: Number,           // Order in gallery (1, 2, 3...)
    isFeatured: Boolean,         // Primary gallery image
    isHidden: Boolean,           // Hide from public gallery
    showInPreview: Boolean       // Show in story preview carousel
  },

  // Moderation
  moderation: {
    status: String,              // 'pending' | 'approved' | 'rejected'
    reviewedBy: ObjectId,
    reviewedAt: Date,
    notes: String
  },

  // Analytics
  analytics: {
    viewCount: Number,           // How many times this image was viewed
    clickCount: Number,          // How many times this image was clicked
    lastViewedAt: Date
  },

  createdAt: Date,
  updatedAt: Date
}
```

**Key Design Principles**:
- ✅ **URL Caching**: All image sizes cached as direct URLs to avoid $lookup joins with StoryAssets
- ✅ **Performance Optimized**: Frontend can directly access URLs without additional queries
- ✅ **Multiple Sizes**: Automatic thumbnail generation for different use cases
- ✅ **Thai Language Support**: Captions and descriptions in Thai
- ✅ **Moderation Ready**: Built-in moderation workflow for gallery images

**Key Indexes**:
- `galleryImageId` (unique)
- `storyId` + `display.sortOrder` (for ordered gallery retrieval)
- `storyId` + `display.isFeatured` (quick featured image lookup)
- `storyId` + `moderation.status` (filter approved images)
- `display.showInPreview` + `storyId` (preview carousel images)

**Query Examples**:
```javascript
// Get story's gallery images with all sizes (no joins needed)
db.StoryGallery.find({
  storyId: ObjectId("story_id"),
  moderation: "approved"
})
.sort({ "display.sortOrder": 1 })
.select({
  galleryImageId: 1,
  name: 1,
  caption: 1,
  "urls.large": 1,
  "urls.thumbnail": 1,
  display: 1
});

// Get story's featured image for preview
db.StoryGallery.findOne({
  storyId: ObjectId("story_id"),
  "display.isFeatured": true,
  moderation: "approved"
})
.select({
  galleryImageId: 1,
  name: 1,
  "urls.medium": 1,
  "urls.thumbnail": 1
});

// Get images for story preview carousel
db.StoryGallery.find({
  storyId: ObjectId("story_id"),
  "display.showInPreview": true,
  moderation: "approved"
})
.sort({ "display.sortOrder": 1 })
.limit(5)
.select({
  galleryImageId: 1,
  "urls.thumbnail": 1,
  caption: 1
});

// Update gallery image analytics
db.StoryGallery.updateOne(
  { galleryImageId: "gallery_123" },
  {
    $inc: { "analytics.viewCount": 1 },
    $set: { "analytics.lastViewedAt": new Date() }
  }
);

// Batch update gallery order
const updates = [
  { filter: { galleryImageId: "img1" }, update: { $set: { "display.sortOrder": 1 } } },
  { filter: { galleryImageId: "img2" }, update: { $set: { "display.sortOrder": 2 } } },
  { filter: { galleryImageId: "img3" }, update: { $set: { "display.sortOrder": 3 } } }
];

updates.forEach(({ filter, update }) => {
  db.StoryGallery.updateOne(filter, update);
});
```

**URL Generation Strategy**:
```javascript
// When creating a gallery image, generate all sizes
const createGalleryImage = async (storyId, assetId, imageInfo) => {
  // Generate different image sizes
  const sizes = await generateImageSizes(assetId);

  const galleryImage = {
    galleryImageId: `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    storyId,
    assetId,
    name: imageInfo.name,
    caption: imageInfo.caption,
    urls: {
      original: sizes.original.url,
      large: sizes.large.url,
      medium: sizes.medium.url,
      thumbnail: sizes.thumbnail.url,
      small: sizes.small.url
    },
    metadata: {
      width: sizes.original.width,
      height: sizes.original.height,
      fileSize: sizes.original.fileSize,
      mimeType: 'image/jpeg',
      aspectRatio: calculateAspectRatio(sizes.original)
    },
    display: {
      sortOrder: await getNextSortOrder(storyId),
      isFeatured: false,
      isHidden: false,
      showInPreview: true
    },
    moderation: {
      status: 'pending'
    },
    createdAt: new Date()
  };

  return await db.StoryGallery.create(galleryImage);
};
```

---

### 10. Genres Collection

**Purpose**: Story genre classifications with Thai language support

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

**Example**:
```javascript
{
  _id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j1"),
  slug: "sci-fi",
  name: "ไซไฟ",
  description: "เรื่องราวสมัยใหม่ วิทยาศาสตร์ เทคโนโลยี และอนาคต",
  storyCount: 25,
  isActive: true,
  sortOrder: 1,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-15T10:30:00Z")
}
```

**Key Indexes**:
- `slug` (unique)
- `isActive`
- `sortOrder`

---

### 11. Achievements Collection

**Purpose**: System-wide achievement definitions and rewards

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

**Key Indexes**:
- `achievementId` (unique)
- `category`
- `type`
- `isActive`

---

### 12. Avatars Collection

**Purpose**: User avatar definitions with unlock conditions

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

**Key Indexes**:
- `avatarId` (unique)
- `unlockType`
- `isActive`
- `rarity`
- `category`
- `totalUnlocks` (descending)

---

### 13. CreditTransactions Collection

**Purpose**: Credit transaction history and economy tracking

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

  // Soft Delete Support
  deletedAt: Date,
  deletedBy: ObjectId,
  deleteReason: String,

  createdAt: Date,
  expiresAt: Date             // for temporary credits
}
```

**Key Indexes**:
- `userId` + `createdAt`
- `transactionType`
- `source`
- `deletedAt` (sparse)

---

### 14. Reviews Collection

**Purpose**: User reviews with voting and moderation

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

  // Soft Delete Support
  deletedAt: Date,
  deletedBy: ObjectId,
  deleteReason: String,

  adminReply: {
    text: String,
    adminId: ObjectId,         // references Users (admin)
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

**Key Indexes**:
- `userId` + `storyId` (unique)
- `storyId` + `rating`
- `storyId` + `createdAt`
- `deletedAt` (sparse)
- `moderation.status`

---

### 15. ReviewVotes Collection

**Purpose**: Review voting system with duplicate prevention

```javascript
{
  _id: ObjectId,
  reviewId: ObjectId,         // references Reviews
  userId: ObjectId,           // references Users
  voteType: String,           // 'up' | 'down'
  createdAt: Date
}
```

**Key Indexes**:
- `reviewId` + `userId` (unique) - Prevent duplicate votes
- `userId` - User's voting history
- `createdAt` (TTL: Optional cleanup of old votes)

---

### 16. ReviewFlags Collection

**Purpose**: Community review reporting and moderation

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

**Key Indexes**:
- `reviewId` - Find all flags for a review
- `userId` - User's flag history
- `status` + `createdAt` - Find pending flags for admin dashboard
- `reviewId` + `userId` (unique) - Prevent duplicate flags

---

### 17. StoryFlags Collection

**Purpose**: Story content reporting and moderation

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

**Key Indexes**:
- `storyId` - Find all reports for a story
- `userId` - User's reporting history
- `status` + `createdAt` - Find pending reports for admin dashboard
- `storyId` + `userId` (unique) - Prevent duplicate reports

---

### 18. AdminAccounts Collection

**Purpose**: Administrator account management with OAuth support

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,       // optional for Google SSO users

  authentication: {
    authMethod: String,       // 'email' | 'google' | 'both'
    googleId: String,         // for Google OAuth, unique indexed
    googleEmail: String,      // Google account email
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
      type: String,           // 'default' | 'custom' | 'google'
      value: String           // URL or avatar ID
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

**Key Indexes**:
- `email` (unique)
- `username` (unique)
- `authentication.googleId` (unique, sparse)
- `authentication.googleEmail` (unique, sparse)
- `role`
- `status`
- `lastActive`

---

### 19. AdminLoginHistory Collection

**Purpose**: Admin login tracking and security monitoring

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

**Key Indexes**:
- `adminId` + `loginTime` (for admin's login history)
- `ip` (for security monitoring)
- `success` (for failed login tracking)
- `createdAt` (TTL: 2 years for automatic cleanup)

---

### 20. AdminLogs Collection

**Purpose**: Admin action audit trail

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
    before: Object,           // State before change
    after: Object            // State after change
  },

  ip: String,
  userAgent: String,
  sessionId: String,

  timestamp: Date
}
```

**Key Indexes**:
- `adminId`
- `targetType`
- `timestamp`
- `action`

---

### 21. SecurityEvents Collection

**Purpose**: Security monitoring and automatic threat detection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // can be null for anonymous events
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

**Key Indexes**:
- `userId` + `timestamp`
- `eventType`
- `severity`
- `status`
- `timestamp` (TTL: 2 years)

---

### 22. UserSessions Collection

**Purpose**: User session management with OAuth support

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

**Key Indexes**:
- `sessionToken` (unique)
- `userId` + `isActive`
- `expiresAt`

---

### 23. OTPCodes Collection

**Purpose**: OTP verification with rate limiting and security

```javascript
{
  _id: ObjectId,
  email: String,              // indexed for lookup
  code: String,               // 6-digit OTP code
  type: String,               // 'registration' | 'password_reset'
  userId: ObjectId,           // references Users (optional for registration)
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

**Key Indexes**:
- `email` + `type` + `usedAt` (sparse)
- `code` + `expiresAt` (TTL: 24 hours)
- `userId` (sparse)
- `expiresAt` (TTL: 24 hours)

---

### 24. Analytics Collection

**Purpose**: User behavior analytics with automatic cleanup

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

**Key Indexes**:
- `eventType`
- `userId` + `timestamp`
- `storyId` + `eventType`
- `timestamp` (TTL: 90 days)

---

## 🔐 Security & Authentication

### Account Status Management

| Status | Who Initiates | Duration | Use Case |
|--------|---------------|----------|----------|
| **active** | System | Permanent | Normal users |
| **suspended** | Admin | Temporary | First offenses |
| **banned** | Admin | Permanent | Severe violations |
| **under_review** | System | Temporary | Suspicious activity |
| **locked** | System | Temporary | Auto-security |

### Automatic Security Detection

```javascript
// Failed Login Thresholds
const securityConfig = {
  thresholds: [
    { attempts: 3, windowMinutes: 1, lockMinutes: 5 },
    { attempts: 5, windowMinutes: 5, lockMinutes: 15 },
    { attempts: 10, windowMinutes: 15, lockMinutes: 60 },
    { attempts: 20, windowMinutes: 60, lockMinutes: 1440 }
  ]
}

// Suspicious Activity Patterns
const suspiciousPatterns = {
  rapidLogins: { count: 20, windowMinutes: 5 },
  rapidStoryCompletion: { storiesPerHour: 10, normalRate: 2 },
  creditExploitation: { creditsPerHour: 100, normalRate: 10 },
  reviewSpam: { reviewsPerHour: 20, windowMinutes: 60 }
}
```

### OTP Security Features

- **Rate Limiting**: 5 OTP requests per hour per email
- **Cooldown**: 60 seconds between resend requests
- **Attempt Limit**: Maximum 3 failed attempts per OTP
- **Auto Expiration**: 10 minutes validity
- **Auto Cleanup**: 24-hour TTL for OTP documents

---

## 🎮 Game Mechanics

### Credit System

**Configuration** (from SystemConfig):
- `CREDIT_REFILL_INTERVAL`: 5 minutes (300,000ms)
- `DEFAULT_MAX_CREDITS`: 100 credits
- `CHOICE_COST`: 1 credit per choice
- `REVIEW_BONUS_CREDITS`: 5 credits for first review

**Transaction Types**:
- `earn`: Story completion, achievements
- `spend`: Making story choices
- `bonus`: Review bonuses, admin grants
- `refund`: System corrections

### Achievement System

**Categories**:
- **story**: Story-related achievements
- **social**: Community interaction
- **special**: Event-based achievements
- **milestone**: User progression milestones

**Rarity Levels**:
- **common**: Easy to achieve
- **rare**: Moderate difficulty
- **epic**: Challenging requirements
- **legendary**: Extremely difficult

### Avatar Unlock System

**Unlock Types**:
- **free**: Available to all users
- **achievement**: Requires specific achievement
- **story_completion**: From completing stories
- **special_event**: Limited-time events

---

## 📈 Performance Optimizations

### Database Design Patterns

✅ **Separate Collections for Unbounded Arrays**
- `UserAchievements` instead of `Users.gameStats.achievements`
- `UserFavorites` instead of `Users.gameStats.favorites`
- `UserAvatars` instead of `Users.gameStats.unlockedAvatars`
- StoryNodes queried via `storyId` instead of `Stories.content.nodes` array
- Prevents document size limits (16MB)

✅ **ID-Only References with Dynamic Joins**
- Store only IDs in relationships (UserFavorites, UserAchievements, etc.)
- Use `$lookup` operations to fetch related data dynamically
- Better data consistency and reduced storage overhead
- Eliminates denormalization sync issues

✅ **Soft Delete Implementation**
- `deletedAt` field for audit trail
- Preserves data integrity
- GDPR compliance support

### Indexing Strategy

**Critical Indexes**:
```javascript
// User-centric queries
db.users.createIndex({ "authentication.email": 1 });
db.users.createIndex({ "accountStatus.status": 1 });
db.users.createIndex({ deletedAt: 1 }, { sparse: true });

// Achievement queries
db.UserAchievements.createIndex({ userId: 1, achievementId: 1 }, { unique: true });
db.UserAchievements.createIndex({ userId: 1, unlockedAt: -1 });

// Story discovery
db.stories.createIndex({ "metadata.genre": 1, "metadata.isPublished": 1 });
db.stories.createIndex({ "stats.averageRating": -1 });
db.stories.createIndex({ deletedAt: 1 }, { sparse: true });

// Security
db.SecurityEvents.createIndex({ eventType: 1, timestamp: -1 });
db.OTPCodes.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### Caching Strategy

**Single-Instance Optimization**:
- **In-memory caching** for hot data (users, stories, achievements)
- **LRU cache** for frequently accessed stories
- **TTL-based expiration** for temporary data
- **Memory monitoring** to prevent OOM issues

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

### Common Query Patterns

**Get User's Complete Profile**:
```javascript
const user = await db.users.findOne({ _id: userId });
const achievements = await db.UserAchievements.find({ userId })
  .populate('achievementId');
const favorites = await db.UserFavorites.find({ userId })
  .sort({ addedAt: -1 });
const progress = await db.UserStoryProgress.find({ userId })
  .sort({ lastPlayedAt: -1 });
```

**Story Discovery with Filters**:
```javascript
db.stories.find({
  "metadata.isPublished": true,
  "metadata.contentRating.ageRating": { $lte: userAge },
  "metadata.genre": { $in: preferredGenres },
  deletedAt: null
}).sort({ "stats.averageRating": -1 })
  .limit(20);
```

---

## 🛡️ Data Protection & Compliance

### Security Measures

**Data Encryption**:
- Passwords: bcrypt hashing
- Sensitive PII: Field-level encryption
- OAuth tokens: Encrypted storage
- Session data: Secure token generation

**Access Control**:
- Role-based permissions (user, moderator, admin)
- Row-level security for user data
- API rate limiting and abuse prevention
- Audit logging for admin actions

### GDPR Compliance

**Right to Deletion**:
- Soft delete implementation with audit trail
- Complete data anonymization for analytics
- User-controlled data export
- Automated cleanup after retention periods

**Data Minimization**:
- Collect only necessary user data
- Regular cleanup of temporary data
- Anonymized analytics reporting
- Secure data storage practices

---

## 📚 Content Rating System

### Age Classification Matrix

| Age Rating | Content Guidelines | Examples |
|------------|-------------------|----------|
| **0+** | General audiences | Educational stories, family content |
| **13+** | Mild themes | Light romance, mild fantasy violence |
| **16+** | Moderate content | Romance, moderate violence, some language |
| **18+** | Mature content only | Intense themes, explicit content |

### Violence Level Scale

- **none**: No violence whatsoever
- **mild**: Fantasy/cartoon violence, light conflicts
- **moderate**: Realistic violence, some blood/injury
- **high**: Graphic violence, gore, intense disturbing content

### Content Warnings

Specific warning tags for sensitive content:
- `sexual_content`, `drug_use`, `strong_language`
- `horror`, `psychological`, `gambling`

---

## 🔄 Data Flow Examples

### User Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB as Database
    participant Email as Email Service

    User->>Frontend: Submit registration form
    Frontend->>API: POST /api/auth/register
    API->>DB: Create user with emailVerified: false
    API->>Email: Send OTP verification email
    Email->>User: OTP code via email
    User->>Frontend: Submit OTP code
    Frontend->>API: POST /api/auth/verify-otp
    API->>DB: Update user: emailVerified: true
    API->>Frontend: Success response
    Frontend->>User: Registration complete
```

### Story Playthrough Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB as Database

    User->>Frontend: Start story
    Frontend->>API: GET /api/stories/:id/start
    API->>DB: Create UserStoryProgress
    API->>DB: Deduct credits (CreditTransaction)
    API->>Frontend: Return story node
    Frontend->>User: Display story content
    User->>Frontend: Make choice
    Frontend->>API: POST /api/stories/:id/choices
    API->>DB: Update progress, check achievements
    API->>Frontend: Return next node
    Note over API: Loop until ending reached
    API->>DB: Mark story completed
```

### Achievement Unlock Flow

```mermaid
sequenceDiagram
    participant API as Game API
    participant DB as Database
    participant Achievement as Achievement Service

    API->>DB: Complete story action
    DB->>Achievement: Check achievement conditions
    Achievement->>DB: Query user stats and history
    Achievement->>Achievement: Evaluate conditions
    alt Achievement unlocked
        Achievement->>DB: Create UserAchievement record
        Achievement->>DB: Award credits if applicable
        Achievement->>DB: Create analytics event
        Achievement->>API: Return achievement unlocked
    end
```

---

## 🚀 Deployment & Operations

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

### Performance Monitoring

**Key Metrics to Track**:
- Database query performance and slow queries
- Document size growth (especially Users collection)
- Index usage and efficiency
- Memory usage and cache hit rates
- Authentication attempt patterns
- Content moderation queue sizes

**Recommended Tools**:
- MongoDB Atlas monitoring (if cloud)
- PMM (Percona Monitoring and Management)
- Custom application metrics
- Log aggregation and analysis

### Backup Strategy

**Recommended Approach**:
1. **Daily automated backups** of all collections
2. **Point-in-time recovery** using oplog
3. **Cross-region backup replication** for disaster recovery
4. **Regular backup verification** and restore testing

**Critical Collections to Backup**:
- `Users` (with all user data)
- `Stories` and `StoryNodes` (content)
- `Transactions` (financial records)
- `AdminLogs` (audit trail)

---

## 📖 Summary

This database design provides:

✅ **Scalability**: Separate collections prevent unbounded growth
✅ **Performance**: Optimized indexes and caching strategy
✅ **Security**: Comprehensive authentication and monitoring
✅ **Flexibility**: Support for multiple auth methods and content types
✅ **Compliance**: GDPR-friendly with soft delete and data protection
✅ **Maintainability**: Clear relationships and well-documented schemas

The design balances the needs of a complex interactive story platform with the constraints of a single-instance deployment, providing excellent performance while maintaining data integrity and security.

---

*Last updated: December 2024*
*Version: 1.0*