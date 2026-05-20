import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  assignLead,
  bulkAssignLeads,
  getMyLeads
} from '../controllers/leadController';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// General protect
router.use(protect);

// Agent specific leads fetch
router.get('/agent/my-leads', restrictTo('AGENT'), getMyLeads);

// Bulk assignment (must go before /:id)
router.patch('/bulk-assign', restrictTo('MANAGER'), bulkAssignLeads);

// Basic CRUD
router.get('/', getLeads);
router.post('/', createLead);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);

// Manager specific assignment
router.patch('/:id/assign', restrictTo('MANAGER'), assignLead);

export default router;
