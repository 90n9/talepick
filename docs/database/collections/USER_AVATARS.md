# UserAvatars Collection

## Mongoose Model Reference
- **Model File**: USER_AVATARS (singular)
- **Model Class**: USER AVATARS (singular)
- **Collection**: LULSLELR LALVLALTLALRLSs (plural, with underscores for readability)


**Purpose**: User avatar ownership and usage tracking (separated from Users for scalability)

## Schema

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

## Key Indexes

- `userId` + `avatarId` (unique)
- `userId` + `"usage.isCurrentlyActive": 1` (find current avatar)
- `userId` + `unlockedAt: -1` (user's avatar collection)
- `avatarId` + `unlockedAt: -1` (avatar popularity)
- `"avatarInfo.rarity"` (filtering by rarity)

## Benefits of Separation

- ✅ **Prevents unbounded array growth** in Users collection
- ✅ **Enables rich usage analytics** and tracking
- ✅ **Supports avatar preferences** and selection patterns
- ✅ **Better query performance** for avatar-heavy users
- ✅ **Easy pagination** for large avatar collections

## Query Examples

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

// Get avatar unlock analytics
db.UserAvatars.aggregate([
  { $group: {
    _id: {
      rarity: "$avatarInfo.rarity",
      category: "$avatarInfo.category"
    },
    totalUnlocks: { $sum: 1 },
    averageUsage: { $avg: "$usage.timesUsed" }
  }},
  { $sort: { "_id.rarity": -1, totalUnlocks: -1 } }
]);

// Check if user has specific avatar
db.UserAvatars.findOne({
  userId: ObjectId("user_id"),
  avatarId: "legendary_dragon_001"
});

// Get avatar unlock timeline for user
db.UserAvatars.find({
  userId: ObjectId("user_id")
})
.select({
  avatarId: 1,
  "avatarInfo.name": 1,
  "avatarInfo.rarity": 1,
  unlockedAt: 1,
  "unlockSource.type": 1,
  "unlockSource.sourceName": 1
})
.sort({ unlockedAt: -1 });
```

## Unlock Sources

| Source Type | Description | Frequency |
|-------------|-------------|------------|
| **achievement** | Unlocked via achievement completion | Medium |
| **story_completion** | Reward for completing specific stories | Medium |
| **event** | Limited-time event rewards | Variable |
| **admin_grant** | Manual admin awards | Rare |
| **purchase** | Premium store purchases | Rare |

## Avatar Categories

| Category | Description | Typical Rarity |
|----------|-------------|----------------|
| **character** | Generic character avatars | Common - Rare |
| **story_specific** | Characters from specific stories | Rare - Epic |
| **achievement** | Achievement reward avatars | Rare - Legendary |
| **event** | Limited event avatars | Epic - Legendary |

## Usage Analytics

The `usage` field tracks how users interact with their avatar collection:

- `timesUsed`: Tracks avatar popularity per user
- `lastUsedAt`: Helps identify inactive avatars
- `isCurrentlyActive`: Single active avatar per user

## Avatar Rarity Impact

| Rarity | Unlock Requirement | Typical Usage Pattern |
|--------|-------------------|----------------------|
| **common** | Easy achievements, default options | High rotation |
| **rare** | Moderate challenges | Moderate use |
| **epic** | Difficult achievements | Proud display |
| **legendary** | Extreme challenges | Permanent favorite |

## Performance Considerations

- Denormalized `avatarInfo` prevents $lookup joins for basic display
- Separate collection prevents Users document bloat
- Indexes support common query patterns efficiently
- Usage tracking provides valuable analytics without impacting performance