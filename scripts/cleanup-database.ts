#!/usr/bin/env npx tsx

/**
 * Clean up TalePick database by dropping all collections
 * Run with: npm run db:cleanup
 */

import mongoose from 'mongoose';
import connectDB from '../packages/backend/src/infrastructure/database/connection.js';

async function cleanupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const connection = await connectDB();

    console.log('🗑️  Getting list of all collections...');
    const collections = await connection.connection.db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('ℹ️  No collections found. Database is already clean.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`📋 Found ${collections.length} collections:`);
    collections.forEach((collection, index) => {
      console.log(`  ${index + 1}. ${collection.name}`);
    });

    console.log('\n🗑️  Dropping all collections...');

    for (const collection of collections) {
      try {
        await connection.connection.db.dropCollection(collection.name);
        console.log(`✅ Dropped collection: ${collection.name}`);
      } catch (error) {
        console.log(`⚠️  Could not drop collection ${collection.name}: ${error.message}`);
      }
    }

    console.log('\n🧹 Verifying cleanup...');
    const remainingCollections = await connection.connection.db.listCollections().toArray();

    if (remainingCollections.length === 0) {
      console.log('✅ Database cleanup completed successfully!');
      console.log('📊 Database is now empty and ready for fresh initialization.');
    } else {
      console.log(`⚠️  ${remainingCollections.length} collections remain:`);
      remainingCollections.forEach((collection) => {
        console.log(`  - ${collection.name}`);
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupDatabase();
