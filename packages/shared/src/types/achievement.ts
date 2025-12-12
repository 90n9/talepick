export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category: 'story' | 'credit' | 'social' | 'milestone';
  type: 'progress' | 'collection' | 'challenge';
  requirements: {
    type:
      | 'stories_completed'
      | 'credits_spent'
      | 'reviews_written'
      | 'specific_story'
      | 'genre_master';
    target: number;
    filters?: Record<string, unknown>;
  };
  rewards: {
    credits?: number;
    maxCreditsBonus?: number;
    badge?: string;
    avatar?: string;
  };
  metadata: {
    isSecret: boolean;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    sortOrder: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  rewardClaimed: boolean;
  claimedAt?: Date;
  metadata?: Record<string, unknown>;
}
