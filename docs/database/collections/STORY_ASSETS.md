# StoryAssets Collection

## Mongoose Model Reference
- **Model File**: StoryAsset.ts (singular)
- **Model Class**: StoryAsset (singular)
- **Collection**: story_assets (plural, with underscores for readability)


**Purpose**: Media assets management for stories

## Schema

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

## Key Indexes

- `assetId` (unique)
- `storyId`
- `type`
- `status`
- `moderation.status`

## Query Examples

```javascript
// Get all assets for a story
db.StoryAssets.find({ storyId: ObjectId("story_id") })
.sort({ createdAt: -1 });

// Get assets by type
db.StoryAssets.find({
  storyId: ObjectId("story_id"),
  type: "image"
})
.sort({ createdAt: -1 });

// Get cover image for story
db.StoryAssets.findOne({
  storyId: ObjectId("story_id"),
  "usage.context": "cover_image"
});

// Get assets ready for use
db.StoryAssets.find({
  storyId: ObjectId("story_id"),
  status: "ready",
  "moderation.status": "approved"
});

// Get assets used in specific node
db.StoryAssets.find({
  storyId: ObjectId("story_id"),
  "usage.nodeId": "node_123"
});

// Update asset status after processing
db.StoryAssets.updateOne(
  { assetId: "asset_123" },
  {
    $set: {
      status: "ready",
      url: "https://cdn.example.com/processed_asset.jpg",
      thumbnailUrl: "https://cdn.example.com/thumb_asset.jpg",
      updatedAt: new Date()
    }
  }
);

// Get assets pending moderation
db.StoryAssets.find({
  "moderation.status": "pending"
})
.sort({ createdAt: -1 })
.limit(50);

// Approve asset
db.StoryAssets.updateOne(
  { assetId: "asset_123" },
  {
    $set: {
      "moderation.status": "approved",
      "moderation.reviewedBy": ObjectId("admin_id"),
      "moderation.reviewedAt": new Date(),
      "moderation.notes": "Approved - meets quality standards"
    }
  }
);

// Get storage usage by provider
db.StoryAssets.aggregate([
  { $match: { status: "ready" } },
  { $group: {
    _id: "$storage.provider",
    totalAssets: { $sum: 1 },
    totalSize: { $sum: "$size" },
    averageSize: { $avg: "$size" }
  }},
  { $project: {
    provider: "$_id",
    totalAssets: 1,
    totalSizeMB: { $round: [{ $divide: ["$totalSize", 1048576] }, 2] },
    averageSizeMB: { $round: [{ $divide: ["$averageSize", 1048576] }, 2] }
  }},
  { $sort: { totalSize: -1 } }
]);

// Get asset usage statistics
db.StoryAssets.aggregate([
  { $match: { storyId: ObjectId("story_id") } },
  { $group: {
    _id: "$type",
    count: { $sum: 1 },
    totalSize: { $sum: "$size" },
    averageSize: { $avg: "$size" }
  }},
  { $project: {
    type: "$_id",
    count: 1,
    totalSizeMB: { $round: [{ $divide: ["$totalSize", 1048576] }, 2] },
    averageSizeMB: { $round: [{ $divide: ["$averageSize", 1048576] }, 2] }
  }}
]);

// Find unused assets
db.StoryAssets.aggregate([
  { $match: { storyId: ObjectId("story_id") } },
  { $lookup: {
    from: "Stories",
    localField: "storyId",
    foreignField: "_id",
    as: "story"
  }},
  { $lookup: {
    from: "StoryNodes",
    localField: "assetId",
    foreignField: "media.bgMusicAssetId",
    as: "bgMusicUsage"
  }},
  { $lookup: {
    from: "StoryNodes",
    localField: "assetId",
    foreignField: "media.backgroundImageAssetId",
    as: "bgImageUsage"
  }},
  { $project: {
    assetId: 1,
    name: 1,
    type: 1,
    size: 1,
    isUsed: {
      $or: [
        { $gt: [{ $size: "$bgMusicUsage" }, 0] },
        { $gt: [{ $size: "$bgImageUsage" }, 0] },
        { $eq: ["$story.media.coverImageAssetId", "$assetId"] },
        { $eq: ["$story.media.headerImageAssetId", "$assetId"] },
        { $eq: ["$story.media.coverVideoAssetId", "$assetId"] },
        { $eq: ["$story.media.bgMusicAssetId", "$assetId"] }
      ]
    }
  }},
  { $match: { isUsed: false } }
]);

// Update asset usage context
db.StoryAssets.updateOne(
  { assetId: "asset_123" },
  {
    $push: {
      usage: {
        context: "scene_background",
        nodeId: "node_456",
        sortOrder: 1
      }
    }
  }
);
```

