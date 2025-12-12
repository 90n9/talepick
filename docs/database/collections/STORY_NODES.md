# StoryNodes Collection

## Mongoose Model Reference
- **Model File**: StoryNode.ts (singular)
- **Model Class**: StoryNode (singular)
- **Collection**: story_nodes (plural, with underscores for readability)


**Purpose**: Individual story nodes with branching choices and rewards

## Schema

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
    type: String,             // 'good' | 'bad' | 'neutral' | 'secret'
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

## Key Indexes

- `storyId`
- `nodeId` + `storyId` (unique)
- `isEnding`
- `analytics.totalVisits` (descending)

## Query Examples

```javascript
// Get all nodes for a story
db.StoryNodes.find({ storyId: ObjectId("story_id") })
.sort({ nodeId: 1 });

// Get starting node for a story
db.StoryNodes.findOne({
  storyId: ObjectId("story_id"),
  nodeId: "start_node"
});

// Get story's all endings
db.StoryNodes.find({
  storyId: ObjectId("story_id"),
  isEnding: true
})
.select({
  nodeId: 1,
  "endingData.title": 1,
  "endingData.type": 1,
  "endingData.isSecret": 1,
  "endingData.isRare": 1
});

// Get node with choice analytics
db.StoryNodes.findOne({
  storyId: ObjectId("story_id"),
  nodeId: "node_123"
})
.select({
  segments: 1,
  choices: 1,
  "analytics.choiceDistribution": 1
});

// Update choice analytics after user makes choice
db.StoryNodes.updateOne(
  {
    storyId: ObjectId("story_id"),
    nodeId: "node_123",
    "choices.id": "choice_456"
  },
  {
    $inc: { "analytics.totalVisits": 1 },
    $set: {
      "analytics.choiceDistribution.$[choice].count":
        { $ifNull: ["$analytics.choiceDistribution.$[choice].count", 0] } + 1
    }
  },
  {
    arrayFilters: [{ "choice.id": "choice_456" }]
  }
);

// Get rare endings discovered by users
db.StoryNodes.aggregate([
  { $match: {
    isEnding: true,
    "endingData.isRare": true
  }},
  { $lookup: {
    from: "Stories",
    localField: "storyId",
    foreignField: "_id",
    as: "story"
  }},
  { $unwind: "$story" },
  { $lookup: {
    from: "UserStoryProgress",
    let: {
      storyId: "$storyId",
      nodeId: "$nodeId"
    },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$storyId", "$$storyId"] },
              { $eq: ["$currentNodeId", "$$nodeId"] },
              { $eq: ["$hasCompleted", true] }
            ]
          }
        }
      }
    ],
    as: "discoveries"
  }},
  { $match: { "discoveries.0": { $exists: true } } },
  { $project: {
    storyTitle: "$story.title",
    nodeId: 1,
    "endingData.title": 1,
    "endingData.type": 1,
    discoveryCount: { $size: "$discoveries" }
  }},
  { $sort: { discoveryCount: -1 } }
]);

// Get story statistics from nodes
db.StoryNodes.aggregate([
  { $match: { storyId: ObjectId("story_id") } },
  { $group: {
    _id: null,
    totalNodes: { $sum: 1 },
    totalChoices: {
      $sum: { $size: { $ifNull: ["$choices", []] } }
    },
    totalEndings: {
      $sum: { $cond: ["$isEnding", 1, 0] }
    },
    secretEndings: {
      $sum: { $cond: [{ $and: ["$isEnding", "$endingData.isSecret"] }, 1, 0] }
    },
    rareEndings: {
      $sum: { $cond: [{ $and: ["$isEnding", "$endingData.isRare"] }, 1, 0] }
    },
    totalVisits: { $sum: "$analytics.totalVisits" }
  }},
  { $project: {
    _id: 0,
    totalNodes: 1,
    totalChoices: 1,
    totalEndings: 1,
    secretEndings: 1,
    rareEndings: 1,
    totalVisits: 1,
    averageVisitsPerNode: {
      $round: [{ $divide: ["$totalVisits", "$totalNodes"] }, 2]
    }
  }}
]);

// Find nodes with specific requirements
db.StoryNodes.find({
  storyId: ObjectId("story_id"),
  "choices": {
    $elemMatch: {
      "requirements.achievementId": { $exists: true }
    }
  }
})
.select({
  nodeId: 1,
  "choices.$": 1
});

// Get nodes with media assets
db.StoryNodes.find({
  storyId: ObjectId("story_id"),
  $or: [
    { "media.bgMusicAssetId": { $exists: true } },
    { "media.backgroundImageAssetId": { $exists: true } }
  ]
})
.select({
  nodeId: 1,
  media: 1
});

// Update layout information from visual editor
db.StoryNodes.updateOne(
  {
    storyId: ObjectId("story_id"),
    nodeId: "node_123"
  },
  {
    $set: {
      "layout.x": 150,
      "layout.y": 200,
      "layout.width": 120,
      "layout.height": 80,
      "editorMetadata.lastModifiedBy": ObjectId("editor_id"),
      "editorMetadata.lastEditorAction": "move_node",
      "editorMetadata.editorVersion": "2.1.0"
    }
  }
);
```

