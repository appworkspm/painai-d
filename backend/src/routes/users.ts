import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// TODO: Implement user management endpoints
// For now, just a placeholder
router.get('/', requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'User management endpoints coming soon'
  });
});

export default router; 