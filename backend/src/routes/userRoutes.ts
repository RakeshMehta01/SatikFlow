import { Router } from 'express';
import { getUsers, createUser, updateUser, toggleUserStatus } from '../controllers/userController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Protect all routes and restrict to MANAGER
router.use(protect);
router.use(restrictTo('MANAGER'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/status', toggleUserStatus);

export default router;
