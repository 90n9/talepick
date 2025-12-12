import mongoose, { Document, Schema } from 'mongoose';

// Flag reason enum
export enum FlagReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  OFFENSIVE = 'offensive',
  SPOILER = 'spoiler',
  OTHER = 'other',
}

// Flag status enum
export enum FlagStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

// Interfaces
export interface IReviewFlag extends Document {
  reviewId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  reason: FlagReason;
  detail?: string;
  status: FlagStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

// Schema
const reviewFlagSchema = new Schema<IReviewFlag>(
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
    reason: {
      type: String,
      enum: Object.values(FlagReason),
      required: true,
    },
    detail: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: Object.values(FlagStatus),
      default: FlagStatus.PENDING,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAccount',
      sparse: true,
    },
    reviewedAt: {
      type: Date,
      sparse: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We use our own createdAt field
    collection: 'ReviewFlags',
  }
);

// Indexes
reviewFlagSchema.index({ reviewId: 1 });
reviewFlagSchema.index({ userId: 1 });
reviewFlagSchema.index({ status: 1, createdAt: 1 });
reviewFlagSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

// Compound indexes for complex queries
reviewFlagSchema.index({ status: 1, reason: 1, createdAt: -1 });
reviewFlagSchema.index({ reviewedBy: 1, reviewedAt: -1 });

// Virtual for checking if flag is pending
reviewFlagSchema.virtual('isPending').get(function () {
  return this.status === FlagStatus.PENDING;
});

// Virtual for checking if flag is resolved
reviewFlagSchema.virtual('isResolved').get(function () {
  return this.status === FlagStatus.RESOLVED || this.status === FlagStatus.DISMISSED;
});

// Virtual for flag age
reviewFlagSchema.virtual('age').get(function () {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for resolution time (if resolved)
reviewFlagSchema.virtual('resolutionTime').get(function () {
  if (!this.reviewedAt) return null;
  return this.reviewedAt.getTime() - this.createdAt.getTime();
});

// Pre-save middleware to automatically set reviewedAt when reviewedBy is set
reviewFlagSchema.pre('save', function (next) {
  if (this.isModified('reviewedBy') && this.reviewedBy && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

// Static methods
reviewFlagSchema.statics.getPendingFlags = function (limit: number = 50, offset: number = 0) {
  return this.find({ status: FlagStatus.PENDING })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .populate('reviewId', 'reviewText rating userId createdAt')
    .populate('userId', 'username profile.displayName');
};

reviewFlagSchema.statics.findByReview = function (reviewId: mongoose.Types.ObjectId) {
  return this.find({ reviewId })
    .sort({ createdAt: -1 })
    .populate('userId', 'username profile.displayName');
};

reviewFlagSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId }).sort({ createdAt: -1 }).populate('reviewId', 'reviewText rating');
};

reviewFlagSchema.statics.getFlagStatistics = function (reviewId: mongoose.Types.ObjectId) {
  return this.aggregate([
    { $match: { reviewId } },
    {
      $group: {
        _id: '$reason',
        count: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', FlagStatus.PENDING] }, 1, 0] },
        },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', FlagStatus.RESOLVED] }, 1, 0] },
        },
        dismissed: {
          $sum: { $cond: [{ $eq: ['$status', FlagStatus.DISMISSED] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

reviewFlagSchema.statics.getModerationWorkload = function () {
  return this.aggregate([
    { $match: { status: FlagStatus.PENDING } },
    {
      $group: {
        _id: '$reason',
        count: { $sum: 1 },
        oldestFlag: { $min: '$createdAt' },
        newestFlag: { $max: '$createdAt' },
      },
    },
    { $sort: { oldestFlag: 1 } },
  ]);
};

reviewFlagSchema.statics.updateStatus = function (
  flagId: mongoose.Types.ObjectId,
  status: FlagStatus,
  reviewedBy: mongoose.Types.ObjectId
) {
  const updateData: Partial<IReviewFlag> = { status };
  if (reviewedBy) {
    updateData.reviewedBy = reviewedBy;
    updateData.reviewedAt = new Date();
  }

  return this.updateOne({ _id: flagId }, { $set: updateData });
};

reviewFlagSchema.statics.getUserFlagHistory = function (
  userId: mongoose.Types.ObjectId,
  limit: number = 20
) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('reviewId', 'reviewText rating');
};

reviewFlagSchema.statics.getFlagTrends = function (daysBack: number = 30) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { createdAt: { $gte: cutoffDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          reason: '$reason',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.date',
        totalFlags: { $sum: '$count' },
        breakdown: {
          $push: {
            reason: '$_id.reason',
            count: '$count',
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

reviewFlagSchema.statics.getModeratorPerformance = function (
  adminId: mongoose.Types.ObjectId,
  daysBack: number = 30
) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        reviewedBy: adminId,
        reviewedAt: { $gte: cutoffDate },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResolutionTime: { $avg: { $subtract: ['$reviewedAt', '$createdAt'] } },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

reviewFlagSchema.statics.getTopFlaggedReviews = function (
  daysBack: number = 7,
  limit: number = 10
) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { createdAt: { $gte: cutoffDate } } },
    {
      $group: {
        _id: '$reviewId',
        flagCount: { $sum: 1 },
        uniqueFlaggers: { $addToSet: '$userId' },
        reasons: { $addToSet: '$reason' },
        oldestFlag: { $min: '$createdAt' },
      },
    },
    { $match: { flagCount: { $gte: 2 } } }, // Only reviews with 2+ flags
    { $sort: { flagCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'Reviews',
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
        flagCount: 1,
        uniqueFlaggerCount: { $size: '$uniqueFlaggers' },
        reasons: 1,
        oldestFlag: 1,
      },
    },
  ]);
};

reviewFlagSchema.statics.checkUserCanFlag = function (
  userId: mongoose.Types.ObjectId,
  reviewId: mongoose.Types.ObjectId
): Promise<boolean> {
  return this.findOne({ userId, reviewId }).then((existing) => !existing);
};

reviewFlagSchema.statics.createFlag = function (
  reviewId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  reason: FlagReason,
  detail?: string
) {
  return this.create({
    reviewId,
    userId,
    reason,
    detail,
    status: FlagStatus.PENDING,
  });
};

export const ReviewFlag = mongoose.model<IReviewFlag>('ReviewFlag', reviewFlagSchema);
