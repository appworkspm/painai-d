import { Router } from 'express';
import { requireAuth, requireManager } from '../middleware/auth';
import {
  createTimesheet,
  getMyTimesheets,
  getPendingTimesheets,
  updateTimesheet,
  deleteTimesheet,
  submitTimesheet,
  approveTimesheet,
  getAllTimesheets,
  getTimesheetHistory,
} from '../controllers/timesheetController';

const router = Router();

// Timesheet CRUD routes
router.get('/my', requireAuth, getMyTimesheets);
router.get('/pending', requireAuth, getPendingTimesheets);
router.get('/', requireAuth, requireManager, getAllTimesheets);
router.post('/', requireAuth, createTimesheet);
router.put('/:id', requireAuth, updateTimesheet);
router.delete('/:id', requireAuth, deleteTimesheet);
router.get('/:id/history', requireAuth, getTimesheetHistory);

// Timesheet workflow routes
router.patch('/:id/submit', requireAuth, submitTimesheet);
router.patch('/:id/approve', requireAuth, approveTimesheet);

export default router; 