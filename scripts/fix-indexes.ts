#!/usr/bin/env npx tsx

/**
 * Fix missing indexes in TalePick database
 * Run with: npm run db:fix-indexes
 */

import mongoose from 'mongoose';
import connectDB from '../packages/backend/src/infrastructure/database/connection.js';
import { User, Genre, Achievement } from '../packages/backend/src/infrastructure/models/index.js';

async function fixIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('🔧 Creating missing User model indexes...');

    // Check if User model exists and create missing indexes
    const UserSchema = User.schema;

    console.log('📊 User model indexes before fix:');
    const userIndexesBefore = UserSchema.indexes();
    userIndexesBefore.forEach((index, i) => {
      console.log(`  ${i + 1}. ${JSON.stringify(index)}`);
    });

    // Create missing User indexes
    console.log('\n🔧 Creating User indexes...');
    await User.createIndexes();

    // Verify indexes were created
    console.log('\n📊 User collection indexes after fix:');
    const userCollection = User.collection;
    const userIndexes = await userCollection.indexes();
    userIndexes.forEach((index, i) => {
      console.log(
        `  ${i + 1}. Name: ${index.name}, Key: ${JSON.stringify(index.key)}, Unique: ${index.unique || false}, Sparse: ${index.sparse || false}`
      );
    });

    console.log('\n🔧 Creating missing indexes for other models...');

    // Create indexes for other models to ensure they're properly set up
    const models = [Genre, Achievement];

    for (const Model of models) {
      try {
        console.log(`\n📊 Creating indexes for ${Model.modelName}...`);
        await Model.createIndexes();

        const indexes = await Model.collection.indexes();
        console.log(`✅ ${Model.modelName} has ${indexes.length} indexes`);
      } catch (error) {
        console.log(`⚠️  Error creating indexes for ${Model.modelName}:`, error.message);
      }
    }

    console.log('\n🎉 Database indexes fix completed successfully!');
    console.log('✅ All missing indexes have been created.');

    try {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB.');
    } catch (disconnectError) {
      console.error('⚠️  Warning: Failed to disconnect from MongoDB:', disconnectError);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Index fix failed:', error);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('⚠️  Warning: Failed to disconnect from MongoDB:', disconnectError);
    }
    process.exit(1);
  }
}

// Run the index fix
fixIndexes();
