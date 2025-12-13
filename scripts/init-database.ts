#!/usr/bin/env npx tsx

/**
 * Initialize TalePick database by creating collections
 * Run with: npm run db:init
 */

import mongoose from 'mongoose';
import connectDB from '../packages/backend/src/infrastructure/database/connection.js';
import { User, Genre, Achievement } from '../packages/backend/src/infrastructure/models/index.js';

async function initDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('📊 Creating initial collections...');

    // Create a test user to initialize the users collection
    const testUser = new User({
      email: 'test@talepick.com',
      username: 'testuser',
      passwordHash: 'test_hash',
      profile: {
        displayName: 'Test User',
        avatar: { type: 'default', value: 'default' },
        bio: 'Test user for database initialization',
      },
      authentication: {
        authMethod: 'email',
        isGuest: false,
        emailVerified: true,
        hasPassword: true,
      },
      gameStats: {
        credits: 10,
        maxCredits: 10,
        totalStoriesPlayed: 0,
        totalEndingsUnlocked: 0,
        totalAvatarsUnlocked: 0,
      },
    });

    // Create test genre to initialize genres collection
    const testGenre = new Genre({
      slug: 'romance',
      name: 'โรแมนติก',
      description: 'เรื่องราวความรักและความสัมพันธ์',
      storyCount: 0,
      isActive: true,
      sortOrder: 1,
    });

    // Create test achievement to initialize achievements collection
    const testAchievement = new Achievement({
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
    });

    console.log('💾 Saving test data...');

    // Save the test data (delete any existing first)
    await User.deleteOne({ email: 'test@talepick.com' }).catch(() => {});
    await Genre.deleteOne({ slug: 'romance' }).catch(() => {});
    await Achievement.deleteOne({ achievementId: 'first_story' }).catch(() => {});

    await testUser.save();
    console.log('✅ Created test user');

    await testGenre.save();
    console.log('✅ Created test genre');

    await testAchievement.save();
    console.log('✅ Created test achievement');

    console.log('\n🔧 Ensuring missing database indexes...');

    // Manually create missing User indexes that aren't created automatically
    const db = mongoose.connection.db;
    const userCollection = db.collection('users');

    try {
      await userCollection.createIndex({ 'accountStatus.status': 1 });
      console.log('✅ Created accountStatus.status index');
    } catch (error) {
      // Index might already exist, which is fine
      console.log('ℹ️  accountStatus.status index already exists');
    }

    try {
      await userCollection.createIndex({ deletedAt: 1 }, { sparse: true });
      console.log('✅ Created deletedAt sparse index');
    } catch (error) {
      // Index might already exist, which is fine
      console.log('ℹ️  deletedAt sparse index already exists');
    }

    console.log('\n🎉 TalePick database initialized successfully!');
    console.log('You can now see the "talepick" database in MongoDB.');

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: 'test@talepick.com' });
    await Genre.deleteOne({ slug: 'romance' });
    await Achievement.deleteOne({ achievementId: 'first_story' });
    console.log('✅ Test data cleaned up');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initDatabase();
