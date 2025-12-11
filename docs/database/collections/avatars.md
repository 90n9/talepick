# Avatars Collection

**Purpose**: User avatar definitions with unlock conditions

## Schema

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

## Key Indexes

- `avatarId` (unique)
- `unlockType`
- `isActive`
- `rarity`
- `category`
- `totalUnlocks` (descending)

## Query Examples

```javascript
// Get all active avatars
db.Avatars.find({ isActive: true })
.sort({ category: 1, sortOrder: 1 });

// Get avatars by unlock type
db.Avatars.find({
  unlockType: "free",
  isActive: true
})
.sort({ sortOrder: 1 });

// Get avatars by rarity
db.Avatars.find({
  rarity: "legendary",
  isActive: true
})
.sort({ sortOrder: 1 });

// Check if user can unlock specific avatar
const checkAvatarUnlock = (userId, avatarId) => {
  const avatar = db.Avatars.findOne({
    avatarId,
    isActive: true
  });

  if (!avatar) return { eligible: false, reason: "Avatar not found" };

  switch (avatar.unlockType) {
    case "free":
      return { eligible: true };

    case "achievement":
      const hasAchievement = db.UserAchievements.findOne({
        userId,
        achievementId: avatar.unlockConditions.achievementId
      });
      return {
        eligible: !!hasAchievement,
        reason: hasAchievement ? null : "Achievement not completed"
      };

    case "story_completion":
      const completedStory = db.UserStoryProgress.findOne({
        userId,
        storyId: avatar.unlockConditions.storyId,
        hasCompleted: true
      });
      return {
        eligible: !!completedStory,
        reason: completedStory ? null : "Story not completed"
      };

    default:
      return { eligible: false, reason: "Unknown unlock type" }
  }
};

// Get avatars available to user
const getAvailableAvatars = (userId) => {
  // Get user's unlocked avatars
  const unlocked = db.UserAvatars.find({ userId })
    .map(ua => ua.avatarId);

  return db.Avatars.find({
    isActive: true,
    isHidden: false,
    $or: [
      { unlockType: "free" },
      { avatarId: { $in: unlocked } }
    ]
  })
  .sort({ category: 1, sortOrder: 1 });
};

// Get avatars user can unlock next
const getUnlockableAvatars = (userId) => {
  return db.Avatars.aggregate([
    { $match: { isActive: true, isHidden: false } },
    { $lookup: {
      from: "UserAchievements",
      let: { userId },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$userId", "$$userId"]
            }
          }
        }
      ],
      as: "userAchievements"
    }},
    { $lookup: {
      from: "UserStoryProgress",
      let: { userId },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$userId", "$$userId"]
            },
            hasCompleted: true
          }
        }
      ],
      as: "completedStories"
    }},
    { $addFields: {
      userAchievementIds: { $setUnion: ["$userAchievements.achievementId", []] },
      completedStoryIds: { $setUnion: ["$completedStories.storyId", []] }
    }},
    { $match: {
      $expr: {
        $or: [
          { $eq: ["$unlockType", "free"] },
          {
            $and: [
              { $eq: ["$unlockType", "achievement"] },
              { $in: ["$unlockConditions.achievementId", "$userAchievementIds"] }
            ]
          },
          {
            $and: [
              { $eq: ["$unlockType", "story_completion"] },
              { $in: ["$unlockConditions.storyId", "$completedStoryIds"] }
            ]
          }
        ]
      }
    }}
  ]);
};

// Get most popular avatars
db.Avatars.find({ isActive: true })
.sort({ totalUnlocks: -1 })
.limit(20);

// Update avatar unlock statistics
db.Avatars.updateOne(
  { avatarId: "avatar_123" },
  {
    $inc: { totalUnlocks: 1 },
    $set: {
      unlockRate: calculateUnlockRate("avatar_123"),
      updatedAt: new Date()
    }
  }
);

// Get limited time avatars
db.Avatars.find({
  isActive: true,
  isLimited: true
})
.sort({ sortOrder: 1 });

// Create new avatar
db.Avatars.insertOne({
  avatarId: "dragon_legendary_001",
  name: "มังกรพันธุ์แท้",
  description: "มังกรโบราณที่หายากที่สุดในโลก",
  imageUrl: "https://cdn.example.com/avatars/dragon.png",
  thumbnailUrl: "https://cdn.example.com/avatars/dragon_thumb.png",
  unlockType: "achievement",
  unlockConditions: {
    achievementId: "story_master_100",
    minLevel: 10
  },
  isActive: true,
  isLimited: false,
  isHidden: false,
  rarity: "legendary",
  sortOrder: 1,
  totalUnlocks: 0,
  unlockRate: 0,
  category: "character",
  tags: ["dragon", "legendary", "fantasy"],
  artist: "ArtistName",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Get avatar statistics by category
db.Avatars.aggregate([
  { $match: { isActive: true } },
  { $group: {
    _id: "$category",
    totalAvatars: { $sum: 1 },
    totalUnlocks: { $sum: "$totalUnlocks" },
    averageUnlocks: { $avg: "$totalUnlocks" },
    rarityDistribution: {
      $push: {
        rarity: "$rarity",
        count: 1
      }
    }
  }},
  { $project: {
    category: "$_id",
    totalAvatars: 1,
    totalUnlocks: 1,
    averageUnlocks: { $round: ["$averageUnlocks", 2] },
    rarityStats: {
      $arrayToObject: {
        $map: {
          input: { $setUnion: ["$rarityDistribution.rarity", []] },
          as: "rarity",
          in: {
            k: "$$rarity",
            v: {
              $size: {
                $filter: {
                  input: "$rarityDistribution",
                  cond: { $eq: ["$$this.rarity", "$$rarity"] }
                }
              }
            }
          }
        }
      }
    }
  }},
  { $sort: { totalUnlocks: -1 } }
]);

// Get avatars by artist
db.Avatars.find({
  artist: "ArtistName",
  isActive: true
})
.sort({ createdAt: -1 });

// Deactivate avatar (remove from circulation)
db.Avatars.updateOne(
  { avatarId: "old_avatar" },
  {
    $set: {
      isActive: false,
      updatedAt: new Date()
    }
  }
);

// Get user's avatar collection statistics
const getUserAvatarStats = (userId) => {
  return db.UserAvatars.aggregate([
    { $match: { userId } },
    { $lookup: {
      from: "Avatars",
      localField: "avatarId",
      foreignField: "avatarId",
      as: "avatar"
    }},
    { $unwind: "$avatar" },
    { $group: {
      _id: null,
      totalAvatars: { $sum: 1 },
      rarityDistribution: {
        $push: "$avatar.rarity"
      },
      categoryDistribution: {
        $push: "$avatar.category"
      },
      totalUsage: { $sum: "$usage.timesUsed" },
      favoriteRarity: {
        $first: {
          $arrayElemAt: [
            { $sortArray: { input: { $setUnion: ["$rarityDistribution", []] }, sortBy: 1 } },
            0
          ]
        }
      }
    }},
    { $project: {
      _id: 0,
      totalAvatars: 1,
      rarityBreakdown: {
        $arrayToObject: {
          $map: {
            input: { $setUnion: ["$rarityDistribution", []] },
            as: "rarity",
            in: {
              k: "$$rarity",
              v: {
                $size: {
                  $filter: {
                    input: "$rarityDistribution",
                    cond: { $eq: ["$$this", "$$rarity"] }
                  }
                }
              }
            }
          }
        }
      },
      categoryBreakdown: {
        $arrayToObject: {
          $map: {
            input: { $setUnion: ["$categoryDistribution", []] },
            as: "category",
            in: {
              k: "$$category",
              v: {
                $size: {
                  $filter: {
                    input: "$categoryDistribution",
                    cond: { $eq: ["$$this", "$$category"] }
                  }
                }
              }
            }
          }
        }
      },
      totalUsage: 1
    }}
  ]).toArray()[0];
};
```

