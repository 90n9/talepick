# Stories Collection

**Purpose**: Interactive story content and metadata

## Schema

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

## Key Indexes

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

## Query Examples

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

// Update story statistics after completion
db.Stories.updateOne(
  { _id: ObjectId("story_id") },
  {
    $inc: {
      "stats.totalPlayers": 1
    }
  }
);

// Update average rating
db.Stories.aggregate([
  { $match: { _id: ObjectId("story_id") } },
  { $lookup: {
    from: "Reviews",
    localField: "_id",
    foreignField: "storyId",
    as: "reviews"
  }},
  { $project: {
    averageRating: { $avg: "$reviews.rating" },
    totalRatings: { $size: "$reviews" }
  }},
  { $limit: 1 }
]);
```

## Content Rating Guidelines

| Age Rating | Content Guidelines | Examples |
|------------|-------------------|----------|
| **0+** | General audiences | Educational stories, family content |
| **13+** | Mild content | Light romance, mild fantasy violence |
| **16+** | Moderate content | Romance, moderate violence, some language |
| **18+** | Mature content only | Intense themes, explicit content |

## Violence Level Scale

- **none**: No violence whatsoever
- **mild**: Fantasy/cartoon violence, light conflicts
- **moderate**: Realistic violence, some blood/injury
- **high**: Graphic violence, gore, intense disturbing content

## Content Warnings

Specific warning tags for sensitive content:
- `sexual_content`, `drug_use`, `strong_language`
- `horror`, `psychological`, `gambling`

## Moderation Workflow

### Status States

| Status | Description | User Visibility |
|--------|-------------|------------------|
| **pending** | Awaiting moderation review | Not visible |
| **approved** | Approved for publication | Visible |
| **suspended** | Temporarily suspended | Not visible |
| **removed** | Permanently removed | Not visible |

### Auto-Moderation

```javascript
// Automatic content flagging
const flaggedWords = ['spam', 'inappropriate', 'harassment'];
db.Stories.find({
  $or: [
    { title: { $regex: flaggedWords.join('|'), $options: 'i' } },
    { description: { $regex: flaggedWords.join('|'), $options: 'i' } }
  ]
});

// Update report count and auto-suspend if threshold exceeded
db.Stories.updateOne(
  { _id: ObjectId("story_id") },
  {
    $inc: { "moderation.reportCount": 1 },
    $set: {
      "moderation.status": "suspended",
      "moderation.moderatedAt": new Date(),
      "moderation.moderatedBy": ObjectId("system_bot")
    }
  }
);
```

## Performance Statistics Tracking

The `stats` object tracks story performance:

```javascript
// Example statistics update
db.Stories.updateOne(
  { _id: ObjectId("story_id") },
  {
    $set: {
      "stats.averageRating": 4.2,
      "stats.totalRatings": 150,
      "stats.averagePlaytime": 1800000, // 30 minutes in ms
      "stats.totalEndings": 5,
      "stats.totalChoices": 42
    }
  }
);
```

## Media Asset Management

### Supported Asset Types
- **Cover Images**: Thumbnail previews
- **Header Images**: Story page headers
- **Cover Videos**: Animated previews
- **Background Music**: Story atmosphere
- **Trailers**: YouTube/Vimeo integration

### Asset URL Generation

```javascript
// Update story with new media URLs
db.Stories.updateOne(
  { _id: ObjectId("story_id") },
  {
    $set: {
      "media.coverImageUrl": "https://cdn.example.com/stories/cover.jpg",
      "media.trailerUrl": "https://youtube.com/watch?v=example",
      "media.bgMusicUrl": "https://cdn.example.com/music/bg.mp3"
    }
  }
);
```

## Gallery Integration

The `gallery` field references StoryGallery collection:

```javascript
// Update gallery image count
db.Stories.updateOne(
  { _id: ObjectId("story_id") },
  {
    $set: {
      "gallery.imageIds": ["img_001", "img_002", "img_003"],
      "gallery.totalImages": 3,
      "gallery.featuredImageId": "img_001"
    }
  }
);
```

## Soft Delete Support

Stories are never permanently deleted:

```javascript
// Soft delete a story
db.Stories.updateOne(
  { _id: ObjectId("story_id") },
  {
    $set: {
      deletedAt: new Date(),
      deletedBy: ObjectId("admin_id")
    }
  }
);

// Query only active stories
db.Stories.find({
  deletedAt: null,
  "moderation.status": "approved"
});
```

## Integration Points

- **StoryNodes**: Content via `storyId`
- **StoryGallery**: Media gallery via `gallery.imageIds`
- **Reviews**: User feedback via `storyId`
- **UserStoryProgress**: Play tracking via `storyId`
- **Genres**: Category via `metadata.genre`