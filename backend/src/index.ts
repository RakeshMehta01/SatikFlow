import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db';
import apiRouter from './routes/index';
import User from './models/User';

// Load Env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security Middlewares
app.use(helmet());

// CORS configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: [clientUrl, 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request logger
app.use(morgan('dev'));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Mount API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

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
  
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 SatikFlow CRM API server is running on port ${PORT}`);
      console.log(`👉 Client origin allowed: ${clientUrl}`);
    });
  }
};

startServer();

export default app;
