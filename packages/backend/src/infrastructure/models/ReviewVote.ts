import mongoose, { Document, Schema } from 'mongoose';

// Vote type enum
export enum VoteType {
  UP = 'up',
  DOWN = 'down',
}

// Interfaces
export interface IReviewVote extends Document {
  reviewId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  voteType: VoteType;
  createdAt: Date;
}

// Schema
const reviewVoteSchema = new Schema<IReviewVote>(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    voteType: {
      type: String,
      enum: Object.values(VoteType),
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We use our own createdAt field
    collection: 'review_votes',
  }
);

// Indexes
reviewVoteSchema.index({ reviewId: 1, userId: 1 }, { unique: true });
reviewVoteSchema.index({ userId: 1 });
reviewVoteSchema.index({ createdAt: 1 });

// Compound indexes for complex queries
reviewVoteSchema.index({ reviewId: 1, voteType: 1 });
reviewVoteSchema.index({ userId: 1, createdAt: -1 });

// Virtual for vote age
reviewVoteSchema.virtual('age').get(function () {
  return Date.now() - this.createdAt.getTime();
});

// Static methods
reviewVoteSchema.statics.hasUserVoted = function (
  reviewId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<IReviewVote | null> {
  return this.findOne({ reviewId, userId });
};

reviewVoteSchema.statics.getVoteCounts = function (reviewId: mongoose.Types.ObjectId) {
  return this.aggregate([
    { $match: { reviewId } },
    {
      $group: {
        _id: '$reviewId',
        upVotes: {
          $sum: { $cond: [{ $eq: ['$voteType', VoteType.UP] }, 1, 0] },
        },
        downVotes: {
          $sum: { $cond: [{ $eq: ['$voteType', VoteType.DOWN] }, 1, 0] },
        },
        totalVotes: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        upVotes: 1,
        downVotes: 1,
        totalVotes: 1,
        score: { $subtract: ['$upVotes', '$downVotes'] },
      },
    },
  ]);
};

reviewVoteSchema.statics.getUserVotingHistory = function (
  userId: mongoose.Types.ObjectId,
  limit: number = 20,
  offset: number = 0
) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .populate('reviewId', 'reviewText rating storyId');
};

reviewVoteSchema.statics.castVote = function (
  reviewId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  voteType: VoteType
) {
  return this.findOneAndUpdate(
    { reviewId, userId },
    { voteType, createdAt: new Date() },
    { upsert: true, new: true }
  );
};

reviewVoteSchema.statics.removeVote = function (
  reviewId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) {
  return this.deleteOne({ reviewId, userId });
};

reviewVoteSchema.statics.getUserVoteForReview = function (
  reviewId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<{ voteType: VoteType } | null> {
  return this.findOne({ reviewId, userId })
    .select({ voteType: 1, _id: 0 })
    .then((vote) => (vote ? { voteType: vote.voteType } : null));
};

reviewVoteSchema.statics.updateVote = function (
  reviewId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  newVoteType: VoteType
) {
  return this.updateOne({ reviewId, userId }, { $set: { voteType: newVoteType } });
};

reviewVoteSchema.statics.getTopVotedReviews = function (daysBack: number = 7, limit: number = 10) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { createdAt: { $gte: cutoffDate } } },
    {
      $group: {
        _id: '$reviewId',
        totalVotes: { $sum: 1 },
        upVotes: {
          $sum: { $cond: [{ $eq: ['$voteType', VoteType.UP] }, 1, 0] },
        },
        downVotes: {
          $sum: { $cond: [{ $eq: ['$voteType', VoteType.DOWN] }, 1, 0] },
        },
        score: { $sum: { $cond: [{ $eq: ['$voteType', VoteType.UP] }, 1, -1] } },
      },
    },
    { $match: { totalVotes: { $gte: 5 } } }, // Minimum votes threshold
    { $sort: { score: -1, totalVotes: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: '_id',
        as: 'review',
      },
    },
    { $unwind: '$review' },
    {
      $project: {
        reviewId: '$_id',
        reviewText: '$review.reviewText',
        reviewRating: '$review.rating',
        storyId: '$review.storyId',
        totalVotes: 1,
        upVotes: 1,
        downVotes: 1,
        score: 1,
      },
    },
  ]);
};

reviewVoteSchema.statics.getUserVotingStats = function (userId: mongoose.Types.ObjectId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$voteType',
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        upVotes: {
          $sum: { $cond: [{ $eq: ['$_id', VoteType.UP] }, '$count', 0] },
        },
        downVotes: {
          $sum: { $cond: [{ $eq: ['$_id', VoteType.DOWN] }, '$count', 0] },
        },
        totalVotes: { $sum: '$count' },
      },
    },
    {
      $project: {
        _id: 0,
        upVotes: 1,
        downVotes: 1,
        totalVotes: 1,
        ratio: { $divide: ['$upVotes', '$totalVotes'] },
      },
    },
  ]);
};

reviewVoteSchema.statics.getVotingTrends = function (daysBack: number = 30) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { createdAt: { $gte: cutoffDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          voteType: '$voteType',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.date',
        upVotes: {
          $sum: { $cond: [{ $eq: ['$_id.voteType', VoteType.UP] }, '$count', 0] },
        },
        downVotes: {
          $sum: { $cond: [{ $eq: ['$_id.voteType', VoteType.DOWN] }, '$count', 0] },
        },
        totalVotes: { $sum: '$count' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

reviewVoteSchema.statics.cleanupVotesByReview = function (reviewId: mongoose.Types.ObjectId) {
  return this.deleteMany({ reviewId });
};

reviewVoteSchema.statics.cleanupVotesByUser = function (userId: mongoose.Types.ObjectId) {
  return this.deleteMany({ userId });
};

reviewVoteSchema.statics.getReviewVotingDistribution = function (
  reviewId: mongoose.Types.ObjectId
) {
  return this.aggregate([
    { $match: { reviewId } },
    {
      $group: {
        _id: null,
        upVotes: {
          $sum: { $cond: [{ $eq: ['$voteType', VoteType.UP] }, 1, 0] },
        },
        downVotes: {
          $sum: { $cond: [{ $eq: ['$voteType', VoteType.DOWN] }, 1, 0] },
        },
        totalVotes: { $sum: 1 },
        uniqueVoters: { $addToSet: '$userId' },
      },
    },
    {
      $project: {
        _id: 0,
        upVotes: 1,
        downVotes: 1,
        totalVotes: 1,
        uniqueVoterCount: { $size: '$uniqueVoters' },
        upvotePercentage: {
          $multiply: [
            { $divide: [{ $cond: [{ $eq: ['$upVotes', 0] }, 1, '$upVotes'] }, '$totalVotes'] },
            100,
          ],
        },
        score: { $subtract: ['$upVotes', '$downVotes'] },
      },
    },
  ]);
};

export const ReviewVote = mongoose.model<IReviewVote>('ReviewVote', reviewVoteSchema);