## Avatar Categories

| Category | Description | Typical Unlock Rate |
|----------|-------------|---------------------|
| **character** | Character portraits and personas | Medium |
| **story_specific** | Characters from specific stories | Variable |
| **achievement** | Reward avatars for achievements | Low |
| **event** | Limited-time event avatars | Rare |
| **special** | Unique collaboration avatars | Very Rare |

## Unlock Types

### Free Avatars
- Available to all users immediately
- Usually basic or common rarity
- Good starting options

```javascript
{
  unlockType: "free",
  unlockConditions: {}
}
```

### Achievement-Based
- Requires specific achievement completion
- Can be rare or legendary rarity
- Long-term goals for players

```javascript
{
  unlockType: "achievement",
  unlockConditions: {
    achievementId: "story_master_100"
  }
}
```

### Story Completion
- Unlocked by completing specific stories
- Often story-specific characters
- Rewards for content engagement

```javascript
{
  unlockType: "story_completion",
  unlockConditions: {
    storyId: "story_epic_quest",
    completionRate: 100  // Must complete 100%
  }
}
```

### Special Events
- Limited-time availability
- May have complex unlock conditions
- Exclusive and collectible

```javascript
{
  unlockType: "special_event",
  unlockConditions: {
    specialEventId: "summer_2024",
    minLevel: 5
  },
  isLimited: true
}
```

