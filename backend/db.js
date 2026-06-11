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
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    try {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        id: 'admin_1',
        username: 'admin',
        password: adminPassword,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      console.log('✅ Admin user created (username: admin, password: admin123)');
    } catch (err) {
      if (err.code === 11000) {
        console.log('✅ Admin user already exists.');
      } else {
        console.error('❌ Error creating admin:', err);
      }
    }
  }

  const configExists = await BankConfig.findOne();
  if (!configExists) {
    console.log('🌱 Seeding initial data into MongoDB...');
    await BankConfig.create({ bankReserve: 12500000.00 });
    console.log('✅ Seed complete. (Empty project)');
  }
}
