#!/usr/bin/env npx tsx

import connectDB from '../packages/backend/src/infrastructure/database/connection.js';
import { seedGenres } from '../packages/backend/src/infrastructure/seeds/index.js';

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('🌱 Seeding genres...');
    await seedGenres();

    console.log('✅ Genre seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Genre seeding failed:', error);
    process.exit(1);
  }
}

run();
