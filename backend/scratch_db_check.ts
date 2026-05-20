import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';
import { connectDB } from './src/config/db';

dotenv.config();

const run = async () => {
  await connectDB();
  const users = await User.find({});
  console.log('Seeded Users:');
  users.forEach(u => {
    console.log(`- Email: ${u.email}, Role: ${u.role}, Status: ${u.status}`);
  });
  mongoose.disconnect();
};

run();
