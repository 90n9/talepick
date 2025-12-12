export interface User {
  id: string;
  email: string;
  username: string;
  isGuest: boolean;
  credits: number;
  maxCredits: number;
  lastCreditRefill: Date;
  achievements: string[];
  authentication: {
    authMethod: 'email' | 'google' | 'guest';
    isEmailVerified: boolean;
  };
  accountStatus: {
    status: 'active' | 'suspended' | 'banned';
    reason?: string;
  };
  profile: {
    displayName?: string;
    avatar?: string;
    bio?: string;
    favoriteGenres: string[];
  };
  gameStats: {
    storiesCompleted: number;
    totalPlayTime: number;
    endingsUnlocked: number;
    reviewsCount: number;
    achievementsCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  transactionType: 'spend' | 'earn' | 'refund' | 'bonus';
  source: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
