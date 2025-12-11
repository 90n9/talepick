# UserAchievements Collection

**Purpose**: Completed achievements tracking (only created when achievement is unlocked)

## Schema

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

## Key Design Principle

- ✅ **Only created on completion** - no progress tracking
- ✅ **Progress calculated dynamically** by checking user activity against achievement conditions
- ✅ **Smaller documents** - no redundant progress data
- ✅ **Better performance** - simpler queries, less storage

## Benefits of Separation

- ✅ Prevents unbounded array growth in Users
- ✅ Enables efficient querying and pagination of completed achievements
- ✅ Supports rich completion metadata without progress complexity
- ✅ Better performance for achievement-heavy users
- ✅ Progress calculation handled at application level based on user activity

## Query Examples

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

## Unlock Sources

| Source Type | Description | Example |
|-------------|-------------|---------|
| **story_completion** | Completing a specific story | `story_123` |
| **automatic** | System-detected conditions | "10 stories completed" |
| **event** | Special event achievements | "Summer Event 2024" |
| **admin_grant** | Manual admin award | "Community helper" |

## Rarity Distribution

```javascript
// Get rarity distribution for user
db.UserAchievements.aggregate([
  { $match: { userId: ObjectId("user_id") } },
  { $group: {
    _id: "$rarity",
    count: { $sum: 1 },
    totalPoints: { $sum: "$pointsAwarded" }
  }},
  { $sort: {
    $switch: {
      branches: [
        { case: { $eq: ["$_id", "legendary"] }, then: 1 },
        { case: { $eq: ["$_id", "epic"] }, then: 2 },
        { case: { $eq: ["$_id", "rare"] }, then: 3 },
        { case: { $eq: ["$_id", "common"] }, then: 4 }
      ]
    }
  }}
]);
```

## Achievement Categories

| Category | Description | Typical Unlock Rate |
|----------|-------------|---------------------|
| **story** | Story-related achievements | Medium |
| **social** | Community interaction | Low |
| **special** | Event-based achievements | Variable |
| **milestone** | User progression | High |

## Indexes

- `userId` + `achievementId` (unique)
- `userId` + `unlockedAt` (for user's achievement timeline)
- `category` + `rarity` (for achievement discovery)
- `unlockedAt` (TTL: Optional cleanup of old achievements)