## Rarity System

| Rarity | Unlock Requirements | Visual Indicators |
|--------|---------------------|-------------------|
| **common** | Easy to obtain | Simple border, gray theme |
| **rare** | Moderate effort | Silver border, blue highlights |
| **epic** | Significant achievement | Gold border, purple glow |
| **legendary** | Exceptional accomplishment | Animated border, special effects |

## Avatar Analytics

### Performance Metrics
```javascript
const getAvatarAnalytics = () => {
  return db.Avatars.aggregate([
    { $match: { isActive: true } },
    { $group: {
      _id: null,
      totalAvatars: { $sum: 1 },
      totalUnlocks: { $sum: "$totalUnlocks" },
      averageUnlocks: { $avg: "$totalUnlocks" },
      highestUnlocked: { $max: "$totalUnlocks" },
      lowestUnlocked: { $min: "$totalUnlocks" }
    }},
    { $project: {
      _id: 0,
      totalAvatars: 1,
      totalUnlocks: 1,
      averageUnlocks: { $round: ["$averageUnlocks", 2] },
      unlockRate: {
        $round: [
          {
            $divide: [
              { $sum: "$totalUnlocks" },
              { $multiply: ["$totalAvatars", 1000] } // Assuming 1000 users
            ]
          },
          4
        ]
      }
    }}
  ]);
};
```

## Limited Time Avatars

### Event-Based Avatars
```javascript
{
  avatarId: "summer_festival_2024",
  name: "นางฟ้าฤดูร้อน",
  unlockType: "special_event",
  unlockConditions: {
    specialEventId: "summer_festival_2024",
    // Additional event-specific requirements
  },
  isLimited: true,
  // Could add expiration date
  availableUntil: new Date("2024-08-31T23:59:59Z")
}
```

## Quality Assurance

### Asset Requirements
- **Image Size**: 512x512 pixels minimum
- **Format**: PNG with transparency
- **File Size**: Under 500KB
- **Content Guidelines**: Age-appropriate, Thai cultural sensitivity

### Review Process
1. **Artistic Review**: Visual quality assessment
2. **Technical Review**: Format and size validation
3. **Content Review**: Appropriateness check
4. **Approval**: Added to active rotation

## Integration Points

- **UserAvatars**: Tracks ownership and usage
- **Achievements**: Unlock condition verification
- **UserStoryProgress**: Story completion checks
- **Special Events**: Limited-time unlock conditions
- **Analytics**: Usage statistics and popularity tracking

## Future Enhancements

### Animated Avatars
```javascript
{
  avatarId: "dragon_animated",
  imageUrl: "https://cdn.example.com/avatars/dragon.png",
  animatedUrl: "https://cdn.example.com/avatars/dragon.gif",
  isAnimated: true,
  animationType: "gif" // or "webm", "apng"
}
```

### Customization Options
```javascript
{
  avatarId: "base_character",
  isCustomizable: true,
  customizationOptions: {
    colors: ["red", "blue", "green"],
    accessories: ["hat", "glasses", "scarf"],
    backgrounds: ["plain", "gradient", "pattern"]
  }
}
```