import mongoose, { Schema, Document } from 'mongoose';

export interface IConditions {
  storiesCompleted?: number;
  storiesInGenre?: { genre: string; count: number };
  specificStoryId?: string;
  allEndingsInStory?: string;
  reviewsWritten?: number;
  totalPlaytime?: number;
  creditsSpent?: number;
  loginStreak?: number;
}

export interface IRewards {
  creditBonus?: number;
  maxCreditIncrease?: number;
  avatarUnlocks?: string[]; // avatar IDs
}

export interface IAchievement extends Document {
  achievementId: string; // unique identifier
  title: string;
  description: string;
  icon: string; // emoji or icon URL
  category: string; // 'story' | 'social' | 'special' | 'milestone'
  type: string; // 'automatic' | 'conditional' | 'hidden'

  conditions: IConditions;
  rewards: IRewards;

  rarity: string; // 'common' | 'rare' | 'epic' | 'legendary'
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;

  // Methods
  checkUnlock(userStats: {
    storiesCompleted?: number;
    storiesInGenre?: Record<string, number>;
    completedStories?: string[];
    reviewsWritten?: number;
    totalPlaytime?: number;
    creditsSpent?: number;
    loginStreak?: number;
  }): boolean;
  calculateProgress(userStats: {
    storiesCompleted?: number;
    storiesInGenre?: Record<string, number>;
    completedStories?: string[];
    reviewsWritten?: number;
    totalPlaytime?: number;
    creditsSpent?: number;
    loginStreak?: number;
  }): { progress: number; completed: boolean; currentValue?: number; targetValue?: number };
}

