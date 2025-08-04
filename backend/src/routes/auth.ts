import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  validateRegister, 
  validateLogin, 
  updateProfile, 
  forgotPassword,
  refreshToken 
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);

export default router; 