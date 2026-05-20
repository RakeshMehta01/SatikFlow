import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/satikflow-crm';
  
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('Please ensure MongoDB is running locally or check your MONGO_URI in backend/.env');
    // Don't crash in development, but print warning
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
