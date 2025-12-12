import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserFavorites extends Document {
  userId: Types.ObjectId; // references Users
  storyId: Types.ObjectId; // references Stories

  addedAt: Date; // when user added to favorites
  createdAt: Date;

  // Methods
  getFavoriteAge(): number; // days since favorited
}

const UserFavoritesSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'userFavorites',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserFavoritesSchema.index({ userId: 1, storyId: 1 }, { unique: true });
UserFavoritesSchema.index({ userId: 1, addedAt: -1 });
UserFavoritesSchema.index({ storyId: 1 });
UserFavoritesSchema.index({ addedAt: -1 });

// Methods
UserFavoritesSchema.methods.getFavoriteAge = function (): number {
  const now = new Date();
  const diffInMs = now.getTime() - this.addedAt.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // days
};

// Static methods
UserFavoritesSchema.statics.addToFavorites = function (
  userId: Types.ObjectId,
  storyId: Types.ObjectId
) {
  return this.create({ userId, storyId });
};

UserFavoritesSchema.statics.removeFromFavorites = function (
  userId: Types.ObjectId,
  storyId: Types.ObjectId
) {
  return this.deleteOne({ userId, storyId });
};

UserFavoritesSchema.statics.isFavorited = function (
  userId: Types.ObjectId,
  storyId: Types.ObjectId
) {
  return this.findOne({ userId, storyId });
};

UserFavoritesSchema.statics.getUserFavorites = function (
  userId: Types.ObjectId,
  skip = 0,
  limit = 20,
  includeStoryDetails = true
) {
  if (includeStoryDetails) {
    return this.aggregate([
      { $match: { userId } },
      { $sort: { addedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'Stories',
          localField: 'storyId',
          foreignField: '_id',
          as: 'story',
        },
      },
      { $unwind: '$story' },
      {
        $project: {
          addedAt: 1,
          'story._id': 1,
          'story.title': 1,
          'story.media.coverImageUrl': 1,
          'story.media.thumbnailUrl': 1,
          'story.stats.averageRating': 1,
          'story.stats.totalRatings': 1,
          'story.metadata.genre': 1,
          'story.metadata.author': 1,
          'story.metadata.isPublished': 1,
        },
      },
    ]);
  } else {
    return this.find({ userId }).sort({ addedAt: -1 }).skip(skip).limit(limit);
  }
};

UserFavoritesSchema.statics.getUserFavoritesWithProgress = function (userId: Types.ObjectId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: 'Stories',
        localField: 'storyId',
        foreignField: '_id',
        as: 'story',
      },
    },
    { $unwind: '$story' },
    {
      $lookup: {
        from: 'UserStoryProgress',
        localField: 'storyId',
        foreignField: 'storyId',
        let: { userId: '$userId' },
        pipeline: [{ $match: { $expr: { $eq: ['$userId', '$$userId'] } } }],
        as: 'progress',
      },
    },
    {
      $project: {
        addedAt: 1,
        'story._id': 1,
        'story.title': 1,
        'story.media.coverImageUrl': 1,
        'story.stats.averageRating': 1,
        'story.metadata.genre': 1,
        hasPlayed: { $gt: [{ $size: '$progress' }, 0] },
        hasCompleted: {
          $anyElementTrue: {
            $map: {
              input: '$progress',
              as: 'p',
              in: '$$p.hasCompleted',
            },
          },
        },
        totalPlaythroughs: { $size: '$progress' },
        completedPlaythroughs: {
          $size: {
            $filter: {
              input: '$progress',
              cond: { $eq: ['$$this.hasCompleted', true] },
            },
          },
        },
      },
    },
    { $sort: { addedAt: -1 } },
  ]);
};

UserFavoritesSchema.statics.getUserFavoritesByGenre = function (
  userId: Types.ObjectId,
  genre: string
) {
  return this.aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: 'Stories',
        localField: 'storyId',
        foreignField: '_id',
        as: 'story',
      },
    },
    { $unwind: '$story' },
    { $match: { 'story.metadata.genre': genre } },
    { $sort: { addedAt: -1 } },
    {
      $project: {
        addedAt: 1,
        'story._id': 1,
        'story.title': 1,
        'story.media.coverImageUrl': 1,
        'story.stats.averageRating': 1,
      },
    },
  ]);
};

