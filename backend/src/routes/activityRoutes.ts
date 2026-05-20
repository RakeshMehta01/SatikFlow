import { Router } from 'express';
import { createActivity, getActivitiesByLead } from '../controllers/activityController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.post('/', createActivity);
router.get('/lead/:leadId', getActivitiesByLead);

export default router;
