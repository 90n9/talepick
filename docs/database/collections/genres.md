# Genres Collection

**Purpose**: Story genre classifications with Thai language support

## Schema

```javascript
{
  _id: ObjectId,
  slug: String,               // unique identifier, URL-friendly
  name: String,               // Thai display name
  description: String,
  storyCount: Number,         // Denormalized for performance
  isActive: Boolean,
  sortOrder: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Example

```javascript
{
  _id: ObjectId("64f1a2b3c4d5e6f7g8h9i0j1"),
  slug: "sci-fi",
  name: "ไซไฟ",
  description: "เรื่องราวสมัยใหม่ วิทยาศาสตร์ เทคโนโลยี และอนาคต",
  storyCount: 25,
  isActive: true,
  sortOrder: 1,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-15T10:30:00Z")
}
```

## Key Indexes

- `slug` (unique)
- `isActive`
- `sortOrder`

## Query Examples

```javascript
// Get all active genres
db.Genres.find({ isActive: true })
.sort({ sortOrder: 1 });

// Get genre by slug
db.Genres.findOne({ slug: "romance" });

// Update story count for all genres
db.Stories.aggregate([
  { $match: { "metadata.isPublished": true } },
  { $group: {
    _id: "$metadata.genre",
    count: { $sum: 1 }
  }},
  { $lookup: {
    from: "Genres",
    localField: "_id",
    foreignField: "slug",
    as: "genre"
  }},
  { $unwind: "$genre" },
  { $project: {
    genreId: "$genre._id",
    newCount: "$count"
  }}
]).forEach(result => {
  db.Genres.updateOne(
    { _id: result.genreId },
    { $set: { storyCount: result.newCount, updatedAt: new Date() } }
  );
});

// Get popular genres by story count
db.Genres.find({ isActive: true })
.sort({ storyCount: -1 })
.limit(10);

