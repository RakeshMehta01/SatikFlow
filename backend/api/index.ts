import 'dotenv/config';
import app from '../src/app';
import { connectDB } from '../src/config/db';

let isConnected = false;

export default async function handler(req: any, res: any) {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
    
    return app(req, res);
  } catch (error: any) {
    console.error('Vercel API Handler Error:', error);
    res.status(500).json({
      error: 'Backend Database Connection Failed',
      message: error?.message || 'Unknown error occurred during connection',
      timestamp: new Date().toISOString()
    });
  }
}
