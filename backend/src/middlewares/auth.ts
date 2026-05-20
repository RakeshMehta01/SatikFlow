import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = '';
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'satikflow_crm_super_secret_session_key_12345') as { id: string };
    
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      res.status(401).json({ message: 'Not authorized, user not found' });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({ message: 'User account is inactive. Please contact manager.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const restrictTo = (...roles: ('MANAGER' | 'AGENT')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
      return;
    }
    next();
  };
};
