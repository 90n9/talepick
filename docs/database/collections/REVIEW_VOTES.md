# ReviewVotes Collection

## Mongoose Model Reference
- **Model File**: ReviewVote.ts (singular)
- **Model Class**: ReviewVote (singular)
- **Collection**: review_votes (plural, with underscores for readability)


## Purpose

Review voting system with duplicate prevention for community-driven content quality assessment.

## Schema

```javascript
{
  _id: ObjectId,
  reviewId: ObjectId,         // references Reviews - the review being voted on
  userId: ObjectId,           // references Users - user who cast the vote
  voteType: String,           // 'up' | 'down' - type of vote
  createdAt: Date             // when the vote was cast
}
```

## Key Features

- **Duplicate Prevention**: Unique constraint on `(reviewId, userId)` prevents users from voting multiple times
- **Vote Tracking**: Records both upvotes and downvotes for review quality scoring
- **Audit Trail**: Timestamp for each vote enables temporal analysis
- **User History**: Enables querying user's voting patterns for moderation

## Key Indexes

```javascript
// Primary composite index - prevents duplicate votes
db.ReviewVotes.createIndex({ reviewId: 1, userId: 1 }, { unique: true });

// User's voting history - for moderation and analytics
db.ReviewVotes.createIndex({ userId: 1 });

// Temporal index - for cleanup of old votes if needed
db.ReviewVotes.createIndex({ createdAt: 1 }); // TTL: Optional cleanup of old votes
```

## Query Examples

### Check if user has voted on a review
```javascript
db.ReviewVotes.findOne({
  reviewId: ObjectId("review_id"),
  userId: ObjectId("user_id")
});
```

### Get vote counts for a review
```javascript
db.ReviewVotes.aggregate([
  { $match: { reviewId: ObjectId("review_id") } },
  { $group: {
    _id: "$reviewId",
    upVotes: {
      $sum: { $cond: [{ $eq: ["$voteType", "up"] }, 1, 0] }
    },
    downVotes: {
      $sum: { $cond: [{ $eq: ["$voteType", "down"] }, 1, 0] }
    },
    totalVotes: { $sum: 1 }
  }}
]);
```

### Get user's voting history
```javascript
db.ReviewVotes.find({ userId: ObjectId("user_id") })
  .sort({ createdAt: -1 })
  .populate('reviewId', 'reviewText rating storyId');
```

### Update review vote counts after new vote
```javascript
// This would be done in application logic after successful vote insertion
db.Reviews.updateOne(
  { _id: ObjectId("review_id") },
  {
    $inc: {
      upVotes: voteType === 'up' ? 1 : 0,
      downVotes: voteType === 'down' ? 1 : 0
    }
  }
);
```

### Remove user's vote (allow vote changing)
```javascript
db.ReviewVotes.deleteOne({
  reviewId: ObjectId("review_id"),
  userId: ObjectId("user_id")
});
```

## Data Integrity

### Constraints
- **Unique Vote**: Each user can only vote once per review
- **Valid Vote Types**: Only 'up' or 'down' values allowed
- **Valid References**: reviewId and userId must reference existing documents

### Cascade Operations
- When a review is deleted, associated votes should be cleaned up
- When a user is deleted, their votes should be anonymized or removed

## Performance Considerations

- **Index Strategy**: Composite unique index ensures fast duplicate checking
- **Storage**: Small documents, efficient for high-volume voting
- **Scalability**: Separate collection prevents review document bloat
- **Caching**: Vote counts can be cached in Reviews collection for quick display

## Security Considerations

- **Vote Manipulation**: Unique constraint prevents ballot stuffing
- **Privacy**: User voting history should be handled according to privacy policies
- **Rate Limiting**: Application-level rate limiting recommended for vote submission

## Usage Patterns

### Common Workflows

1. **Vote Casting**:
   - Check if user already voted
   - Insert new vote record
   - Update review vote counts
   - Return updated vote status

2. **Vote Retrieval**:
   - Get current vote counts for review display
   - Check if current user has voted
   - Display appropriate voting UI

3. **Moderation**:
   - Analyze voting patterns for suspicious activity
   - Identify potential vote brigading
   - Review user voting history for abuse

### Integration Points

- **Reviews Collection**: Vote counts stored denormalized for performance
- **Users Collection**: User voting permissions and restrictions
- **Moderation System**: Voting pattern analysis for content quality

## Cleanup Strategy

Optional TTL index can be implemented for automatic cleanup of old votes:
```javascript
// Example: Clean up votes older than 2 years
db.ReviewVotes.createIndex({ createdAt: 1 }, { expireAfterSeconds: 63072000 });
```

## Analytics Potential

- **Vote Distribution**: Analyze upvote/downvote ratios
- **User Engagement**: Track voting participation rates
- **Content Quality**: Correlate votes with review quality metrics
- **Temporal Patterns**: Understand voting behavior over time

---

*Last updated: December 2024*