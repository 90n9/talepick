import { CREDIT_CONFIG, ACHIEVEMENT_CREDITS_BONUS } from '@talepick/shared';

export class CreditService {
  static calculateMaxCredits(achievements: string[], isGuest: boolean): number {
    if (isGuest) return CREDIT_CONFIG.GUEST_MAX_CREDITS;

    const baseCredits = CREDIT_CONFIG.BASE_MAX_CREDITS;
    const achievementBonuses = this.getAchievementBonuses(achievements);
    return baseCredits + achievementBonuses;
  }

  static validateCreditTransaction(
    currentBalance: number,
    amount: number,
    type: 'spend' | 'earn' | 'refund' | 'bonus'
  ): { isValid: boolean; error?: string } {
    // Validate amount
    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be positive' };
    }

    if (amount > CREDIT_CONFIG.MAX_TRANSACTION_AMOUNT) {
      return { isValid: false, error: 'Amount exceeds maximum transaction limit' };
    }

    // Validate spend transactions
    if (type === 'spend' && currentBalance < amount) {
      return { isValid: false, error: 'Insufficient credits' };
    }

    // Validate earn transactions won't exceed maximum
    if (type === 'earn' || type === 'refund' || type === 'bonus') {
      const newBalance = currentBalance + amount;
      if (newBalance > CREDIT_CONFIG.BASE_MAX_CREDITS + 100) {
        // Allow some buffer for achievements
        return { isValid: false, error: 'Transaction would exceed maximum credit limit' };
      }
    }

    return { isValid: true };
  }

  static calculateStoryEarnings(isGuest: boolean, hasReview: boolean): number {
    let earnings: number = CREDIT_CONFIG.STORY_COMPLETION_REWARD;

    if (isGuest) {
      earnings = Math.floor(earnings * 0.5); // Guests earn half
    }

    if (hasReview) {
      earnings += CREDIT_CONFIG.REVIEW_REWARD;
    }

    return earnings;
  }

  private static getAchievementBonuses(achievements: string[]): number {
    return achievements.reduce((total, achievementId) => {
      return total + (ACHIEVEMENT_CREDITS_BONUS[achievementId] || 0);
    }, 0);
  }

  static getAchievementBonus(achievementId: string): number {
    return ACHIEVEMENT_CREDITS_BONUS[achievementId] || 0;
  }
}
