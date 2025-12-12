# StoryGallery Collection

## Mongoose Model Reference
- **Model File**: StoryGallery.ts (singular)
- **Model Class**: StoryGallery (singular)
- **Collection**: story_gallery (plural, with underscores for readability)


**Purpose**: Story image gallery management with cached URLs for performance optimization

## Schema

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

## Key Design Principles

- ✅ **URL Caching**: All image sizes cached as direct URLs to avoid $lookup joins with StoryAssets
- ✅ **Performance Optimized**: Frontend can directly access URLs without additional queries
- ✅ **Multiple Sizes**: Automatic thumbnail generation for different use cases
- ✅ **Thai Language Support**: Captions and descriptions in Thai
- ✅ **Moderation Ready**: Built-in moderation workflow for gallery images

## Key Indexes

- `galleryImageId` (unique)
- `storyId` + `display.sortOrder` (for ordered gallery retrieval)
- `storyId` + `display.isFeatured` (quick featured image lookup)
- `storyId` + `moderation.status` (filter approved images)
- `display.showInPreview` + `storyId` (preview carousel images)

## Query Examples

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

// Get gallery statistics for story
db.StoryGallery.aggregate([
  { $match: { storyId: ObjectId("story_id") } },
  { $group: {
    _id: "$moderation.status",
    count: { $sum: 1 },
    totalViews: { $sum: "$analytics.viewCount" },
    totalSize: { $sum: "$metadata.fileSize" }
  }},
  { $project: {
    status: "$_id",
    count: 1,
    totalViews: 1,
    averageViewsPerImage: {
      $cond: [
        { $eq: ["$count", 0] },
        0,
        { $round: [{ $divide: ["$totalViews", "$count"] }, 2] }
      ]
    },
    totalSizeMB: { $round: [{ $divide: ["$totalSize", 1048576] }, 2] }
  }}
]);

// Get most popular gallery images (platform-wide)
db.StoryGallery.aggregate([
  { $match: { moderation: "approved" } },
  { $sort: { "analytics.viewCount": -1 } },
  { $limit: 20 },
  { $lookup: {
    from: "Stories",
    localField: "storyId",
    foreignField: "_id",
    as: "story"
  }},
  { $unwind: "$story" },
  { $project: {
    galleryImageId: 1,
    name: 1,
    caption: 1,
    "urls.thumbnail": 1,
    "analytics.viewCount": 1,
    storyTitle: "$story.title",
    storyId: "$story._id"
  }}
]);

// Set featured image for story
db.StoryGallery.updateMany(
  { storyId: ObjectId("story_id") },
  { $set: { "display.isFeatured": false } }
);
db.StoryGallery.updateOne(
  { galleryImageId: "gallery_123" },
  { $set: { "display.isFeatured": true } }
);

// Get images pending moderation
db.StoryGallery.find({
  moderation: "pending"
})
.sort({ createdAt: -1 })
.limit(50);

// Approve gallery image
db.StoryGallery.updateOne(
  { galleryImageId: "gallery_123" },
  {
    $set: {
      moderation: "approved",
      "moderation.reviewedBy": ObjectId("admin_id"),
      "moderation.reviewedAt": new Date(),
      "moderation.notes": "Approved - meets quality standards"
    }
  }
);

// Hide image from public gallery
db.StoryGallery.updateOne(
  { galleryImageId: "gallery_123" },
  {
    $set: { "display.isHidden": true }
  }
);

// Get gallery performance metrics
db.StoryGallery.aggregate([
  { $group: {
    _id: null,
    totalImages: { $sum: 1 },
    approvedImages: {
      $sum: { $cond: [{ $eq: ["$moderation", "approved"] }, 1, 0] }
    },
    pendingImages: {
      $sum: { $cond: [{ $eq: ["$moderation", "pending"] }, 1, 0] }
    },
    totalViews: { $sum: "$analytics.viewCount" },
    totalClicks: { $sum: "$analytics.clickCount" },
    totalStorageMB: {
      $round: [{ $divide: [{ $sum: "$metadata.fileSize" }, 1048576] }, 2]
    }
  }},
  { $project: {
    totalImages: 1,
    approvedImages: 1,
    pendingImages: 1,
    approvalRate: {
      $round: [
        { $multiply: [
          { $divide: ["$approvedImages", "$totalImages"] },
          100
        ]},
        2
      ]
    },
    totalViews: 1,
    totalClicks: 1,
    clickThroughRate: {
      $cond: [
        { $eq: ["$totalViews", 0] },
        0,
        { $round: [
          { $multiply: [
            { $divide: ["$totalClicks", "$totalViews"] },
            100
          ]},
          2
        ]}
      ]
    },
    totalStorageMB: 1
  }}
]);
```

## URL Generation Strategy

When creating a gallery image, generate all sizes:

```javascript
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

## Image Size Specifications

| Size | Dimensions | Use Case |
|------|------------|----------|
| **original** | Original upload | Download, full quality |
| **large** | 1200x800 | Desktop gallery view |
| **medium** | 800x533 | Tablet display |
| **thumbnail** | 300x200 | List thumbnails |
| **small** | 150x100 | Preview carousel |

## Display Settings

### Featured Images
```javascript
// Set as primary gallery image
display: {
  isFeatured: true,        // Only one per story
  showInPreview: true     // Featured images always show in preview
}
```

### Preview Carousel
```javascript
// Include in story preview
display: {
  showInPreview: true,    // Limit to first 5 images
  sortOrder: 2           // Order matters for preview
}
```

### Hidden Images
```javascript
// Hide from public view (admin only)
display: {
  isHidden: true,         // Hidden from public gallery
  showInPreview: false   // Never in preview
}
```

## Moderation Workflow

### Status Flow
1. **pending** → Awaiting review
2. **approved** → Publicly visible
3. **rejected** → Hidden from public

### Auto-Approval Criteria
```javascript
// Auto-approve small, verified images
db.StoryGallery.updateMany(
  {
    moderation: "pending",
    "metadata.fileSize": { $lt: 2097152 }, // < 2MB
    "metadata.mimeType": { $in: ["image/jpeg", "image/png"] }
  },
  {
    $set: {
      moderation: "approved",
      "moderation.reviewedBy": ObjectId("auto_system"),
      "moderation.reviewedAt": new Date(),
      "moderation.notes": "Auto-approved - meets criteria"
    }
  }
);
```

## Performance Benefits

### No $lookup Required
Traditional approach:
```javascript
// Slow: requires joining with StoryAssets
db.StoryGallery.find({ storyId: ObjectId("story_id") })
.lookup({ from: "StoryAssets", localField: "assetId", ... });
```

Optimized approach:
```javascript
// Fast: URLs cached directly
db.StoryGallery.find({ storyId: ObjectId("story_id") })
.select({ "urls.thumbnail": 1, "urls.medium": 1 });
```

## Analytics Tracking

### View Analytics
```javascript
// Track image views
const trackImage = (galleryImageId) => {
  db.StoryGallery.updateOne(
    { galleryImageId },
    {
      $inc: { "analytics.viewCount": 1 },
      $set: { "analytics.lastViewedAt": new Date() }
    }
  );
};
```

### Click Analytics
```javascript
// Track image clicks for interaction metrics
const trackClick = (galleryImageId) => {
  db.StoryGallery.updateOne(
    { galleryImageId },
    { $inc: { "analytics.clickCount": 1 } }
  );
};
```

## Integration Points

- **Stories**: Parent story via `storyId`
- **StoryAssets**: Original asset reference via `assetId`
- **Moderation**: Content review workflow
- **Analytics**: User engagement tracking
- **Frontend**: Direct URL access without additional queries