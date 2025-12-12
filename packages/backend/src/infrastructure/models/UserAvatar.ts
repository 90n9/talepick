import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUnlockSource {
  type: string; // 'achievement' | 'story_completion' | 'event' | 'admin_grant' | 'purchase'
  sourceId?: string; // related source ID
  sourceName?: string; // human-readable name
  details?: string; // additional context
}

export interface IUsage {
  timesUsed?: number; // how many times user has selected this avatar
  lastUsedAt?: Date; // when this avatar was last active
  isCurrentlyActive?: boolean; // if this is user's current avatar
}

export interface IAvatarInfo {
  name: string; // avatar display name
  rarity: string; // 'common' | 'rare' | 'epic' | 'legendary'
  category: string; // 'character' | 'story_specific' | 'achievement' | 'event'
  imageUrl: string; // thumbnail URL for quick display
  thumbnailUrl: string;
}

export interface IUserAvatar extends Document {
  userId: Types.ObjectId; // references Users
  avatarId: string; // references Avatars.avatarId

  // Unlock details
  unlockedAt: Date;
  unlockSource: IUnlockSource;

  // Avatar usage tracking
  usage: IUsage;

  // Avatar metadata (denormalized for performance)
  avatarInfo: IAvatarInfo;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  setActive(): Promise<void>;
  recordUsage(): Promise<void>;
  getUsageStats(): { timesUsed: number; lastUsedAt?: Date };
}

const UnlockSourceSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['achievement', 'story_completion', 'event', 'admin_grant', 'purchase'],
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

