import mongoose, { Schema, Document } from 'mongoose';

export interface IUnlockConditions {
  achievementId?: string;
  storyId?: string;
  endingId?: string;
  completionRate?: number;
  playthroughCount?: number;
  specialEventId?: string;
  minLevel?: number;
}

export interface IAvatar extends Document {
  avatarId: string; // unique identifier
  name: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;

  unlockType: string; // 'free' | 'achievement' | 'story_completion' | 'special_event'
  unlockConditions: IUnlockConditions;

  isActive: boolean;
  isLimited: boolean;
  isHidden: boolean;
  rarity: string; // 'common' | 'rare' | 'epic' | 'legendary'
  sortOrder: number;

  totalUnlocks: number;
  unlockRate: number;
  firstUnlockedAt: Date;

  category: string;
  tags: string[];
  artist: string;
  createdAt: Date;
  updatedAt: Date;
}

const AvatarSchema: Schema = new Schema(
  {
    avatarId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },

    unlockType: {
      type: String,
      enum: ['free', 'achievement', 'story_completion', 'special_event'],
      required: true,
    },
    unlockConditions: {
      achievementId: {
        type: String,
        trim: true,
      },
      storyId: {
        type: String,
        trim: true,
      },
      endingId: {
        type: String,
        trim: true,
      },
      completionRate: {
        type: Number,
        min: 0,
        max: 100,
      },
      playthroughCount: {
        type: Number,
        min: 0,
      },
      specialEventId: {
        type: String,
        trim: true,
      },
      minLevel: {
        type: Number,
        min: 0,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isLimited: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      required: true,
      default: 'common',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },

    totalUnlocks: {
      type: Number,
      default: 0,
      min: 0,
    },
    unlockRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    firstUnlockedAt: {
      type: Date,
    },

    category: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],
    artist: {
      type: String,
      trim: true,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
    collection: 'avatars',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
AvatarSchema.index({ avatarId: 1 }, { unique: true });
AvatarSchema.index({ unlockType: 1 });
AvatarSchema.index({ isActive: 1 });
AvatarSchema.index({ rarity: 1 });
AvatarSchema.index({ category: 1 });
AvatarSchema.index({ totalUnlocks: -1 });

// Methods
AvatarSchema.methods.checkUnlock = function (userStats: {
  achievements?: string[];
  completedStories?: string[];
  specialEvents?: string[];
  level?: number;
}): boolean {
  switch (this.unlockType) {
    case 'free':
      return true;
    case 'achievement':
      return this.unlockConditions.achievementId
        ? (userStats.achievements || []).includes(this.unlockConditions.achievementId)
        : false;
    case 'story_completion':
      return this.unlockConditions.storyId
        ? (userStats.completedStories || []).includes(this.unlockConditions.storyId)
        : false;
    case 'special_event':
      return this.unlockConditions.specialEventId
        ? (userStats.specialEvents || []).includes(this.unlockConditions.specialEventId)
        : false;
    default:
      return false;
  }
};

AvatarSchema.methods.recordUnlock = function () {
  this.totalUnlocks += 1;

  if (!this.firstUnlockedAt) {
    this.firstUnlockedAt = new Date();
  }

  return this.save();
};

AvatarSchema.methods.isAvailable = function (): boolean {
  return this.isActive && !this.isHidden;
};

// Static methods
AvatarSchema.statics.getAvailableAvatars = async function (userStats?: {
  achievements?: string[];
  completedStories?: string[];
  specialEvents?: string[];
  level?: number;
}) {
  const query: Record<string, unknown> = {
    isActive: true,
    isHidden: false,
  };

  const avatars = await this.find(query).sort({ category: 1, sortOrder: 1 });

  if (userStats) {
    return avatars.map((avatar: IAvatar) => ({
      ...avatar.toObject(),
      isUnlocked: avatar.checkUnlock(userStats),
      isAvailable: avatar.isAvailable(),
    }));
  }

  return avatars.map((avatar: IAvatar) => ({
    ...avatar.toObject(),
    isAvailable: avatar.isAvailable(),
  }));
};

AvatarSchema.statics.getAvatarsByRarity = async function (rarity: string) {
  return this.find({
    rarity,
    isActive: true,
    isHidden: false,
  }).sort({ sortOrder: 1 });
};

AvatarSchema.statics.getLimitedAvatars = async function () {
  return this.find({
    isLimited: true,
    isActive: true,
    isHidden: false,
  }).sort({ sortOrder: 1 });
};

AvatarSchema.statics.getMostPopularAvatars = async function (limit = 20) {
  return this.find({
    isActive: true,
    isHidden: false,
  })
    .sort({ totalUnlocks: -1 })
    .limit(limit);
};

// Pre-save middleware
AvatarSchema.pre('save', function (next) {
  // Set first unlock date if total unlocks is positive but first unlocked at is not set
  if (this.totalUnlocks > 0 && !this.firstUnlockedAt) {
    this.firstUnlockedAt = new Date();
  }

  next();
});

export default mongoose.model<IAvatar>('Avatar', AvatarSchema);
