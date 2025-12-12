# StoryFlags Collection

## Purpose

Story content reporting and moderation system for maintaining story quality and community standards compliance.

## Schema

```javascript
{
  _id: ObjectId,
  storyId: ObjectId,          // references Stories - the story being reported
  userId: ObjectId,           // references Users - user who reported the story
  reason: String,             // 'inappropriate_content' | 'copyright' | 'malware' | 'spam' | 'misinformation' | 'other'
  detail: String,             // optional additional details about the report
  status: String,             // 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewedBy: ObjectId,       // references AdminAccounts - admin who reviewed this report
  reviewedAt: Date,           // when the report was reviewed
  createdAt: Date             // when the report was created
}
```

## Key Features

- **Content Protection**: Enables community reporting of inappropriate stories
- **Specific Categories**: Targeted reasons help moderators quickly assess issues
- **Complete Tracking**: Full audit trail from report to resolution
- **Admin Assignment**: Tracks which moderator handled each report
- **Duplicate Prevention**: Users can only report a story once

## Report Reasons

- **inappropriate_content**: Content violates age ratings, contains prohibited material
- **copyright**: Unauthorized use of copyrighted material
- **malware**: Stories containing malicious links or code
- **spam**: Low-quality, repetitive, or promotional content
- **misinformation**: False or misleading information
- **other**: Other violations not covered by specific categories

## Status Workflow

1. **pending** - Initial state, awaiting moderator review
2. **reviewed** - Currently being examined by moderator
3. **resolved** - Issue addressed, appropriate action taken
4. **dismissed** - No violation found, report rejected

## Key Indexes

```javascript
// Find all reports for a specific story
db.StoryFlags.createIndex({ storyId: 1 });

// User's reporting history - for abuse prevention
db.StoryFlags.createIndex({ userId: 1 });

// Admin workflow - find pending reports for review
db.StoryFlags.createIndex({ status: 1, createdAt: 1 });

// Prevent duplicate reports from same user on same story
db.StoryFlags.createIndex({ storyId: 1, userId: 1 }, { unique: true });
```

## Query Examples

### Get pending reports for admin dashboard
```javascript
db.StoryFlags.find({ status: 'pending' })
  .sort({ createdAt: -1 })
  .populate('storyId', 'title description metadata.author stats.averageRating')
  .populate('userId', 'username profile.displayName');
```

### Get all reports for a specific story
```javascript
db.StoryFlags.find({ storyId: ObjectId("story_id") })
  .sort({ createdAt: -1 })
  .populate('userId', 'username profile.displayName');
```

### Get user's reporting history
```javascript
db.StoryFlags.find({ userId: ObjectId("user_id") })
  .sort({ createdAt: -1 })
  .populate('storyId', 'title metadata.author');
```

### Update report status during moderation
```javascript
db.StoryFlags.updateOne(
  { _id: ObjectId("report_id") },
  {
    $set: {
      status: 'resolved',
      reviewedBy: ObjectId("admin_id"),
      reviewedAt: new Date()
    }
  }
);
```

### Get report statistics for a story
```javascript
db.StoryFlags.aggregate([
  { $match: { storyId: ObjectId("story_id") } },
  { $group: {
    _id: "$reason",
    count: { $sum: 1 },
    pending: {
      $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
    },
    resolved: {
      $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
    }
  }},
  { $sort: { count: -1 } }
]);
```

### Get stories with most reports
```javascript
db.StoryFlags.aggregate([
  { $group: {
    _id: "$storyId",
    totalReports: { $sum: 1 },
    pendingReports: {
      $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
    },
    reasons: { $addToSet: "$reason" }
  }},
  { $match: { totalReports: { $gte: 3 } } },
  { $sort: { pendingReports: -1, totalReports: -1 } },
  { $limit: 20 },
  { $lookup: {
    from: "Stories",
    localField: "_id",
    foreignField: "_id",
    as: "story"
  }},
  { $unwind: "$story" },
  { $project: {
    storyTitle: "$story.title",
    storyAuthor: "$story.metadata.author",
    totalReports: 1,
    pendingReports: 1,
    reasons: 1
  }}
]);
```

## Data Integrity

### Constraints
- **Unique Report**: Each user can only report a story once
- **Valid Reasons**: Only predefined report reasons allowed
- **Valid Status**: Status must follow approved workflow
- **Reference Integrity**: storyId and userId must reference existing documents

### Validation Rules
- `reason` must be one of the predefined categories
- `status` transitions must follow approved workflow
- `reviewedBy` required when status changes from 'pending'
- `reviewedAt` automatically set when admin reviews report

## Integration Points

### Stories Collection
- When multiple reports accumulate, auto-unpublish or review story
- Update story moderation status based on report resolution
- Track report count for threshold-based actions
- Impact story visibility and search rankings

### Users Collection
- Track user reporting history for abuse detection
- Update user trust score based on report accuracy
- Reporting rate limiting per user
- Reward users for accurate reporting

### AdminAccounts Collection
- Assign reports to specific moderators
- Track moderation workload and performance
- Admin permission verification for report resolution
- Moderation activity logging

## Moderation Workflow

### Report Processing
1. **Receive Report**: User reports story with reason and details
2. **Queue Review**: Report enters pending queue
3. **Admin Review**: Moderator examines story content and report context
4. **Take Action**: Unpublish story, request edits, remove content, or dismiss
5. **Resolve Report**: Update status and record admin action

### Escalation Rules
- **Multiple Reports**: Auto-escalate when story receives multiple reports
- **Serious Violations**: Immediate action for copyright or malware reports
- **Repeat Offender**: Escalate stories from authors with frequent violations
- **Priority Queue**: Prioritize older pending reports

## Automated Actions

### Threshold-Based Actions
```javascript
// Example: Auto-unpublish story with 5+ pending reports
db.Stories.updateMany(
  { _id: { $in: storiesWithMultipleReports } },
  {
    $set: {
      "moderation.status": "suspended",
      "moderation.reportCount": reportCount
    }
  }
);
```

### Content Review Triggers
- Story receives 3+ reports from different users
- Story receives reports for serious violations (copyright, malware)
- Author has history of content violations

## Security Considerations

- **False Reporting**: Detect and penalize malicious reporting
- **Author Privacy**: Balance transparency with privacy concerns
- **Appeal Process**: Allow authors to contest report decisions
- **Content Preservation**: Maintain evidence for legal proceedings

## Performance Optimization

- **Index Strategy**: Optimized for admin dashboard queries
- **Efficient Joins**: Fast population of story and user details
- **Pagination**: Handle large volumes of reports efficiently
- **Caching**: Cache report counts for story management

## Analytics and Reporting

### Key Metrics
- **Report Volume**: Number of reports per time period
- **Resolution Time**: Average time to resolve reports
- **Report Accuracy**: Percentage of reports that result in action
- **Content Quality**: Trends in report reasons and outcomes

### Dashboard Views
- Pending reports queue sorted by priority
- Report statistics by reason and status
- Moderator performance metrics
- Content quality trends over time

## Cleanup Strategy

Resolved reports can be archived after retention period:
```javascript
// Archive old resolved reports after 90 days
db.StoryFlags.deleteMany({
  status: { $in: ['resolved', 'dismissed'] },
  reviewedAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});
```

## Content Rating Impact

Report outcomes can influence story content ratings:
- **Age Rating Adjustments**: Upgrade rating based on reported content
- **Content Warnings**: Add specific warnings for reported issues
- **Genre Re-classification**: Move to appropriate category if miscategorized

---

*Last updated: December 2024*