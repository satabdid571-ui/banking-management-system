import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = 'mongodb://localhost:27017/sbibank';

async function updateAdmin() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const newPasswordHash = bcrypt.hashSync('sbiadmin@1949', 10);
  await db.collection('users').updateOne(
    { role: 'admin' }, 
    { $set: { username: 'sbibwn', password: newPasswordHash } }
  );
  console.log('Update forced');
  await mongoose.disconnect();
}

updateAdmin().catch(console.error);
