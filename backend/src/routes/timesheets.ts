import { Router } from 'express';
import {
  createTimesheet,
  getTimesheets,
  getTimesheetById,
  updateTimesheet,
  deleteTimesheet,
  validateCreateTimesheet,
  validateUpdateTimesheet
} from '../controllers/timesheetController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', validateCreateTimesheet, createTimesheet);
router.get('/', getTimesheets);
router.get('/:id', getTimesheetById);
router.put('/:id', validateUpdateTimesheet, updateTimesheet);
router.delete('/:id', deleteTimesheet);

export default router; 