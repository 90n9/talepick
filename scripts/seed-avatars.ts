#!/usr/bin/env npx tsx

import mongoose from 'mongoose';
import connectDB from '../packages/backend/src/infrastructure/database/connection.js';
import { seedAvatars } from '../packages/backend/src/infrastructure/seeds/index.js';

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('🌱 Seeding avatars...');
    await seedAvatars();

    console.log('✅ Avatar seeding completed');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Avatar seeding failed:', error);
    process.exit(1);
  }
}

run();
