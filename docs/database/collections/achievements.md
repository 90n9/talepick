# Achievements Collection

**Purpose**: System-wide achievement definitions and rewards

## Schema

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

## Key Indexes

- `achievementId` (unique)
- `category`
- `type`
- `isActive`

## Query Examples

```javascript
// Get all active achievements
db.Achievements.find({ isActive: true })
.sort({ category: 1, sortOrder: 1 });

// Get achievements by category
db.Achievements.find({
  category: "story",
  isActive: true
})
.sort({ sortOrder: 1 });

// Get achievements by rarity
db.Achievements.find({
  rarity: "legendary",
  isActive: true
})
.sort({ sortOrder: 1 });

// Check if user qualifies for achievements
const checkUserAchievements = (userId) => {
  // Get user's completed stories count
  const completedStories = db.UserStoryProgress.countDocuments({
    userId,
    hasCompleted: true
  });

  // Check for story completion achievements
  return db.Achievements.find({
    "conditions.storiesCompleted": { $lte: completedStories },
    isActive: true
  });
};

// Get hidden achievements (for admin only)
db.Achievements.find({
  type: "hidden",
  isActive: true
})
.sort({ sortOrder: 1 });

// Get achievements that unlock avatars
db.Achievements.find({
  "rewards.avatarUnlocks.0": { $exists: true },
  isActive: true
})
.select({
  achievementId: 1,
  title: 1,
  "rewards.avatarUnlocks": 1,
  rarity: 1
});

// Get genre-specific achievements
db.Achievements.find({
  "conditions.storiesInGenre": { $exists: true },
  isActive: true
})
.select({
  achievementId: 1,
  title: 1,
  "conditions.storiesInGenre": 1,
  rewards: 1
});

// Search achievements by title or description
db.Achievements.find({
  isActive: true,
  $or: [
    { title: { $regex: "story", $options: "i" } },
    { description: { $regex: "complete", $options: "i" } }
  ]
})
.sort({ sortOrder: 1 });

// Create new achievement
db.Achievements.insertOne({
  achievementId: "story_master_50",
  title: "เจ้านายเรื่องเล่า",
  description: "เล่นเรื่องราวครบ 50 เรื่อง",
  icon: "📚",
  category: "story",
  type: "automatic",
  conditions: {
    storiesCompleted: 50
  },
  rewards: {
    creditBonus: 100,
    maxCreditIncrease: 20,
    avatarUnlocks: ["bookworm_avatar"]
  },
  rarity: "epic",
  isActive: true,
  sortOrder: 15,
  createdAt: new Date()
});

// Get achievement completion statistics
db.Achievements.aggregate([
  { $match: { isActive: true } },
  { $lookup: {
    from: "UserAchievements",
    localField: "achievementId",
    foreignField: "achievementId",
    as: "unlocks"
  }},
  { $project: {
    achievementId: 1,
    title: 1,
    category: 1,
    rarity: 1,
    totalUnlocks: { $size: "$unlocks" },
    uniqueUsers: { $size: { $addToSet: "$unlocks.userId" } }
  }},
  { $sort: { totalUnlocks: -1 } }
]);

// Update achievement
db.Achievements.updateOne(
  { achievementId: "story_master_50" },
  {
    $set: {
      "rewards.creditBonus": 150,
      "rewards.maxCreditIncrease": 25,
      updatedAt: new Date()
    }
  }
);

// Deactivate achievement (soft delete)
db.Achievements.updateOne(
  { achievementId: "old_achievement" },
  {
    $set: {
      isActive: false,
      updatedAt: new Date()
    }
  }
);

// Get achievements that require specific story
db.Achievements.find({
  "conditions.specificStoryId": ObjectId("story_123"),
  isActive: true
});

// Get achievement progress for user
const getAchievementProgress = (userId) => {
  const stats = {
    storiesCompleted: db.UserStoryProgress.countDocuments({
      userId,
      hasCompleted: true
    }),
    totalPlaytime: db.UserStoryProgress.aggregate([
      { $match: { userId, hasCompleted: true } },
      { $group: { _id: null, total: { $sum: "$timeSpent" } } }
    ]).toArray()[0]?.total || 0,
    creditsSpent: db.CreditTransactions.aggregate([
      { $match: { userId, transactionType: "spend" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray()[0]?.total || 0,
    reviewsWritten: db.Reviews.countDocuments({ userId })
  };

  return db.Achievements.find({ isActive: true })
    .map(achievement => {
      const progress = calculateProgress(achievement, stats);
      return { achievement, progress };
    });
};
```

## Achievement Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **story** | Story-related achievements | Complete stories, genre mastery |
| **social** | Community interaction | Write reviews, engage with community |
| **special** | Event-based achievements | Limited-time events, collaborations |
| **milestone** | User progression | Login streaks, platform usage |

