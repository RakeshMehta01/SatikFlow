import { Router } from 'express';
import { parseFile, importLeads, getUploadHistory, uploadMiddleware } from '../controllers/uploadController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

router.use(protect);
router.use(restrictTo('MANAGER'));

router.post('/parse', uploadMiddleware, parseFile);
router.post('/import', importLeads);
router.get('/', getUploadHistory);

export default router;
