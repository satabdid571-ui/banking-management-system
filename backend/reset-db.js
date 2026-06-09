import mongoose from 'mongoose';
import { connectDB } from './db.js';

async function resetDB() {
  await mongoose.connect('mongodb://localhost:27017/sbibank');
  await mongoose.connection.db.dropDatabase();
  console.log("Database dropped!");
  await mongoose.disconnect();
}

resetDB().catch(console.error);