// Add new genre
db.Genres.insertOne({
  slug: "mystery",
  name: "ลึกลับ",
  description: "เรื่องราวปริศนา สืบสวน และความลับ",
  storyCount: 0,
  isActive: true,
  sortOrder: 5,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Deactivate genre (soft delete)
db.Genres.updateOne(
  { slug: "western" },
  {
    $set: {
      isActive: false,
      updatedAt: new Date()
    }
  }
);

// Update genre ordering
db.Genres.bulkWrite([
  {
    updateOne: {
      filter: { slug: "romance" },
      update: { $set: { sortOrder: 1, updatedAt: new Date() } }
    }
  },
  {
    updateOne: {
      filter: { slug: "horror" },
      update: { $set: { sortOrder: 2, updatedAt: new Date() } }
    }
  },
  {
    updateOne: {
      filter: { slug: "adventure" },
      update: { $set: { sortOrder: 3, updatedAt: new Date() } }
    }
  }
]);

// Get genre with story statistics
db.Genres.aggregate([
  { $match: { isActive: true } },
  { $lookup: {
    from: "Stories",
    localField: "slug",
    foreignField: "metadata.genre",
    as: "stories"
  }},
  { $project: {
    slug: 1,
    name: 1,
    description: 1,
    storyCount: 1,
    publishedStories: {
      $size: {
        $filter: {
          input: "$stories",
          cond: { $eq: ["$$this.metadata.isPublished", true] }
        }
      }
    },
    averageRating: {
      $avg: {
        $filter: {
          input: "$stories",
          cond: {
            $and: [
              { $eq: ["$$this.metadata.isPublished", true] },
              { $gt: ["$$this.stats.averageRating", 0] }
            ]
          }
        }
      }
    },
    totalPlayers: {
      $sum: "$stories.stats.totalPlayers"
    }
  }},
  { $sort: { sortOrder: 1 } }
]);

// Find stories without valid genre
db.Stories.find({
  "metadata.genre": {
    $nin: db.Genres.find({ isActive: true }).map(g => g.slug)
  }
});

// Get genre usage analytics
db.Genres.aggregate([
  { $match: { isActive: true } },
  { $lookup: {
    from: "UserStoryProgress",
    let: { genreSlug: "$slug" },
    pipeline: [
      {
        $lookup: {
          from: "Stories",
          localField: "storyId",
          foreignField: "_id",
          as: "story"
        }
      },
      { $unwind: "$story" },
      {
        $match: {
          $expr: {
            $eq: ["$$story.metadata.genre", "$$genreSlug"]
          }
        }
      }
    ],
    as: "playHistory"
  }},
  { $project: {
    name: 1,
    storyCount: 1,
    totalPlays: { $size: "$playHistory" },
    uniquePlayers: {
      $size: { $addToSet: "$playHistory.userId" }
    },
    completionRate: {
      $multiply: [
        100,
        {
          $divide: [
            {
              $size: {
                $filter: {
                  input: "$playHistory",
                  cond: { $eq: ["$$this.hasCompleted", true] }
                }
              }
            },
            { $size: "$playHistory" }
          ]
        }
      ]
    }
  }},
  { $sort: { totalPlays: -1 } }
]);
```

## Standard Genre Classifications

### Primary Genres (Thai)

| Slug | Name | Description |
|------|------|-------------|
| **romance** | โรแมนติก | เรื่องราวความรักและความสัมพันธ์ |
| **horror** | สยองขวัญ | เรื่องสยองขวัญ ผี สิ่งลี้ลับ |
| **adventure** |ผจญภัย | การเดินทาง การสำรวจ การผจญภัย |
| **mystery** | ลึกลับ | ปริศนา การสืบสวน ความลับ |
| **fantasy** |แฟนตาซี | เวทมนตร์ สัตว์วิเศษ โลกในจินตนาการ |
| **sci-fi** | ไซไฟ | วิทยาศาสตร์ เทคโนโลยี อนาคต |
| **thriller** |ระทึกใจ | ความตึงเครียด ความเร็ว การล่าถอย |
| **comedy** | ตลก | เรื่องขำขัน ความสนุกสนาน |
| **drama** |ดราม่า | เรื่องชีวิต ความรู้สึก ปัญหาสังคม |
| **action** |แอ็คชั่น | การต่อสู้ ความเร็ว ผจญภัยสุดขั้ว |

### Sub-genres

| Parent | Sub-genre | Thai Name |
|--------|-----------|-----------|
| romance | teen-romance | โรแมนติกวัยรุ่น |
| romance | historical-romance | โรแมนติกย้อนยุค |
| horror | psychological-horror | สยองขวัญจิตวิทยา |
| horror | supernatural | เหนือธรรมชาติ |
| fantasy | urban-fantasy | แฟนตาซีเมือง |
| fantasy | epic-fantasy | แฟนตาซีมหากาพย์ |

## Genre Management

### Creating New Genres

```javascript
const createGenre = (slug, name, description) => {
  // Check if slug already exists
  const existing = db.Genres.findOne({ slug });
  if (existing) {
    throw new Error(`Genre with slug '${slug}' already exists`);
  }

  // Get next sort order
  const maxSort = db.Genres.findOne(
    { isActive: true },
    { sortOrder: 1 },
    { sort: { sortOrder: -1 } }
  );

  return db.Genres.insertOne({
    slug,
    name,
    description,
    storyCount: 0,
    isActive: true,
    sortOrder: (maxSort?.sortOrder || 0) + 1,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};
```

### Updating Story Count

Story count should be updated when:

1. New story is published
2. Story is unpublished/deleted
3. Story changes genre
4. Genre status changes

```javascript
const updateGenreStoryCount = async (genreSlug) => {
  const count = db.Stories.countDocuments({
    "metadata.genre": genreSlug,
    "metadata.isPublished": true,
    deletedAt: null
  });

  return db.Genres.updateOne(
    { slug: genreSlug },
    {
      $set: {
        storyCount: count,
        updatedAt: new Date()
      }
    }
  );
};
```

## Performance Optimization

### Denormalized Story Count

The `storyCount` field is denormalized for performance:

- Updated via triggers or application logic
- Prevents expensive count queries on story listing
- Enables quick genre popularity ranking

### Indexing Strategy

- `slug` for URL-based lookups
- `isActive` for filtering active genres
- `sortOrder` for display ordering
- `storyCount` for popular genres (descending)

## Integration Points

### Stories Collection
- `metadata.genre` references `Genres.slug`
- Stories belong to exactly one genre
- Genre filtering for story discovery

### Analytics
- Track genre popularity trends
- User genre preferences
- Performance metrics by genre

### User Preferences
- Favorite genres for recommendations
- Genre-based content filtering
- Personalized discovery

## Thai Language Considerations

### Display Names
All genre names are in Thai for the target audience:

- Native Thai terms for relatability
- Consistent transliteration for slugs
- Cultural relevance in descriptions

### SEO Optimization
- Thai URLs use slugs (Latin characters)
- Thai meta descriptions for search
- Proper Thai content structure

## Future Enhancements

### Sub-genre Support
```javascript
{
  slug: "romance-teen",
  name: "โรแมนติกวัยรุ่น",
  parentGenre: "romance",
  description: "เรื่องราวความรักสำหรับวัยรุ่น",
  // ... other fields
}
```

### Genre Tags
```javascript
{
  tags: ["sweet", "light", "school-life", "first-love"],
  targetAudience: "young-adult",
  contentWarnings: ["mild-romance"]
}
```