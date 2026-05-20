import { Router } from 'express';
import { getManagerReports, getAgentReports } from '../controllers/reportController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.get('/manager', restrictTo('MANAGER'), getManagerReports);
router.get('/agent', restrictTo('AGENT'), getAgentReports);

export default router;
