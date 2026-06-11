import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
  await mongoose.connect('mongodb://localhost:27017/sbibank');
  const db = mongoose.connection.db;
  
  const users = await db.collection('users').find({ username: { $regex: /admin/i } }).toArray();
  console.log("Users matching admin:", users);
  
  process.exit(0);
}

checkAdmin().catch(console.error);
