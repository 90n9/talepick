import mongoose from 'mongoose';
import { Genre, Achievement, Avatar } from '../models';
import connectDB from '../database/connection';

// Seed data aligns with docs in docs/database/collections
const seedGenres = async () => {
  const genres = [
    {
      slug: 'romance',
      name: 'โรแมนติก',
      description: 'เรื่องราวความรักและความสัมพันธ์',
      storyCount: 0,
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      slug: 'horror',
      name: 'สยองขวัญ',
      description: 'เรื่องราวสยองขวัญและสร้างความกลัว',
      storyCount: 0,
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      slug: 'adventure',
      name: 'ผจญภัย',
      description: 'เรื่องราวการเดินทางและผจญภัย',
      storyCount: 0,
      isActive: true,
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const existingGenres = await Genre.find();
  if (existingGenres.length === 0) {
    await Genre.insertMany(genres);
    console.log('✅ Genres seeded successfully');
  } else {
    console.log('ℹ️ Genres already exist, skipping seed');
  }
};

const seedAvatars = async () => {
  const avatars = [
    {
      avatarId: 'default_avatar',
      name: 'Default Avatar',
      description: 'Default user avatar',
      imageUrl: '/avatars/default.png',
      thumbnailUrl: '/avatars/default-thumb.png',
      unlockType: 'free',
      unlockConditions: {},
      isActive: true,
      isLimited: false,
      isHidden: false,
      rarity: 'common',
      sortOrder: 1,
      totalUnlocks: 0,
      unlockRate: 0,
      category: 'default',
      tags: ['starter'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      avatarId: 'story_master',
      name: 'Story Master',
      description: 'Complete 5 stories',
      imageUrl: '/avatars/story-master.png',
      thumbnailUrl: '/avatars/story-master-thumb.png',
      unlockType: 'story_completion',
      unlockConditions: { storyId: '', completionRate: 100, playthroughCount: 5 },
      isActive: true,
      isLimited: false,
      isHidden: false,
      rarity: 'rare',
      sortOrder: 2,
      totalUnlocks: 0,
      unlockRate: 0,
      category: 'milestone',
      tags: ['completion'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      avatarId: 'reviewer',
      name: 'Reviewer',
      description: 'Write 3 reviews',
      imageUrl: '/avatars/reviewer.png',
      thumbnailUrl: '/avatars/reviewer-thumb.png',
      unlockType: 'achievement',
      unlockConditions: { achievementId: 'write_3_reviews' },
      isActive: true,
      isLimited: false,
      isHidden: false,
      rarity: 'common',
      sortOrder: 3,
      totalUnlocks: 0,
      unlockRate: 0,
      category: 'social',
      tags: ['reviews'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const existingAvatars = await Avatar.find();
  if (existingAvatars.length === 0) {
    await Avatar.insertMany(avatars);
    console.log('✅ Avatars seeded successfully');
  } else {
    console.log('ℹ️ Avatars already exist, skipping seed');
  }
};

const seedAchievements = async () => {
  const achievements = [
    {
      achievementId: 'first_story',
      title: 'First Story',
      description: 'Complete your first story',
      icon: '📖',
      category: 'story',
      type: 'automatic',
      conditions: { storiesCompleted: 1 },
      rewards: { creditBonus: 5, maxCreditIncrease: 0, avatarUnlocks: [] },
      rarity: 'common',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
    },
    {
      achievementId: 'story_explorer_10',
      title: 'Explorer',
      description: 'Complete 10 different stories',
      icon: '🧭',
      category: 'story',
      type: 'automatic',
      conditions: { storiesCompleted: 10 },
      rewards: { creditBonus: 20, maxCreditIncrease: 0, avatarUnlocks: ['story_master'] },
      rarity: 'rare',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
    },
  ];

  const existingAchievements = await Achievement.find();
  if (existingAchievements.length === 0) {
    await Achievement.insertMany(achievements);
    console.log('✅ Achievements seeded successfully');
  } else {
    console.log('ℹ️ Achievements already exist, skipping seed');
  }
};

const runSeeds = async () => {
  try {
    await connectDB();
    console.log('🌱 Running database seeds...');

    await seedGenres();
    await seedAvatars();
    await seedAchievements();

    console.log('✅ Database seeding completed successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeds();
}

export { runSeeds, seedGenres, seedAvatars, seedAchievements };
