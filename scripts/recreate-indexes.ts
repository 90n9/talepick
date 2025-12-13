#!/usr/bin/env npx tsx

/**
 * Recreate all User model indexes properly
 * Run with: npm run db:recreate-indexes
 */

import mongoose from 'mongoose';

const MONGODB_URL =
  process.env.MONGODB_URL || 'mongodb://root:example@localhost:27017/talepick?authSource=admin';

async function recreateUserIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL);

    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Dropping all indexes from users collection...');
    await db.collection('users').dropIndexes();
    console.log('✅ Dropped all indexes from users collection');

    console.log('🔧 Recreating User indexes properly...');

    // Create the exact indexes we need
    const userCollection = db.collection('users');

    // 1. Email unique index
    await userCollection.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created email unique index');

    // 2. Username unique index
    await userCollection.createIndex({ username: 1 }, { unique: true });
    console.log('✅ Created username unique index');

    // 3. Google ID unique sparse index
    await userCollection.createIndex(
      { 'authentication.googleId': 1 },
      { unique: true, sparse: true }
    );
    console.log('✅ Created googleId unique sparse index');

    // 4. Account status index
    await userCollection.createIndex({ 'accountStatus.status': 1 });
    console.log('✅ Created accountStatus.status index');

    // 5. DeletedAt sparse index
    await userCollection.createIndex({ deletedAt: 1 }, { sparse: true });
    console.log('✅ Created deletedAt sparse index');

    console.log('\n📊 Final User collection indexes:');
    const finalIndexes = await userCollection.indexes();
    finalIndexes.forEach((index, i) => {
      console.log(
        `  ${i + 1}. Name: ${index.name}, Key: ${JSON.stringify(index.key)}, Unique: ${index.unique || false}, Sparse: ${index.sparse || false}`
      );
    });

    await mongoose.disconnect();
    console.log('\n🎉 User indexes recreated successfully!');
    console.log('✅ All required indexes are now properly created.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Index recreation failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the index recreation
recreateUserIndexes();