UserFavoritesSchema.statics.getMostFavoritedStories = function (
  limit = 20,
  timeRange?: { start: Date; end: Date }
) {
  const matchStage: Record<string, unknown> = {};
  if (timeRange) {
    matchStage.addedAt = { $gte: timeRange.start, $lte: timeRange.end };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$storyId',
        favoriteCount: { $sum: 1 },
        firstFavorited: { $min: '$addedAt' },
        lastFavorited: { $max: '$addedAt' },
      },
    },
    { $sort: { favoriteCount: -1 } },
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
        favoriteCount: 1,
        firstFavorited: 1,
        lastFavorited: 1,
        'story.title': 1,
        'story.media.coverImageUrl': 1,
        'story.stats.averageRating': 1,
        'story.stats.totalRatings': 1,
        'story.metadata.genre': 1,
        'story.metadata.author': 1,
      },
    },
  ]);
};

UserFavoritesSchema.statics.getStoryFavoriteCount = function (storyId: Types.ObjectId) {
  return this.countDocuments({ storyId });
};

UserFavoritesSchema.statics.getUserFavoriteStatistics = function (userId: Types.ObjectId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: 'Stories',
        localField: 'storyId',
        foreignField: '_id',
        as: 'story',
      },
    },
    { $unwind: '$story' },
    {
      $group: {
        _id: null,
        totalFavorites: { $sum: 1 },
        genres: { $addToSet: '$story.metadata.genre' },
        averageRating: { $avg: '$story.stats.averageRating' },
        newestFavorite: { $max: '$addedAt' },
        oldestFavorite: { $min: '$addedAt' },
        totalRatings: { $sum: '$story.stats.totalRatings' },
      },
    },
    {
      $project: {
        totalFavorites: 1,
        genreCount: { $size: '$genres' },
        genres: 1,
        averageRating: { $round: ['$averageRating', 2] },
        newestFavorite: 1,
        oldestFavorite: 1,
        favoriteAgeDays: {
          $divide: [{ $subtract: [new Date(), '$oldestFavorite'] }, 1000 * 60 * 60 * 24],
        },
        totalRatings: 1,
      },
    },
  ]);
};

UserFavoritesSchema.statics.getRecentlyFavoritedStories = function (
  userId: Types.ObjectId,
  limit = 10
) {
  return this.aggregate([
    { $match: { userId } },
    { $sort: { addedAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'Stories',
        localField: 'storyId',
        foreignField: '_id',
        as: 'story',
      },
    },
    { $unwind: '$story' },
    {
      $project: {
        addedAt: 1,
        'story._id': 1,
        'story.title': 1,
        'story.media.coverImageUrl': 1,
        'story.media.thumbnailUrl': 1,
        'story.stats.averageRating': 1,
        'story.stats.totalRatings': 1,
        'story.metadata.genre': 1,
        'story.metadata.author': 1,
      },
    },
  ]);
};

UserFavoritesSchema.statics.getFavoriteAnalytics = function (timeRange?: {
  start: Date;
  end: Date;
}) {
  const matchStage: Record<string, unknown> = {};
  if (timeRange) {
    matchStage.addedAt = { $gte: timeRange.start, $lte: timeRange.end };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$addedAt' },
          month: { $month: '$addedAt' },
          day: { $dayOfMonth: '$addedAt' },
        },
        totalFavorites: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
      },
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day',
          },
        },
        totalFavorites: 1,
        uniqueUserCount: { $size: '$uniqueUsers' },
      },
    },
    { $sort: { date: -1 } },
  ]);
};

UserFavoritesSchema.statics.cleanupDeletedStories = function (deletedStoryIds: Types.ObjectId[]) {
  return this.deleteMany({ storyId: { $in: deletedStoryIds } });
};

UserFavoritesSchema.statics.cleanupDeletedUsers = function (deletedUserIds: Types.ObjectId[]) {
  return this.deleteMany({ userId: { $in: deletedUserIds } });
};

export default mongoose.model<IUserFavorites>('UserFavorites', UserFavoritesSchema);
