# UserStoryProgress Collection

## Mongoose Model Reference
- **Model File**: USER_STORY_PROGRESS (singular)
- **Model Class**: USER STORY PROGRESS (singular)
- **Collection**: LULSLELR LSLTLOLRLY LPLRLOLGLRLELSLSs (plural, with underscores for readability)


**Purpose**: Game progress tracking with multiple playthroughs and choice tracking

## Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  storyId: ObjectId,          // references Stories

  // Playthrough identification
  playthroughId: String,      // unique identifier for each playthrough

  // Progress tracking
  currentNodeId: String,      // current node in story
  visitedNodes: [String],     // array of visited node IDs
  choices: [{                 // user's choice history
    nodeId: String,
    choiceId: String,
    choiceText: String,
    madeAt: Date
  }],

  // Playthrough status
  hasCompleted: Boolean,
  completedAt: Date,
  endingData: {
    endingId: String,
    endingTitle: String,
    endingType: String,       // 'good' | 'bad' | 'neutral' | 'secret'
    isRare: Boolean
  },

  // Performance metrics
  timeSpent: Number,          // total time in milliseconds
  creditsSpent: Number,
  nodesVisited: Number,       // denormalized count
  choicesMade: Number,        // denormalized count

  // Session tracking
  lastPlayedAt: Date,
  sessionCount: Number,       // how many sessions played
  currentSessionStart: Date,

  // Playthrough metadata
  playthroughType: String,    // 'normal' | 'speedrun' | 'completionist'
  difficulty: String,         // if story has difficulty levels
  customSettings: Object,     // story-specific settings

  createdAt: Date,
  updatedAt: Date
}
```

## Key Indexes

- `userId` + `storyId` + `playthroughId` (unique)
- `userId` + `lastPlayedAt` (user's recent progress)
- `storyId` + `hasCompleted` (story completion statistics)
- `hasCompleted` + `completedAt` (recent completions)
- `endingData.isRare` (rare ending tracking)

## Query Examples

```javascript
// Get user's progress for a specific story
db.UserStoryProgress.find({
  userId: ObjectId("user_id"),
  storyId: ObjectId("story_id")
}).sort({ createdAt: -1 });

// Get user's active playthroughs (incomplete)
db.UserStoryProgress.find({
  userId: ObjectId("user_id"),
  hasCompleted: false
}).sort({ lastPlayedAt: -1 });

// Get user's completed stories with endings
db.UserStoryProgress.aggregate([
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
  { $project: {
    storyTitle: "$story.title",
    completedAt: 1,
    endingData: 1,
    playthroughType: 1,
    timeSpent: 1
  }},
  { $sort: { completedAt: -1 } }
]);

// Update progress after making a choice
db.UserStoryProgress.updateOne(
  {
    _id: ObjectId("progress_id"),
    userId: ObjectId("user_id")
  },
  {
    $push: {
      choices: {
        nodeId: "node_123",
        choiceId: "choice_456",
        choiceText: "เลือกไปทางซ้าย",
        madeAt: new Date()
      }
    },
    $set: {
      currentNodeId: "node_456",
      lastPlayedAt: new Date(),
      "updatedAt": new Date()
    },
    $inc: {
      choicesMade: 1
    }
  }
);

// Complete a playthrough
db.UserStoryProgress.updateOne(
  { _id: ObjectId("progress_id") },
  {
    $set: {
      hasCompleted: true,
      completedAt: new Date(),
      endingData: {
        endingId: "ending_good_01",
        endingTitle: "Happy Ending",
        endingType: "good",
        isRare: false
      },
      updatedAt: new Date()
    }
  }
);

// Get story completion statistics
db.UserStoryProgress.aggregate([
  { $match: { storyId: ObjectId("story_id") } },
  { $group: {
    _id: "$hasCompleted",
    count: { $sum: 1 },
    averageTimeSpent: { $avg: "$timeSpent" }
  }},
  { $project: {
    status: { $cond: ["$_id", "completed", "in_progress"] },
    count: 1,
    averageTimeSpent: { $round: ["$averageTimeSpent / 60000", 2] } // minutes
  }}
]);

