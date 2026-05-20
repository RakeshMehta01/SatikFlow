import { Router } from 'express';
import { getFollowUps, getMyFollowUps } from '../controllers/followUpController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.get('/', getFollowUps);
router.get('/my', getMyFollowUps);

export default router;
