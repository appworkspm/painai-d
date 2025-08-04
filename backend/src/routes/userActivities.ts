import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, IAuthenticatedRequest, requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware: require authentication for all routes
router.use(authenticate);

// Get user activities (admin only)
router.get('/', requireAdmin, async (req: IAuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 50, userId, action, status, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    
    if (userId) {
      where.userId = userId as string;
    }
    
    if (action) {
      where.action = action as string;
    }
    
    if (status) {
      where.status = status as string;
    }
    
    if (startDate && endDate) {
      where.createdAt = {
      };
    }

    // Get activities from activity logs
    const activities = await prisma.activityLog.findMany({
      where,
      select: {
        id: true,
        userId: true,
        action: true,
        description: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        status: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: Number(limit)
    });

    // Get total count
    const total = await prisma.activityLog.count({ where });

    // Transform data for frontend
    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      userId: activity.userId,
      userName: activity.user?.name || 'Unknown User',
      userEmail: activity.user?.email || 'unknown@example.com',
      action: activity.action,
      description: activity.description,
      ipAddress: activity.ipAddress || 'N/A',
      userAgent: activity.userAgent || 'N/A',
      createdAt: activity.createdAt.toISOString(),
      status: activity.status || 'SUCCESS'
    }));

    res.json({
      success: true,
      data: transformedActivities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user activities' 
    });
  }
});

// Get activities for specific user
router.get('/user/:userId', requireAdmin, async (req: IAuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const activities = await prisma.activityLog.findMany({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: Number(limit)
    });

    const total = await prisma.activityLog.count({
      where: { userId: userId }
    });

    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      userId: activity.userId,
      userName: activity.user?.name || 'Unknown User',
      userEmail: activity.user?.email || 'unknown@example.com',
      action: activity.action,
      description: activity.description,
      ipAddress: activity.ipAddress || 'N/A',
      userAgent: activity.userAgent || 'N/A',
      createdAt: activity.createdAt.toISOString(),
      status: activity.status || 'SUCCESS'
    }));

    res.json({
      success: true,
      data: transformedActivities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user activities' 
    });
  }
});

// Get activity statistics
router.get('/stats', requireAdmin, async (req: IAuthenticatedRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    // Get activity counts by action
    const actionStats = await prisma.activityLog.groupBy({
      by: ['action'],
      where,
      _count: {
        action: true
      }
    });

    // Get activity counts by status
    const statusStats = await prisma.activityLog.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true
      }
    });

    // Get total activities
    const totalActivities = await prisma.activityLog.count({ where });

    // Get unique users
    const uniqueUsers = await prisma.activityLog.groupBy({
      by: ['userId'],
      where,
      _count: {
        userId: true
      }
    });

    res.json({
      success: true,
      data: {
        totalActivities,
        uniqueUsers: uniqueUsers.length,
        actionStats: actionStats.map(stat => ({
          action: stat.action,
          count: stat._count.action
        })),
        statusStats: statusStats.map(stat => ({
          status: stat.status,
          count: stat._count.status
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch activity statistics' 
    });
  }
});

export default router; 