const AchievementSchema: Schema = new Schema(
  {
    achievementId: {
      type: String,
      required: true,
      trim: true,
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
    category: {
      type: String,
      enum: ['story', 'social', 'special', 'milestone'],
      required: true,
    },
    type: {
      type: String,
      enum: ['automatic', 'conditional', 'hidden'],
      required: true,
    },

    conditions: {
      storiesCompleted: {
        type: Number,
        min: 0,
      },
      storiesInGenre: {
        genre: {
          type: String,
          trim: true,
        },
        count: {
          type: Number,
          min: 0,
        },
      },
      specificStoryId: {
        type: String,
        trim: true,
      },
      allEndingsInStory: {
        type: String,
        trim: true,
      },
      reviewsWritten: {
        type: Number,
        min: 0,
      },
      totalPlaytime: {
        type: Number,
        min: 0,
      },
      creditsSpent: {
        type: Number,
        min: 0,
      },
      loginStreak: {
        type: Number,
        min: 0,
      },
    },

    rewards: {
      creditBonus: {
        type: Number,
        min: 0,
      },
      maxCreditIncrease: {
        type: Number,
        min: 0,
      },
      avatarUnlocks: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      required: true,
      default: 'common',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
AchievementSchema.index({ achievementId: 1 }, { unique: true });
AchievementSchema.index({ category: 1 });
AchievementSchema.index({ type: 1 });
AchievementSchema.index({ isActive: 1 });

// Methods
AchievementSchema.methods.checkUnlock = function (userStats: {
  storiesCompleted?: number;
  storiesInGenre?: Record<string, number>;
  completedStories?: string[];
  reviewsWritten?: number;
  totalPlaytime?: number;
  creditsSpent?: number;
  loginStreak?: number;
}): boolean {
  const { conditions } = this;

  // Stories completed condition
  if (conditions.storiesCompleted) {
    return (userStats.storiesCompleted || 0) >= conditions.storiesCompleted;
  }

  // Stories in genre condition
  if (conditions.storiesInGenre) {
    const genreCount = (userStats.storiesInGenre || {})[conditions.storiesInGenre.genre] || 0;
    return genreCount >= conditions.storiesInGenre.count;
  }

  // Specific story completion
  if (conditions.specificStoryId) {
    return (userStats.completedStories || []).includes(conditions.specificStoryId);
  }

  // All endings in story (would need additional logic to check all endings)
  if (conditions.allEndingsInStory) {
    // This would require additional logic to check if user has completed all endings
    // For now, return false as this needs more complex checking
    return false;
  }

  // Reviews written
  if (conditions.reviewsWritten) {
    return (userStats.reviewsWritten || 0) >= conditions.reviewsWritten;
  }

  // Total playtime
  if (conditions.totalPlaytime) {
    return (userStats.totalPlaytime || 0) >= conditions.totalPlaytime;
  }

  // Credits spent
  if (conditions.creditsSpent) {
    return (userStats.creditsSpent || 0) >= conditions.creditsSpent;
  }

  // Login streak
  if (conditions.loginStreak) {
    return (userStats.loginStreak || 0) >= conditions.loginStreak;
  }

  return false;
};

AchievementSchema.methods.calculateProgress = function (userStats: {
  storiesCompleted?: number;
  storiesInGenre?: Record<string, number>;
  completedStories?: string[];
  reviewsWritten?: number;
  totalPlaytime?: number;
  creditsSpent?: number;
  loginStreak?: number;
}): { progress: number; completed: boolean; currentValue?: number; targetValue?: number } {
  const { conditions } = this;
  let progress = 0;
  let completed = false;
  let currentValue = 0;
  let targetValue = 0;

  if (conditions.storiesCompleted) {
    currentValue = userStats.storiesCompleted || 0;
    targetValue = conditions.storiesCompleted;
    progress = Math.min(100, (currentValue / targetValue) * 100);
    completed = currentValue >= targetValue;
  } else if (conditions.storiesInGenre) {
    currentValue = (userStats.storiesInGenre || {})[conditions.storiesInGenre.genre] || 0;
    targetValue = conditions.storiesInGenre.count;
    progress = Math.min(100, (currentValue / targetValue) * 100);
    completed = currentValue >= targetValue;
  } else if (conditions.specificStoryId) {
    completed = (userStats.completedStories || []).includes(conditions.specificStoryId);
    progress = completed ? 100 : 0;
    currentValue = completed ? 1 : 0;
    targetValue = 1;
  } else if (conditions.reviewsWritten) {
    currentValue = userStats.reviewsWritten || 0;
    targetValue = conditions.reviewsWritten;
    progress = Math.min(100, (currentValue / targetValue) * 100);
    completed = currentValue >= targetValue;
  } else if (conditions.totalPlaytime) {
    currentValue = userStats.totalPlaytime || 0;
    targetValue = conditions.totalPlaytime;
    progress = Math.min(100, (currentValue / targetValue) * 100);
    completed = currentValue >= targetValue;
  } else if (conditions.creditsSpent) {
    currentValue = userStats.creditsSpent || 0;
    targetValue = conditions.creditsSpent;
    progress = Math.min(100, (currentValue / targetValue) * 100);
    completed = currentValue >= targetValue;
  } else if (conditions.loginStreak) {
    currentValue = userStats.loginStreak || 0;
    targetValue = conditions.loginStreak;
    progress = Math.min(100, (currentValue / targetValue) * 100);
    completed = currentValue >= targetValue;
  }

  return {
    progress: Math.round(progress),
    completed,
    currentValue,
    targetValue,
  };
};

// Static methods
AchievementSchema.statics.getVisibleAchievements = function (isAdmin = false) {
  const query: Record<string, unknown> = { isActive: true };

  if (!isAdmin) {
    query.type = { $ne: 'hidden' };
  }

  return this.find(query).sort({ category: 1, sortOrder: 1 });
};

AchievementSchema.statics.getAchievementsByCategory = function (category: string) {
  return this.find({
    category,
    isActive: true,
  }).sort({ sortOrder: 1 });
};

AchievementSchema.statics.getAchievementsWithAvatarRewards = function () {
  return this.find({
    'rewards.avatarUnlocks.0': { $exists: true },
    isActive: true,
  }).select({
    achievementId: 1,
    title: 1,
    'rewards.avatarUnlocks': 1,
    rarity: 1,
  });
};

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);
export default Achievement;