## Asset Types

### Image Assets
- **Cover Images**: Story thumbnails
- **Header Images**: Story page banners
- **Scene Backgrounds**: Node backgrounds
- **Gallery Images**: Story gallery

### Audio Assets
- **Background Music**: Story atmosphere
- **Sound Effects**: Interactive feedback
- **Voice Acting**: Character dialogue

### Video Assets
- **Cover Videos**: Animated previews
- **Cutscenes**: Story transitions
- **Trailers**: Promotional content

## Storage Providers

### Local Storage
```javascript
storage: {
  provider: "local",
  bucket: null,
  key: "/uploads/stories/asset_123.jpg",
  region: null
}
```

### AWS S3
```javascript
storage: {
  provider: "aws_s3",
  bucket: "talepick-assets",
  key: "stories/asset_123.jpg",
  region: "us-east-1"
}
```

### Google Cloud Storage
```javascript
storage: {
  provider: "google_cloud",
  bucket: "talepick-media",
  key: "stories/asset_123.jpg",
  region: "us-central1"
}
```

## Asset Processing Pipeline

### Upload Workflow

1. **Initial Upload**
```javascript
const initialAsset = {
  assetId: generateUniqueId(),
  storyId: storyId,
  name: "forest_background.jpg",
  type: "image",
  status: "uploading",
  uploadedBy: userId,
  createdAt: new Date()
};
```

2. **Processing**
```javascript
// Update during processing
db.StoryAssets.updateOne(
  { assetId: "asset_123" },
  {
    $set: {
      status: "processing",
      size: 2048576,
      dimensions: { width: 1920, height: 1080 }
    }
  }
);
```

3. **Completion**
```javascript
// Finalize processing
db.StoryAssets.updateOne(
  { assetId: "asset_123" },
  {
    $set: {
      status: "ready",
      url: "https://cdn.example.com/processed/asset_123.jpg",
      thumbnailUrl: "https://cdn.example.com/thumbnails/asset_123.jpg",
      "moderation.status": "pending",
      updatedAt: new Date()
    }
  }
);
```

## Moderation Process

### Automatic Flagging
```javascript
// Auto-flag large files for review
db.StoryAssets.find({
  size: { $gt: 52428800 } // > 50MB
}).updateMany(
  {},
  {
    $set: {
      "moderation.status": "pending",
      "moderation.notes": "Large file - requires manual review"
    }
  }
);
```

### Review Queue
```javascript
// Get assets pending moderation
const pendingAssets = db.StoryAssets.find({
  "moderation.status": "pending"
})
.sort({ createdAt: -1 })
.limit(20);
```

## Performance Optimization

### CDN Integration
- Store processed assets on CDN
- Cache thumbnails separately
- Use progressive image loading

### Asset Compression
```javascript
// Example size optimization
db.StoryAssets.aggregate([
  { $match: { type: "image" } },
  { $group: {
    _id: null,
    totalSize: { $sum: "$size" },
    averageSize: { $avg: "$size" },
    maxSize: { $max: "$size" }
  }},
  { $project: {
    totalSizeGB: { $round: [{ $divide: ["$totalSize", 1073741824] }, 2] },
    averageSizeMB: { $round: [{ $divide: ["$averageSize", 1048576] }, 2] },
    maxSizeMB: { $round: [{ $divide: ["$maxSize", 1048576] }, 2] }
  }}
]);
```

## Usage Analytics

### Asset Performance
```javascript
// Track most used asset types
db.StoryAssets.aggregate([
  { $group: {
    _id: "$type",
    count: { $sum: 1 },
    totalSize: { $sum: "$size" },
    usageCount: { $sum: { $size: "$usage" } }
  }},
  { $project: {
    type: "$_id",
    count: 1,
    totalSizeMB: { $round: [{ $divide: ["$totalSize", 1048576] }, 2] },
    averageUsagePerAsset: {
      $round: [{ $divide: ["$usageCount", "$count"] }, 2]
    }
  }},
  { $sort: { count: -1 } }
]);
```

## Integration Points

- **Stories**: Primary association via `storyId`
- **StoryNodes**: Media usage via `media.*AssetId` fields
- **StoryGallery**: Gallery image references
- **Moderation**: Content review workflow
- **Storage**: Multi-provider asset hosting
- **Analytics**: Asset performance tracking