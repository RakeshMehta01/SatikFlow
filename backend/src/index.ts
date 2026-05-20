import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import app from './app';
import { connectDB } from './config/db';
import User from './models/User';

// Load Env variables
dotenv.config();

const PORT = process.env.PORT || 5001;

// Seed default users if empty
const seedDefaultUsers = async () => {
  try {
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      console.log('🌱 Database is empty. Seeding default manager and agents...');
      
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Password@123', salt);

      // Create default manager
      await User.create({
        name: 'SatikFlow Manager',
        email: 'manager@satikflow.com',
        phone: '9876543210',
        passwordHash,
        role: 'MANAGER',
        status: 'ACTIVE'
      });

      // Create default agent 1
      await User.create({
        name: 'Calling Agent Alice',
        email: 'agent1@satikflow.com',
        phone: '9123456789',
        passwordHash,
        role: 'AGENT',
        status: 'ACTIVE'
      });

      // Create default agent 2
      await User.create({
        name: 'Calling Agent Bob',
        email: 'agent2@satikflow.com',
        phone: '9876543211',
        passwordHash,
        role: 'AGENT',
        status: 'ACTIVE'
      });

      console.log('✅ Seeding complete:');
      console.log('   Manager: manager@satikflow.com / Password@123');
      console.log('   Agent 1: agent1@satikflow.com / Password@123');
      console.log('   Agent 2: agent2@satikflow.com / Password@123');
    }
  } catch (error) {
    console.error('Error seeding default users:', error);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  await seedDefaultUsers();
  
  app.listen(PORT, () => {
    console.log(`🚀 SatikFlow CRM API server is running on port ${PORT}`);
  });
};

startServer();
