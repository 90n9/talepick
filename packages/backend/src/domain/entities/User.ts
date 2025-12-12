import { User as IUser } from '@talepick/shared';
import { CREDIT_CONFIG } from '@talepick/shared';

export class User implements IUser {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly isGuest: boolean,
    public credits: number,
    public readonly maxCredits: number,
    public readonly lastCreditRefill: Date,
    public readonly achievements: string[],
    public readonly authentication: {
      authMethod: 'email' | 'google' | 'guest';
      isEmailVerified: boolean;
    },
    public readonly accountStatus: {
      status: 'active' | 'suspended' | 'banned';
      reason?: string;
    },
    public readonly profile: {
      displayName?: string;
      avatar?: string;
      bio?: string;
      favoriteGenres: string[];
    },
    public readonly gameStats: {
      storiesCompleted: number;
      totalPlayTime: number;
      endingsUnlocked: number;
      reviewsCount: number;
      achievementsCount: number;
    },
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  canSpendCredits(amount: number): boolean {
    if (amount <= 0) return false;
    return this.credits >= amount;
  }

  calculateCreditsToRefill(
    now: Date,
    refillIntervalMs: number = CREDIT_CONFIG.REFILL_INTERVAL_MS
  ): number {
    const timeSinceRefill = now.getTime() - this.lastCreditRefill.getTime();
    if (timeSinceRefill < refillIntervalMs || this.credits >= this.maxCredits) {
      return 0;
    }
    const intervalsPassed = Math.floor(timeSinceRefill / refillIntervalMs);
    return Math.min(intervalsPassed, this.maxCredits - this.credits);
  }

  shouldRefillCredits(
    now: Date,
    refillIntervalMs: number = CREDIT_CONFIG.REFILL_INTERVAL_MS
  ): boolean {
    return this.calculateCreditsToRefill(now, refillIntervalMs) > 0;
  }

  calculateNewBalance(afterTransaction: number): number {
    const newBalance = this.credits + afterTransaction;
    if (newBalance < 0) throw new Error('Insufficient credits');
    if (newBalance > this.maxCredits) throw new Error('Exceeds maximum credits');
    return newBalance;
  }

  isActive(): boolean {
    return this.accountStatus.status === 'active';
  }

  isEmailVerified(): boolean {
    return this.authentication.isEmailVerified;
  }
}
