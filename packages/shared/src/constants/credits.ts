export const CREDIT_CONFIG = {
  // Refill settings
  REFILL_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  BASE_MAX_CREDITS: 20,
  GUEST_MAX_CREDITS: 10,

  // Story costs
  CHOICE_COST: 1,
  STORY_START_COST: 0,

  // Rewards
  STORY_COMPLETION_REWARD: 3,
  REVIEW_REWARD: 2,
  ACHIEVEMENT_MIN_REWARD: 1,
  ACHIEVEMENT_MAX_REWARD: 10,

  // Limits
  MAX_TRANSACTION_AMOUNT: 1000,
  MIN_TRANSACTION_AMOUNT: 1,
} as const;

export const ACHIEVEMENT_CREDITS_BONUS: Record<string, number> = {
  // Story achievements
  first_story: 3,
  story_collector: 5,
  genre_explorer: 4,

  // Credit achievements
  thrifty_spender: 2,
  big_spender: 8,

  // Social achievements
  critic: 5,
  helpful_reviewer: 3,

  // Milestone achievements
  veteran_player: 10,
  completionist: 15,
} as const;
