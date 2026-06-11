import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  BankConfig, User, Account, Transaction,
  AccountRequest, Loan, Employee, Department
} from './models/index.js';

// ─── Connect & Seed ──────────────────────────────────────────────────────────
export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sbibank';

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB:', uri);

  await seedIfEmpty();
}

// ─── Seed initial data if collections are empty ───────────────────────────────
async function seedIfEmpty() {
  const userCount = await User.countDocuments();
  if (userCount > 0) return; // Already seeded

  console.log('🌱 Seeding initial data into MongoDB...');

  // BankConfig
  await BankConfig.create({ bankReserve: 12500000.00 });

  console.log('✅ Seed complete. (Empty project)');
}