// Get rare endings discovered by users
db.UserStoryProgress.find({
  storyId: ObjectId("story_id"),
  "endingData.isRare": true,
  hasCompleted: true
})
.select({
  userId: 1,
  "endingData.endingId": 1,
  "endingData.endingTitle": 1,
  completedAt: 1
})
.sort({ completedAt: -1 });

// Calculate user story statistics
db.UserStoryProgress.aggregate([
  { $match: { userId: ObjectId("user_id") } },
  { $group: {
    _id: null,
    totalPlaythroughs: { $sum: 1 },
    completedPlaythroughs: { $sum: { $cond: ["$hasCompleted", 1, 0] } },
    totalTimeSpent: { $sum: "$timeSpent" },
    averagePlaythroughTime: { $avg: "$timeSpent" },
    totalCreditsSpent: { $sum: "$creditsSpent" }
  }},
  { $project: {
    totalPlaythroughs: 1,
    completedPlaythroughs: 1,
    completionRate: {
      $round: [
        { $multiply: [
          { $divide: ["$completedPlaythroughs", "$totalPlaythroughs"] },
          100
        ]},
        2
      ]
    },
    totalTimeSpentHours: { $round: [{ $divide: ["$totalTimeSpent", 3600000] }, 2] },
    averagePlaythroughTimeMinutes: { $round: [{ $divide: ["$averagePlaythroughTime", 60000] }, 2] },
    totalCreditsSpent: 1
  }}
]);

// Get choices made at specific node (for analytics)
db.UserStoryProgress.aggregate([
  { $match: { storyId: ObjectId("story_id") } },
  { $unwind: "$choices" },
  { $match: { "choices.nodeId": "node_123" } },
  { $group: {
    _id: "$choices.choiceId",
    choiceText: { $first: "$choices.choiceText" },
    count: { $sum: 1 },
    percentage: {
      $multiply: [
        100,
        {
          $divide: [
            { $sum: 1 },
            {
              $sum: "$choices"
            }
          ]
        }
      ]
    }
  }},
  { $sort: { count: -1 } }
]);
```

## Playthrough Types

| Type | Description | Use Case |
|------|-------------|----------|
| **normal** | Standard playthrough | Default mode |
| **speedrun** | Fastest completion time | Competitive gameplay |
| **completionist** | 100% exploration | Achievement hunting |

## Ending Types

| Type | Rarity | Description |
|------|--------|-------------|
| **good** | Common | Positive story outcome |
| **bad** | Common | Negative story outcome |
| **neutral** | Common | Mixed outcome |
| **secret** | Rare | Hidden/alternative ending |
| **true** | Very Rare | Canon/best ending |

## Progress Tracking Features

### Node Visit Tracking
- `visitedNodes`: Array prevents revisiting completed sections
- Supports skip/revisit logic in story flow
- Enables completion percentage calculation

### Choice History
- Full audit trail of user decisions
- Time-stamped for analytics
- Supports undo/redo functionality

### Session Management
- Tracks multiple play sessions
- Session duration analytics
- Resume play functionality

## Performance Optimization

### Denormalized Counts
- `nodesVisited`: Quick progress percentage
- `choicesMade`: User engagement metrics
- `timeSpent`: Performance analytics without aggregation

### Efficient Updates
```javascript
// Batch update multiple fields in single operation
db.UserStoryProgress.updateOne(
  { _id: progressId },
  {
    $push: { choices: newChoice },
    $addToSet: { visitedNodes: newNodeId },
    $set: { currentNodeId: newNodeId },
    $inc: {
      choicesMade: 1,
      timeSpent: sessionDuration,
      creditsSpent: choiceCost
    }
  }
);
```

## Integration Points

### Stories Collection
- Validates node IDs exist in story
- Fetches node content for display
- Updates story completion statistics

### CreditTransactions
- Records credit spending on choices
- Validates sufficient balance
- Handles credit refunds on undo

### Analytics
- Tracks user engagement patterns
- Story difficulty analysis
- Choice popularity metrics

### Achievements
- Triggers completion-based achievements
- Tracks rare ending discoveries
- Monitors speedrun attempts

## Data Privacy

- User progress considered personal data
- Optional anonymization for analytics
- Right to deletion compliance
- Export functionality for users