const UsageSchema = new Schema(
  {
    timesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUsedAt: {
      type: Date,
    },
    isCurrentlyActive: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const AvatarInfoSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      required: true,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const UserAvatarSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    avatarId: {
      type: String,
      required: true,
      trim: true,
    },

    // Unlock details
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    unlockSource: {
      type: UnlockSourceSchema,
      required: true,
    },

    // Avatar usage tracking
    usage: {
      type: UsageSchema,
      default: {},
    },

    // Avatar metadata
    avatarInfo: {
      type: AvatarInfoSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'user_avatars',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserAvatarSchema.index({ userId: 1, avatarId: 1 }, { unique: true });
UserAvatarSchema.index({ userId: 1, 'usage.isCurrentlyActive': 1 });
UserAvatarSchema.index({ userId: 1, unlockedAt: -1 });
UserAvatarSchema.index({ avatarId: 1, unlockedAt: -1 });
UserAvatarSchema.index({ 'avatarInfo.rarity': 1 });

// Methods
UserAvatarSchema.methods.setActive = async function () {
  // First, deactivate all other avatars for this user
  await this.constructor.updateMany(
    { userId: this.userId },
    {
      $set: {
        'usage.isCurrentlyActive': false,
        'usage.lastUsedAt': new Date(),
      },
    }
  );

  // Then activate this avatar
  this.usage.isCurrentlyActive = true;
  this.usage.timesUsed = (this.usage.timesUsed || 0) + 1;
  this.usage.lastUsedAt = new Date();

  return this.save();
};

UserAvatarSchema.methods.recordUsage = async function () {
  this.usage.timesUsed = (this.usage.timesUsed || 0) + 1;
  this.usage.lastUsedAt = new Date();
  return this.save();
};

UserAvatarSchema.methods.getUsageStats = function () {
  return {
    timesUsed: this.usage.timesUsed || 0,
    lastUsedAt: this.usage.lastUsedAt,
  };
};

// Static methods
UserAvatarSchema.statics.getUserCurrentAvatar = function (userId: Types.ObjectId) {
  return this.findOne({
    userId,
    'usage.isCurrentlyActive': true,
  });
};

UserAvatarSchema.statics.getUserAvatarCollection = function (
  userId: Types.ObjectId,
  skip = 0,
  limit = 50
) {
  return this.find({ userId }).sort({ unlockedAt: -1 }).skip(skip).limit(limit);
};

UserAvatarSchema.statics.getUserAvatarsByRarity = function (
  userId: Types.ObjectId,
  rarity: string
) {
  return this.find({
    userId,
    'avatarInfo.rarity': rarity,
  }).sort({ 'usage.timesUsed': -1 });
};

UserAvatarSchema.statics.unlockAvatar = function (
  userId: Types.ObjectId,
  avatarId: string,
  unlockSource: IUnlockSource,
  avatarInfo: IAvatarInfo
) {
  return this.create({
    userId,
    avatarId,
    unlockSource,
    avatarInfo,
  });
};

UserAvatarSchema.statics.hasAvatar = function (userId: Types.ObjectId, avatarId: string) {
  return this.findOne({ userId, avatarId });
};

UserAvatarSchema.statics.getMostPopularAvatars = function (limit = 20) {
  return this.aggregate([
    {
      $group: {
        _id: '$avatarId',
        unlockCount: { $sum: 1 },
        totalUsage: { $sum: '$usage.timesUsed' },
        avatarInfo: { $first: '$avatarInfo' },
      },
    },
    { $sort: { unlockCount: -1 } },
    { $limit: limit },
    {
      $project: {
        avatarId: '$_id',
        unlockCount: 1,
        totalUsage: 1,
        averageUsage: { $divide: ['$totalUsage', '$unlockCount'] },
        'avatarInfo.name': 1,
        'avatarInfo.rarity': 1,
        'avatarInfo.thumbnailUrl': 1,
      },
    },
  ]);
};

UserAvatarSchema.statics.getAvatarUnlockAnalytics = function () {
  return this.aggregate([
    {
      $group: {
        _id: {
          rarity: '$avatarInfo.rarity',
          category: '$avatarInfo.category',
        },
        totalUnlocks: { $sum: 1 },
        averageUsage: { $avg: '$usage.timesUsed' },
        totalUsage: { $sum: '$usage.timesUsed' },
      },
    },
    { $sort: { '_id.rarity': -1, totalUnlocks: -1 } },
    {
      $project: {
        rarity: '$_id.rarity',
        category: '$_id.category',
        totalUnlocks: 1,
        averageUsage: { $round: ['$averageUsage', 2] },
        totalUsage: 1,
        usagePerUnlock: { $round: [{ $divide: ['$totalUsage', '$totalUnlocks'] }, 2] },
      },
    },
  ]);
};

UserAvatarSchema.statics.getUserAvatarTimeline = function (userId: Types.ObjectId) {
  return this.find({ userId })
    .select({
      avatarId: 1,
      'avatarInfo.name': 1,
      'avatarInfo.rarity': 1,
      unlockedAt: 1,
      'unlockSource.type': 1,
      'unlockSource.sourceName': 1,
    })
    .sort({ unlockedAt: -1 });
};

UserAvatarSchema.statics.getUserAvatarStatistics = function (userId: Types.ObjectId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalAvatars: { $sum: 1 },
        totalUsage: { $sum: '$usage.timesUsed' },
        rarityDistribution: {
          $push: '$avatarInfo.rarity',
        },
        categoryDistribution: {
          $push: '$avatarInfo.category',
        },
      },
    },
    {
      $project: {
        totalAvatars: 1,
        totalUsage: 1,
        averageUsage: { $round: [{ $divide: ['$totalUsage', '$totalAvatars'] }, 2] },
        rarityBreakdown: {
          $arrayToObject: {
            $map: {
              input: { $setUnion: ['$rarityDistribution', []] },
              as: 'rarity',
              in: {
                k: '$$rarity',
                v: {
                  $size: {
                    $filter: {
                      input: '$rarityDistribution',
                      cond: { $eq: ['$$this', '$$rarity'] },
                    },
                  },
                },
              },
            },
          },
        },
        categoryBreakdown: {
          $arrayToObject: {
            $map: {
              input: { $setUnion: ['$categoryDistribution', []] },
              as: 'category',
              in: {
                k: '$$category',
                v: {
                  $size: {
                    $filter: {
                      input: '$categoryDistribution',
                      cond: { $eq: ['$$this', '$$category'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);
};

UserAvatarSchema.statics.adminGrantAvatar = function (
  userId: Types.ObjectId,
  avatarId: string,
  avatarInfo: IAvatarInfo,
  details?: string
) {
  return this.unlockAvatar(
    userId,
    avatarId,
    {
      type: 'admin_grant',
      sourceName: 'Admin Grant',
      details: details || 'Granted by administrator',
    },
    avatarInfo
  );
};

export const UserAvatar = mongoose.model<IUserAvatar>('UserAvatar', UserAvatarSchema);
export default UserAvatar;
