import mongoose from 'mongoose';
import { connectDB } from './db.js';

async function seed() {
  await connectDB();
  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch(console.error);
