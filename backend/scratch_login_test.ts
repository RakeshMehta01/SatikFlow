import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './src/models/User';
import { connectDB } from './src/config/db';

dotenv.config();

const run = async () => {
  await connectDB();
  const user = await User.findOne({ email: 'manager@satikflow.com' });
  if (user) {
    console.log('User found:', user.email);
    console.log('Password hash in DB:', user.passwordHash);
    const test1 = await bcrypt.compare('Password@123', user.passwordHash);
    console.log('Compare with Password@123:', test1);
    const test2 = await bcrypt.compare('password123', user.passwordHash);
    console.log('Compare with password123:', test2);
  } else {
    console.log('User manager@satikflow.com not found');
  }
  mongoose.disconnect();
};

run();
