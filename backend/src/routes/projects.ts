import { Router } from 'express';
import { authenticate, requireManager } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// TODO: Implement project management endpoints
// For now, just a placeholder
router.get('/', requireManager, (req, res) => {
  res.json({
    success: true,
    message: 'Project management endpoints coming soon'
  });
});

export default router; 