## Achievement Types

| Type | Description | Visibility |
|------|-------------|------------|
| **automatic** | Automatically awarded when conditions met | Visible |
| **conditional** | Requires specific sequence or hidden conditions | Hidden until completed |
| **hidden** | Completely secret achievements | Not shown until unlocked |

## Rarity Levels

| Rarity | Unlock Rate | Typical Rewards | Color Theme |
|--------|-------------|----------------|-------------|
| **common** | > 50% | Small credit bonus | Gray |
| **rare** | 10-50% | Medium credit bonus | Blue |
| **epic** | 1-10% | Large credit bonus + avatar | Purple |
| **legendary** | < 1% | Major rewards + exclusive content | Gold |

## Condition Types

### Completion Conditions

```javascript
// Story completion
conditions: {
  storiesCompleted: 10  // Complete 10 stories
}

// Genre mastery
conditions: {
  storiesInGenre: {
    genre: "romance",
    count: 5  // Complete 5 romance stories
  }
}

// Specific story
conditions: {
  specificStoryId: "story_halloween_special"
}

// All endings
conditions: {
  allEndingsInStory: "story_choose_your_path"
}
```

### Activity Conditions

```javascript
// Writing reviews
conditions: {
  reviewsWritten: 5  // Write 5 reviews
}

// Time investment
conditions: {
  totalPlaytime: 7200000  // 2 hours in milliseconds
}

// Spending
conditions: {
  creditsSpent: 500  // Spend 500 credits
}

// Consistency
conditions: {
  loginStreak: 7  // 7 consecutive days
}
```

## Reward System

### Credit Rewards

```javascript
rewards: {
  creditBonus: 50,          // One-time credit bonus
  maxCreditIncrease: 10     // Permanent credit cap increase
}
```

### Avatar Unlocks

```javascript
rewards: {
  avatarUnlocks: [
    "avatar_dragon_legendary",
    "avatar_wizard_epic"
  ]
}
```

## Achievement Progress Calculation

```javascript
const calculateProgress = (achievement, userStats) => {
  const { conditions } = achievement;
  let progress = 0;
  let completed = false;

  if (conditions.storiesCompleted) {
    progress = Math.min(100, (userStats.storiesCompleted / conditions.storiesCompleted) * 100);
    completed = userStats.storiesCompleted >= conditions.storiesCompleted;
  }

  if (conditions.storiesInGenre) {
    const genreCount = userStats.completedByGenre[conditions.storiesInGenre.genre] || 0;
    progress = Math.min(100, (genreCount / conditions.storiesInGenre.count) * 100);
    completed = genreCount >= conditions.storiesInGenre.count;
  }

  if (conditions.reviewsWritten) {
    progress = Math.min(100, (userStats.reviewsWritten / conditions.reviewsWritten) * 100);
    completed = userStats.reviewsWritten >= conditions.reviewsWritten;
  }

  return {
    progress: Math.round(progress),
    completed,
    currentValue: getCurrentValue(conditions, userStats),
    targetValue: getTargetValue(conditions)
  };
};
```

## Hidden Achievement Logic

```javascript
// Hidden achievements aren't shown until completed
const getVisibleAchievements = (userId, isAdmin = false) => {
  const query = { isActive: true };

  if (!isAdmin) {
    query.type = { $ne: "hidden" };
  }

  return db.Achievements.find(query).sort({ category: 1, sortOrder: 1 });
};
```

## Achievement Triggers

### Automatic Checking

Achievement checks are triggered by:

1. **Story Completion**
2. **Review Submission**
3. **Login Activity**
4. **Credit Transactions**
5. **User Interactions**

### Batch Processing

```javascript
// Check all eligible achievements for user
const checkAllAchievements = async (userId) => {
  const userStats = await getUserStats(userId);
  const achievements = await db.Achievements.find({ isActive: true });
  const userCompleted = await db.UserAchievements.find({ userId }).map(ua => ua.achievementId);

  for (const achievement of achievements) {
    if (!userCompleted.includes(achievement.achievementId)) {
      const { completed } = calculateProgress(achievement, userStats);

      if (completed) {
        await unlockAchievement(userId, achievement);
      }
    }
  }
};
```

## Integration Points

- **UserAchievements**: Tracks completions and unlock history
- **Users**: Updates credit limits and avatar collections
- **CreditTransactions**: Records achievement reward transactions
- **Avatars**: Manages achievement-based unlocks
- **UserStoryProgress**: Provides completion data for checks

## Performance Considerations

### Efficient Checking
- Batch process achievement checks
- Cache user statistics for frequent checks
- Use indexes for condition queries

### Notification System
```javascript
// Achievement unlock notification
const notifyAchievement = (userId, achievement) => {
  // Send notification to user
  // Update user's achievement count
  // Award rewards immediately
  // Create analytics event
};
```