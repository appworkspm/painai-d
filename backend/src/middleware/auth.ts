import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import { prisma } from '../utils/database';
import { IAuthenticatedRequest, IUser } from '../types';
export type { IAuthenticatedRequest };

export const authenticate = async (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
      return;
    }

    req.user = user as IUser;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const requireRole = (requiredRole: string) => {
  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const userRole = req.user.role;
    const hasAccess = 
      userRole === 'VP' ? true :
      requiredRole === 'ADMIN' ? userRole === 'ADMIN' :
      requiredRole === 'MANAGER' ? ['ADMIN', 'MANAGER'].includes(userRole) :
      true; // USER role can access everything

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN');
export const requireManager = requireRole('MANAGER');
export const requireUser = requireRole('USER');

// Alias for backward compatibility
export const requireAuth = authenticate; 