# UserFavorites Collection

**Purpose**: Simple story favorite tracking (pure relationship collection)

## Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  storyId: ObjectId,          // references Stories

  addedAt: Date,              // when user added to favorites
  createdAt: Date
}
```

## Key Design Principle

- ✅ **Pure relationship tracking** - just links users to stories they favorited
- ✅ **No denormalized data** - story details fetched via $lookup from Stories collection
- ✅ **Minimal storage** - small documents, optimal for high-volume favoriting
- ✅ **Simple queries** - straightforward relationship queries with joins

## Query Examples

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

// Get favorite count for a story
db.UserFavorites.countDocuments({
  storyId: ObjectId("story_id")
});

// Add to favorites
db.UserFavorites.insertOne({
  userId: ObjectId("user_id"),
  storyId: ObjectId("story_id"),
  addedAt: new Date(),
  createdAt: new Date()
});

// Get user's favorite statistics
db.UserFavorites.aggregate([
  { $match: { userId: ObjectId("user_id") } },
  { $lookup: {
    from: "Stories",
    localField: "storyId",
    foreignField: "_id",
    as: "story"
  }},
  { $unwind: "$story" },
  { $group: {
    _id: null,
    totalFavorites: { $sum: 1 },
    genres: { $addToSet: "$story.metadata.genre" },
    averageRating: { $avg: "$story.stats.averageRating" },
    newestFavorite: { $max: "$addedAt" }
  }}
]);

// Get recently favorited stories for feed
db.UserFavorites.aggregate([
  { $match: { userId: ObjectId("user_id") } },
  { $sort: { addedAt: -1 } },
  { $limit: 10 },
  { $lookup: {
    from: "Stories",
    localField: "storyId",
    foreignField: "_id",
    as: "story"
  }},
  { $unwind: "$story" },
  { $project: {
    addedAt: 1,
    "story._id": 1,
    "story.title": 1,
    "story.media.coverImageUrl": 1,
    "story.stats.averageRating": 1,
    "story.metadata.genre": 1
  }}
]);
```

## Use Cases

### User Experience
- Quick bookmarking of interesting stories
- Personal library organization
- Discovery from user's favorite patterns

### Analytics
- Story popularity metrics
- User preference analysis
- Recommendation engine input
- Trending content identification

### Content Strategy
- Understanding which stories resonate with users
- Genre preference analysis
- Author performance metrics
- Content optimization insights

## Performance Considerations

### Small Documents
Each favorite record is minimal:
- No story data duplication
- Fast insertion/deletion operations
- Efficient pagination support

### Join Operations
Story details fetched via $lookup:
- Always up-to-date information
- No data synchronization issues
- Flexible query capabilities

### Index Strategy
- Composite index on `(userId, storyId)` for uniqueness
- Index on `userId` for user favorite queries
- Index on `storyId` for popularity analysis

## Relationship Constraints

```javascript
// Unique constraint: User can favorite a story only once
db.UserFavorites.createIndex(
  { userId: 1, storyId: 1 },
  { unique: true }
);
```

## Cascade Operations

### When a story is deleted (soft delete):
```javascript
// Mark favorites as inactive (optional)
db.UserFavorites.updateMany(
  { storyId: ObjectId("deleted_story_id") },
  { $set: { deletedAt: new Date() } }
);
```

### When a user is deleted:
```javascript
// Remove all user's favorites
db.UserFavorites.deleteMany({
  userId: ObjectId("deleted_user_id")
});
```

## Integration Points

The UserFavorites collection integrates with:

- **Stories**: Via `storyId` for story details
- **Users**: Via `userId` for user ownership
- **UserProgress**: For play status on favorited stories
- **Analytics**: For user behavior tracking
- **Recommendations**: For personalized content suggestions

## Future Enhancements

Potential extensions to the collection:

```javascript
// Extended schema for additional features
{
  _id: ObjectId,
  userId: ObjectId,
  storyId: ObjectId,
  addedAt: Date,
  createdAt: Date,

  // Optional metadata
  tags: [String],              // User's tags for organization
  notes: String,               // Personal notes about the story
  priority: Number,            // Reading priority (1-5)
  isInPlaylist: Boolean,       // Part of custom playlists

  // Analytics fields
  lastAccessedAt: Date,        // When user last viewed this favorite
  accessCount: Number          // How many times accessed from favorites
}
```