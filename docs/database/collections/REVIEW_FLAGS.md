# ReviewFlags Collection

## Purpose

Community review reporting and moderation system for maintaining content quality and community standards.

## Schema

```javascript
{
  _id: ObjectId,
  reviewId: ObjectId,         // references Reviews - the review being reported
  userId: ObjectId,           // references Users - user who reported the review
  reason: String,             // 'spam' | 'harassment' | 'offensive' | 'spoiler' | 'other'
  detail: String,             // optional additional details about the report
  status: String,             // 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewedBy: ObjectId,       // references AdminAccounts - admin who reviewed this flag
  reviewedAt: Date,           // when the flag was reviewed
  createdAt: Date             // when the flag was created
}
```

## Key Features

- **Community Moderation**: Empowers users to report inappropriate content
- **Categorization**: Specific reasons help moderators prioritize and understand issues
- **Status Tracking**: Complete lifecycle from reported to resolution
- **Admin Assignment**: Tracks which admin handled each flag
- **Duplicate Prevention**: Users can only flag a review once

## Flag Reasons

- **spam**: Unwanted promotional content, repetitive posting
- **harassment**: Personal attacks, bullying, threats
- **offensive**: Hate speech, discriminatory content
- **spoiler**: Unauthorized disclosure of story content
- **other**: Other violations not covered by specific categories

## Status Flow

1. **pending** - Initial state, awaiting moderator review
2. **reviewed** - Currently being examined by moderator
3. **resolved** - Issue addressed, action taken
4. **dismissed** - No violation found, flag rejected

## Key Indexes

```javascript
// Find all flags for a specific review
db.ReviewFlags.createIndex({ reviewId: 1 });

// User's flagging history - for abuse prevention
db.ReviewFlags.createIndex({ userId: 1 });

// Admin workflow - find pending flags for review
db.ReviewFlags.createIndex({ status: 1, createdAt: 1 });

// Prevent duplicate flags from same user on same review
db.ReviewFlags.createIndex({ reviewId: 1, userId: 1 }, { unique: true });
```

## Query Examples

### Get pending flags for admin dashboard
```javascript
db.ReviewFlags.find({ status: 'pending' })
  .sort({ createdAt: -1 })
  .populate('reviewId', 'reviewText rating userId createdAt')
  .populate('userId', 'username profile.displayName');
```

### Get all flags for a specific review
```javascript
db.ReviewFlags.find({ reviewId: ObjectId("review_id") })
  .sort({ createdAt: -1 })
  .populate('userId', 'username profile.displayName');
```

### Get user's flagging history
```javascript
db.ReviewFlags.find({ userId: ObjectId("user_id") })
  .sort({ createdAt: -1 })
  .populate('reviewId', 'reviewText rating');
```

### Update flag status during moderation
```javascript
db.ReviewFlags.updateOne(
  { _id: ObjectId("flag_id") },
  {
    $set: {
      status: 'resolved',
      reviewedBy: ObjectId("admin_id"),
      reviewedAt: new Date()
    }
  }
);
```

### Get flag statistics for a review
```javascript
db.ReviewFlags.aggregate([
  { $match: { reviewId: ObjectId("review_id") } },
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

### Get moderation workload statistics
```javascript
db.ReviewFlags.aggregate([
  { $match: { status: 'pending' } },
  { $group: {
    _id: "$reason",
    count: { $sum: 1 },
    oldestFlag: { $min: "$createdAt" }
  }},
  { $sort: { oldestFlag: 1 } }
]);
```

## Data Integrity

### Constraints
- **Unique Flag**: Each user can only flag a review once
- **Valid Reasons**: Only predefined flag reasons allowed
- **Valid Status**: Status must follow approved workflow
- **Reference Integrity**: reviewId and userId must reference existing documents

### Validation Rules
- `reason` must be one of the predefined categories
- `status` transitions must follow approved workflow
- `reviewedBy` required when status changes from 'pending'
- `reviewedAt` automatically set when admin reviews flag

## Integration Points

### Reviews Collection
- When multiple flags accumulate, auto-hide or review review
- Update review moderation status based on flag resolution
- Track flag count in review for threshold-based actions

### Users Collection
- Track user flagging history for abuse detection
- Update user trust score based on flag accuracy
- Flagging rate limiting per user

### AdminAccounts Collection
- Assign flags to specific moderators
- Track moderation workload and performance
- Admin permission verification for flag resolution

## Moderation Workflow

### Flag Processing
1. **Receive Flag**: User reports review with reason and details
2. **Queue Review**: Flag enters pending queue
3. **Admin Review**: Moderator examines review and flag context
4. **Take Action**: Hide review, warn user, remove content, or dismiss
5. **Resolve Flag**: Update status and record admin action

### Escalation Rules
- **Multiple Flags**: Auto-escalate when review receives multiple flags
- **Repeat Offender**: Escalate reviews from users with frequent violations
- **Time Threshold**: Prioritize older pending flags

## Security Considerations

- **False Flagging**: Detect and penalize malicious flagging
- **Privacy**: Protect flagger identity when appropriate
- **Appeal Process**: Allow users to contest flag decisions
- **Audit Trail**: Complete record of all moderation actions

## Performance Optimization

- **Index Strategy**: Optimized for admin dashboard queries
- **Pagination**: Efficient retrieval of large flag lists
- **Caching**: Cache flag counts for review display
- **Archiving**: Archive resolved flags after retention period

## Analytics and Reporting

### Key Metrics
- **Flag Volume**: Number of flags per time period
- **Resolution Time**: Average time to resolve flags
- **Flag Accuracy**: Percentage of flags that result in action
- **Repeat Issues**: Users and reviews frequently flagged

### Reports
- Daily moderation activity summary
- Flag reason distribution analysis
- Moderator performance metrics
- Community health indicators

## Cleanup Strategy

Resolved flags can be archived after a retention period (e.g., 90 days):
```javascript
// Archive old resolved flags
db.ReviewFlags.deleteMany({
  status: { $in: ['resolved', 'dismissed'] },
  reviewedAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});
```

---

*Last updated: December 2024*