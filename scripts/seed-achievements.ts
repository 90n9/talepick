#!/usr/bin/env npx tsx

import mongoose from 'mongoose';
import connectDB from '../packages/backend/src/infrastructure/database/connection.js';
import { seedAchievements } from '../packages/backend/src/infrastructure/seeds/index.js';

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('🌱 Seeding achievements...');
    await seedAchievements();

    console.log('✅ Achievement seeding completed');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Achievement seeding failed:', error);
    process.exit(1);
  }
}

run();
