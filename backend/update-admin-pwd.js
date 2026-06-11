import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/index.js';

async function updatePassword() {
  await mongoose.connect('mongodb://localhost:27017/sbibank');
  const adminPassword = await bcrypt.hash('admin123', 10);
  await User.updateOne({ username: 'admin' }, { $set: { password: adminPassword } });
  console.log('✅ Admin password updated to "admin123"');
  process.exit(0);
}

updatePassword().catch(console.error);
