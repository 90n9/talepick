import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUnlockSource {
  type: string; // 'story_completion' | 'automatic' | 'event' | 'admin_grant'
  sourceId?: string; // related source (story ID, event ID, etc.)
  sourceName?: string; // human-readable source name
  details?: string; // additional context about completion
}

export interface IUserAchievements extends Document {
  userId: Types.ObjectId; // references Users
  achievementId: string; // references Achievements.achievementId

  unlockedAt: Date; // when achievement was completed
  unlockSource: IUnlockSource;

  // Achievement metadata (denormalized for performance)
  category: string; // 'story' | 'social' | 'special' | 'milestone'
  rarity: string; // 'common' | 'rare' | 'epic' | 'legendary'
  pointsAwarded: number;
  title: string; // achievement title
  description: string; // achievement description
  icon: string; // achievement icon

  createdAt: Date;

  // Methods
  getUnlockAge(): number; // days since unlocked
}

const UnlockSourceSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['story_completion', 'automatic', 'event', 'admin_grant'],
      required: true,
    },
    sourceId: {
      type: String,
      trim: true,
    },
    sourceName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

const UserAchievementsSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    achievementId: {
      type: String,
      required: true,
      trim: true,
    },

    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    unlockSource: {
      type: UnlockSourceSchema,
      required: true,
    },

    // Achievement metadata (denormalized for performance)
    category: {
      type: String,
      enum: ['story', 'social', 'special', 'milestone'],
      required: true,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      required: true,
    },
    pointsAwarded: {
      type: Number,
      required: true,
      min: 0,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'userAchievements',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserAchievementsSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
UserAchievementsSchema.index({ userId: 1, unlockedAt: -1 });
UserAchievementsSchema.index({ achievementId: 1, unlockedAt: -1 });
UserAchievementsSchema.index({ category: 1 });
UserAchievementsSchema.index({ rarity: 1 });

// Methods
UserAchievementsSchema.methods.getUnlockAge = function (): number {
  const now = new Date();
  const diffInMs = now.getTime() - this.unlockedAt.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // days
};

// Static methods
UserAchievementsSchema.statics.unlockAchievement = function (
  userId: Types.ObjectId,
  achievementId: string,
  unlockSource: IUnlockSource,
  achievementData: {
    category: string;
    rarity: string;
    pointsAwarded: number;
    title: string;
    description: string;
    icon: string;
  }
) {
  return this.create({
    userId,
    achievementId,
    unlockSource,
    ...achievementData,
  });
};

UserAchievementsSchema.statics.getUserUnlockedAchievements = function (userId: Types.ObjectId) {
  return this.find({ userId }).sort({ unlockedAt: -1 });
};

UserAchievementsSchema.statics.hasUserUnlockedAchievement = function (
  userId: Types.ObjectId,
  achievementId: string
) {
  return this.findOne({ userId, achievementId });
};

UserAchievementsSchema.statics.getUserAchievementsByCategory = function (
  userId: Types.ObjectId,
  category: string
) {
  return this.find({ userId, category }).sort({ unlockedAt: -1 });
};

UserAchievementsSchema.statics.getUserAchievementsByRarity = function (
  userId: Types.ObjectId,
  rarity: string
) {
  return this.find({ userId, rarity }).sort({ unlockedAt: -1 });
};

UserAchievementsSchema.statics.getRecentAchievements = function (limit = 50) {
  return this.find({})
    .sort({ unlockedAt: -1 })
    .limit(limit)
    .populate('userId', 'username profile.displayName');
};

UserAchievementsSchema.statics.getAchievementUnlockStats = function (achievementId: string) {
  return this.aggregate([
    { $match: { achievementId } },
    {
      $group: {
        _id: null,
        totalUnlocks: { $sum: 1 },
        firstUnlocked: { $min: '$unlockedAt' },
        lastUnlocked: { $max: '$unlockedAt' },
        category: { $first: '$category' },
        rarity: { $first: '$rarity' },
      },
    },
    {
      $project: {
        totalUnlocks: 1,
        firstUnlocked: 1,
        lastUnlocked: 1,
        category: 1,
        rarity: 1,
      },
    },
  ]);
};

UserAchievementsSchema.statics.getUserAchievementStatistics = function (userId: Types.ObjectId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalAchievements: { $sum: 1 },
        totalPoints: { $sum: '$pointsAwarded' },
        categoryBreakdown: { $addToSet: '$category' },
        rarityBreakdown: { $addToSet: '$rarity' },
        firstAchievement: { $min: '$unlockedAt' },
        lastAchievement: { $max: '$unlockedAt' },
      },
    },
    {
      $project: {
        totalAchievements: 1,
        totalPoints: 1,
        categoryCount: { $size: '$categoryBreakdown' },
        rarityCount: { $size: '$rarityBreakdown' },
        categoryBreakdown: 1,
        rarityBreakdown: 1,
        firstAchievement: 1,
        lastAchievement: 1,
      },
    },
  ]);
};

UserAchievementsSchema.statics.cleanupDeletedUsers = function (deletedUserIds: Types.ObjectId[]) {
  return this.deleteMany({ userId: { $in: deletedUserIds } });
};

export default mongoose.model<IUserAchievements>('UserAchievements', UserAchievementsSchema);
