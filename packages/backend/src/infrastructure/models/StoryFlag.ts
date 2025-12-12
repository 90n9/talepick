import mongoose, { Document, Schema } from 'mongoose';

// Story flag reason enum
export enum StoryFlagReason {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  COPYRIGHT = 'copyright',
  MALWARE = 'malware',
  SPAM = 'spam',
  MISINFORMATION = 'misinformation',
  OTHER = 'other',
}

// Story flag status enum
export enum StoryFlagStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

// Interfaces
export interface IStoryFlag extends Document {
  storyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  reason: StoryFlagReason;
  detail?: string;
  status: StoryFlagStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

// Schema
const storyFlagSchema = new Schema<IStoryFlag>(
  {
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      enum: Object.values(StoryFlagReason),
      required: true,
    },
    detail: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: Object.values(StoryFlagStatus),
      required: true,
      default: StoryFlagStatus.PENDING,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAccount',
    },
    reviewedAt: { type: Date },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'StoryFlags',
  }
);

// Indexes
storyFlagSchema.index({ storyId: 1 });
storyFlagSchema.index({ userId: 1 });
storyFlagSchema.index({ status: 1, createdAt: 1 });
storyFlagSchema.index({ storyId: 1, userId: 1 }, { unique: true });
storyFlagSchema.index({ reason: 1 });
storyFlagSchema.index({ reviewedBy: 1 });
storyFlagSchema.index({ createdAt: -1 });

// Middleware
storyFlagSchema.pre('save', function (next) {
  if (
    this.isModified('status') &&
    (this.status === StoryFlagStatus.REVIEWED ||
      this.status === StoryFlagStatus.RESOLVED ||
      this.status === StoryFlagStatus.DISMISSED) &&
    !this.reviewedAt
  ) {
    this.reviewedAt = new Date();
  }

  if (this.isModified('status') && this.status === StoryFlagStatus.PENDING && this.reviewedAt) {
    this.reviewedAt = undefined;
  }

  next();
});

// Virtual for checking if flag is pending review
storyFlagSchema.virtual('isPending').get(function () {
  return this.status === StoryFlagStatus.PENDING;
});

// Virtual for checking if flag is resolved
storyFlagSchema.virtual('isResolved').get(function () {
  return this.status === StoryFlagStatus.RESOLVED || this.status === StoryFlagStatus.DISMISSED;
});

// Static method to find pending reports for admin dashboard
storyFlagSchema.statics.findPendingReports = function () {
  return this.find({ status: StoryFlagStatus.PENDING })
    .sort({ createdAt: -1 })
    .populate('storyId', 'title description metadata.author stats.averageRating')
    .populate('userId', 'username profile.displayName');
};

// Static method to find all reports for a specific story
storyFlagSchema.statics.findByStory = function (storyId: mongoose.Types.ObjectId) {
  return this.find({ storyId })
    .sort({ createdAt: -1 })
    .populate('userId', 'username profile.displayName');
};

// Static method to find user's reporting history
storyFlagSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId }).sort({ createdAt: -1 }).populate('storyId', 'title metadata.author');
};

// Static method to get report statistics for a story
storyFlagSchema.statics.getStoryReportStats = function (storyId: mongoose.Types.ObjectId) {
  return this.aggregate([
    { $match: { storyId } },
    {
      $group: {
        _id: '$reason',
        count: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', StoryFlagStatus.PENDING] }, 1, 0] },
        },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', StoryFlagStatus.RESOLVED] }, 1, 0] },
        },
        dismissed: {
          $sum: { $cond: [{ $eq: ['$status', StoryFlagStatus.DISMISSED] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Static method to get stories with most reports
storyFlagSchema.statics.getStoriesWithMostReports = function (minReports = 3, limit = 20) {
  return this.aggregate([
    {
      $group: {
        _id: '$storyId',
        totalReports: { $sum: 1 },
        pendingReports: {
          $sum: { $cond: [{ $eq: ['$status', StoryFlagStatus.PENDING] }, 1, 0] },
        },
        reasons: { $addToSet: '$reason' },
        latestReport: { $max: '$createdAt' },
      },
    },
    { $match: { totalReports: { $gte: minReports } } },
    { $sort: { pendingReports: -1, totalReports: -1, latestReport: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'Stories',
        localField: '_id',
        foreignField: '_id',
        as: 'story',
      },
    },
    { $unwind: '$story' },
    {
      $project: {
        storyId: '$_id',
        storyTitle: '$story.title',
        storyAuthor: '$story.metadata.author',
        totalReports: 1,
        pendingReports: 1,
        reasons: 1,
        latestReport: 1,
      },
    },
  ]);
};

// Static method to get overall report statistics
storyFlagSchema.statics.getOverallStats = function (timeWindow = 30) {
  const cutoffDate = new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { createdAt: { $gte: cutoffDate } } },
    {
      $group: {
        _id: '$reason',
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', StoryFlagStatus.PENDING] }, 1, 0] },
        },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', StoryFlagStatus.RESOLVED] }, 1, 0] },
        },
        dismissed: {
          $sum: { $cond: [{ $eq: ['$status', StoryFlagStatus.DISMISSED] }, 1, 0] },
        },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

// Method to update report status during moderation
storyFlagSchema.methods.updateStatus = function (
  status: StoryFlagStatus,
  reviewedBy: mongoose.Types.ObjectId
) {
  this.status = status;
  this.reviewedBy = reviewedBy;
  return this.save();
};

// Method to dismiss report with notes
storyFlagSchema.methods.dismiss = function (reviewedBy: mongoose.Types.ObjectId, detail?: string) {
  this.status = StoryFlagStatus.DISMISSED;
  this.reviewedBy = reviewedBy;
  if (detail) {
    this.detail = detail;
  }
  return this.save();
};

// Method to resolve report with action taken
storyFlagSchema.methods.resolve = function (reviewedBy: mongoose.Types.ObjectId, detail?: string) {
  this.status = StoryFlagStatus.RESOLVED;
  this.reviewedBy = reviewedBy;
  if (detail) {
    this.detail = detail;
  }
  return this.save();
};

export const StoryFlag = mongoose.model<IStoryFlag>('StoryFlag', storyFlagSchema);
