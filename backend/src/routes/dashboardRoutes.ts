import { Router } from 'express';
import { getManagerDashboard, getAgentDashboard } from '../controllers/dashboardController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.get('/manager', restrictTo('MANAGER'), getManagerDashboard);
router.get('/agent', restrictTo('AGENT'), getAgentDashboard);

export default router;
