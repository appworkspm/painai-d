import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/database';
import { hashPassword, comparePassword, generateTokenPair } from '../utils/auth';
import { ICreateUser, ILoginRequest, IAuthResponse } from '../types';
import crypto from 'crypto';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password, name, role }: ICreateUser = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'USER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Generate token pair
    const { accessToken, refreshToken, expiresIn } = generateTokenPair(user);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken,
        expiresIn
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password }: ILoginRequest = req.body;
    console.log('Login attempt:', { email });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    console.log('User found:', user);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate token pair
    const { accessToken, refreshToken, expiresIn } = generateTokenPair(user);
    console.log('Token pair generated:', { accessToken, refreshToken, expiresIn });

    // Store refresh token in database
    try {
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      });
    } catch (err) {
      console.error('Error creating refresh token:', err);
      throw err;
    }

    // Update last login time
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
    } catch (err) {
      console.error('Error updating last login:', err);
      throw err;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        accessToken,
        refreshToken,
        expiresIn
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is already authenticated via middleware
    const user = (req as any).user;

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { name, currentPassword, newPassword } = req.body;
    
    const updateData: any = {};
    
    // Update name if provided
    if (name) {
      updateData.name = name;
    }
    
    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ 
          success: false, 
          message: 'Current password is required to change password' 
        });
        return;
      }
      
      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
        return;
      }
      
      // Hash new password
      updateData.password = await hashPassword(newPassword);
    }
    
    if (!name && !newPassword) {
      res.status(400).json({ 
        success: false, 
        message: 'No data to update' 
      });
      return;
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        isActive: true, 
        createdAt: true, 
        updatedAt: true
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      data: updatedUser 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Refresh token request received:', req.body);
    
    const { refreshToken } = req.body;

    if (!refreshToken) {
      console.log('No refresh token provided');
      res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }

    console.log('Looking up refresh token in database...');
    // Verify the refresh token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    console.log('Stored token found:', !!storedToken);
    
    // Check if token exists and is not expired
    const now = new Date();
    const isTokenExpired = storedToken && storedToken.expiresAt < now;
    
    if (!storedToken || storedToken.revoked || isTokenExpired) {
      console.log('Invalid or expired token. Revoked:', storedToken?.revoked, 'Expired:', isTokenExpired);
      
      // If token is invalid, clean it up
      if (storedToken) {
        await prisma.refreshToken.delete({
          where: { id: storedToken.id }
        });
      }
      
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
      return;
    }

    // Check if user still exists and is active
    if (!storedToken.user || !storedToken.user.isActive) {
      console.log('User not found or inactive');
      
      // Clean up all user's refresh tokens if user is no longer active
      await prisma.refreshToken.deleteMany({
        where: { userId: storedToken.userId }
      });
      
      res.status(401).json({
        success: false,
        message: 'User account is no longer active',
        code: 'USER_INACTIVE'
      });
      return;
    }

    console.log('Generating new token pair...');
    // Generate new token pair
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } = 
      generateTokenPair(storedToken.user);

    console.log('Deleting old refresh token...');
    // Delete the used refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id }
    });

    console.log('Creating new refresh token...');
    // Store the new refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        revoked: false
      }
    });

    console.log('Tokens refreshed successfully');
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn
      }
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // For security reasons, don't reveal if email exists or not
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
      return;
    }

    // Generate reset token (in production, use a proper JWT or crypto library)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token in database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // In production, send email here
    // For now, just return success message
    console.log(`Password reset link for ${email}: http://localhost:3000/reset-password?token=${resetToken}`);

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Validation middleware
export const validateRegister = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(['ADMIN', 'MANAGER', 'USER']).withMessage('Invalid role')
];

export const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
]; 