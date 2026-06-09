import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function testLogin() {
  await mongoose.connect('mongodb://localhost:27017/sbibank');
  const db = mongoose.connection.db;
  const admin = await db.collection('users').findOne({ role: 'admin' });
  console.log("Admin from DB:", admin);
  
  const isValid = bcrypt.compareSync('sbiadmin@1949', admin.password);
  console.log("Is sbiadmin@1949 valid?", isValid);
  
  await mongoose.disconnect();
}

testLogin().catch(console.error);
