#!/usr/bin/env npx tsx

/**
 * Test script to verify all database models can be imported correctly
 * Run with: npm run test:models
 */

import {
  User,
  Story,
  Genre,
  Achievement,
  AdminAccount,
  Analytics,
  Avatar,
  CreditTransaction,
  Review,
  ReviewFlag,
  ReviewVote,
  StoryAsset,
  StoryFlag,
  StoryGallery,
  StoryNode,
  UserAchievement,
  UserAvatar,
  UserFavorite,
  UserSession,
  UserStoryProgress,
  AdminLog,
  AdminLoginHistory,
  OtpCode,
  SecurityEvent,
  SystemConfig,
  connectDB,
} from '../packages/backend/src/infrastructure/models/index.js';

console.log('🧪 Testing Database Model Imports\n');

// Track results
const results = {
  success: [],
  failed: [],
};

// Test function
function testImport(name, model) {
  try {
    if (model && typeof model === 'function') {
      console.log(`✅ ${name}: Imported successfully`);
      results.success.push(name);
    } else {
      console.log(`❌ ${name}: Invalid import`);
      results.failed.push(name);
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    results.failed.push(name);
  }
}

// Test all models
console.log('📊 Testing Model Imports...\n');
testImport('User', User);
testImport('Story', Story);
testImport('Genre', Genre);
testImport('Achievement', Achievement);
testImport('AdminAccount', AdminAccount);
testImport('Analytics', Analytics);
testImport('Avatar', Avatar);
testImport('CreditTransaction', CreditTransaction);
testImport('Review', Review);
testImport('ReviewFlag', ReviewFlag);
testImport('ReviewVote', ReviewVote);
testImport('StoryAsset', StoryAsset);
testImport('StoryFlag', StoryFlag);
testImport('StoryGallery', StoryGallery);
testImport('StoryNode', StoryNode);
testImport('UserAchievement', UserAchievement);
testImport('UserAvatar', UserAvatar);
testImport('UserFavorite', UserFavorite);
testImport('UserSession', UserSession);
testImport('UserStoryProgress', UserStoryProgress);
testImport('AdminLog', AdminLog);
testImport('AdminLoginHistory', AdminLoginHistory);
testImport('OtpCode', OtpCode);
testImport('SecurityEvent', SecurityEvent);
testImport('SystemConfig', SystemConfig);

console.log('\n🔌 Testing Connection Import...\n');
testImport('connectDB', connectDB);

// Summary
console.log('\n📋 Summary');
console.log('='.repeat(40));
console.log(`✅ Successful imports: ${results.success.length}`);
console.log(`❌ Failed imports: ${results.failed.length}`);

if (results.failed.length > 0) {
  console.log('\nFailed imports:');
  results.failed.forEach((name) => console.log(`  - ${name}`));
  process.exit(1);
} else {
  console.log('\n🎉 All models imported successfully!');
  console.log('Database index file is working correctly.');
  process.exit(0);
}