## Node Structure

### Segments
Content can be mixed media:

```javascript
// Example: Text with background music
{
  segments: [
    {
      type: "text",
      text: "คุณเดินเข้าไปในป่าทึบ...",
      duration: 3000
    }
  ],
  media: {
    bgMusicUrl: "forest_ambience.mp3",
    backgroundImageUrl: "forest_path.jpg"
  }
}

// Example: Video scene
{
  segments: [
    {
      type: "video",
      url: "cinematic_intro.mp4",
      duration: 5000
    },
    {
      type: "text",
      text: "หลังจากฉากนั้น...",
      duration: 2000
    }
  ]
}
```

### Choices
Choices can have requirements and costs:

```javascript
choices: [{
  id: "explore_forest",
  text: "สำรวจป่า",
  nextNodeId: "forest_path_1",
  requirements: {
    minCredits: 5
  },
  costs: {
    credits: 1
  }
},
{
  id: "go_to_town",
  text: "ไปที่เมือง",
  nextNodeId: "town_square",
  requirements: {
    achievementId: "completed_tutorial"
  },
  costs: {
    credits: 2
  }
}]
```

## Ending Types

| Type | Description | Rarity |
|------|-------------|--------|
| **good** | Positive outcome | Common |
| **bad** | Negative outcome | Common |
| **neutral** | Mixed/ambiguous | Uncommon |
| **secret** | Hidden achievement path | Rare |
| **true** | Canon/best ending | Very Rare |

## Analytics and Insights

### Choice Distribution Tracking
```javascript
// Get most popular choices across all stories
db.StoryNodes.aggregate([
  { $unwind: "$choices" },
  { $group: {
    _id: "$choices.id",
    choiceText: { $first: "$choices.text" },
    totalSelections: { $sum: "$analytics.choiceDistribution.count" },
    storyCount: { $addToSet: "$storyId" }
  }},
  { $project: {
    choiceId: "$_id",
    choiceText: 1,
    totalSelections: 1,
    storyCount: { $size: "$storyCount" },
    averageSelections: {
      $divide: ["$totalSelections", { $size: "$storyCount" }]
    }
  }},
  { $sort: { totalSelections: -1 } },
  { $limit: 50 }
]);
```

### Completion Rate Analysis
```javascript
// Analyze drop-off points in story
db.StoryNodes.aggregate([
  { $match: { storyId: ObjectId("story_id") } },
  { $lookup: {
    from: "StoryNodes",
    let: { currentNodeId: "$nodeId" },
    pipeline: [
      {
        $match: {
          "choices.nextNodeId": "$$currentNodeId"
        }
      }
    ],
    as: "incomingNodes"
  }},
  { $project: {
    nodeId: 1,
    totalVisits: "$analytics.totalVisits",
    incomingCount: { $size: "$incomingNodes" },
    dropoffRate: {
      $subtract: [
        "$analytics.totalVisits",
        { $size: "$incomingNodes" }
      ]
    }
  }},
  { $sort: { dropoffRate: -1 } }
]);
```

## Visual Editor Support

### Layout Coordinates
```javascript
// Node positioning for visual story editor
layout: {
  x: 150,      // X position in pixels
  y: 200,      // Y position in pixels
  width: 120,  // Node width in pixels
  height: 80   // Node height in pixels
}
```

### Editor Metadata
Tracks editing history and collaboration:

```javascript
editorMetadata: {
  createdBy: ObjectId("author_123"),
  lastModifiedBy: ObjectId("editor_456"),
  editorVersion: "2.1.0",
  lastEditorAction: "add_choice"
}
```

## Performance Considerations

### Efficient Node Loading
- Index on `storyId` for fast story node retrieval
- Segments array allows mixed media without joins
- Choice analytics embedded for quick access

### Analytics Updates
```javascript
// Batch update node statistics
db.StoryNodes.updateMany(
  { storyId: ObjectId("story_id") },
  {
    $inc: { "analytics.totalVisits": 1 }
  }
);
```

## Integration Points

- **Stories**: Parent story via `storyId`
- **UserStoryProgress**: Current position tracking
- **Achievements**: Unlock conditions via choices
- **Avatars**: Reward system via rewards
- **StoryAssets**: Media references via asset IDs
- **Analytics**: Choice tracking and user behavior