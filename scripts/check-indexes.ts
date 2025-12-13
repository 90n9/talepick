#!/usr/bin/env npx tsx

/**
 * Check all indexes in TalePick database
 * Run with: npm run db:check-indexes
 */

import connectDB from '../packages/backend/src/infrastructure/database/connection.js';
import {
  User,
  Genre,
  Achievement,
  AdminAccount,
  Review,
  StoryNode,
  StoryAsset,
  UserFavorite,
  ReviewVote,
  AdminLog,
} from '../packages/backend/src/infrastructure/models/index.js';

async function checkAllIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    const models = [
      { name: 'User', model: User },
      { name: 'Genre', model: Genre },
      { name: 'Achievement', model: Achievement },
      { name: 'AdminAccount', model: AdminAccount },
      { name: 'Review', model: Review },
      { name: 'StoryNode', model: StoryNode },
      { name: 'StoryAsset', model: StoryAsset },
      { name: 'UserFavorite', model: UserFavorite },
      { name: 'ReviewVote', model: ReviewVote },
      { name: 'AdminLog', model: AdminLog },
    ];

    console.log('📊 Checking indexes for all collections...\n');

    for (const { name, model } of models) {
      try {
        const indexes = await model.collection.indexes();
        console.log(`🔍 ${name} collection (${indexes.length} indexes):`);

        indexes.forEach((index, i) => {
          const unique = index.unique ? ' (unique)' : '';
          const sparse = index.sparse ? ' (sparse)' : '';
          const ttl = index.expireAfterSeconds ? ` (TTL: ${index.expireAfterSeconds}s)` : '';

          console.log(
            `  ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}${unique}${sparse}${ttl}`
          );
        });
        console.log('');
      } catch (error) {
        console.log(`❌ Error checking ${name}:`, error.message);
      }
    }

    console.log('🎉 Index check completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Index check failed:', error);
    process.exit(1);
  }
}

// Run the index check
checkAllIndexes();
