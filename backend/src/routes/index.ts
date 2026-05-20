import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import leadRoutes from './leadRoutes';
import uploadRoutes from './uploadRoutes';
import activityRoutes from './activityRoutes';
import followUpRoutes from './followUpRoutes';
import dashboardRoutes from './dashboardRoutes';
import reportRoutes from './reportRoutes';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "SatikFlow CRM API is running"
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/uploads', uploadRoutes);
router.use('/activities', activityRoutes);
router.use('/follow-ups', followUpRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

export default router;
