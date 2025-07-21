import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import { getOrSet, getActivitiesKey, invalidateCache } from '../services/cacheService';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route GET /activity-logs
 * @description Get activity logs with pagination and filtering
 * @queryParam page - Page number (default: 1)
 * @queryParam limit - Items per page (default: 20, max: 100)
 * @queryParam userId - Filter by user ID
 * @queryParam type - Filter by activity type
 * @queryParam severity - Filter by log severity (info, warn, error)
 * @queryParam startDate - Filter logs after this date (ISO string)
 * @queryParam endDate - Filter logs before this date (ISO string)
 * @middleware authenticate, requireAdmin
 * @cached 1 minute
 */
router.get('/activity-logs', authenticate, requireAdmin, async (req, res) => {
  const startTime = Date.now();
  const { 
    page = '1', 
    limit = '20', 
    userId, 
    type, 
    severity, 
    startDate, 
    endDate 
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Create a unique cache key based on the request parameters
  const cacheKey = `${getActivitiesKey('all')}:${pageNum}:${limitNum}:${userId || ''}:${type || ''}:${severity || ''}:${startDate || ''}:${endDate || ''}`;

  try {
    const [logs, total] = await Promise.all([
      // Get paginated logs
      getOrSet(cacheKey, async () => {
        console.time('activity_logs_query');
        const result = await prisma.activityLog.findMany({
          where: {
            userId: userId ? String(userId) : undefined,
            type: type ? String(type) : undefined,
            severity: severity ? String(severity) as 'info' | 'warn' | 'error' : undefined,
            createdAt: {
              gte: startDate ? new Date(String(startDate)) : undefined,
              lte: endDate ? new Date(String(endDate)) : undefined,
            },
          },
          select: {
            id: true,
            type: true,
            message: true,
            severity: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        });
        console.timeEnd('activity_logs_query');
        return result;
      }),
      
      // Get total count (not cached as it's fast enough with proper indexing)
      prisma.activityLog.count({
        where: {
          userId: userId ? String(userId) : undefined,
          type: type ? String(type) : undefined,
          severity: severity ? String(severity) as 'info' | 'warn' | 'error' : undefined,
          createdAt: {
            gte: startDate ? new Date(String(startDate)) : undefined,
            lte: endDate ? new Date(String(endDate)) : undefined,
          },
        },
      }),
    ]);

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] GET /activity-logs completed in ${duration}ms`);
    
    res.json({
      success: true,
      data: logs,
      meta: {
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
        cached: Date.now() - startTime < 500, // If response was very fast, it's likely from cache
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching activity logs:', error);
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] GET /activity-logs failed after ${duration}ms`);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

/**
 * @route GET /activity-logs/types
 * @description Get distinct activity log types
 * @middleware authenticate, requireAdmin
 * @cached 5 minutes
 */
router.get('/activity-logs/types', authenticate, requireAdmin, async (req, res) => {
  const startTime = Date.now();
  const cacheKey = 'activity_log_types';
  
  try {
    const types = await getOrSet(cacheKey, async () => {
      console.time('activity_log_types_query');
      const result = await prisma.activityLog.groupBy({
        by: ['type'],
        _count: {
          type: true,
        },
        orderBy: {
          _count: {
            type: 'desc',
          },
        },
      });
      console.timeEnd('activity_log_types_query');
      return result.map(item => item.type);
    });
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] GET /activity-logs/types completed in ${duration}ms`);
    
    res.json({
      success: true,
      data: types,
      meta: {
        count: types.length,
        cached: Date.now() - startTime < 100, // If response was very fast, it's likely from cache
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching activity log types:', error);
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] GET /activity-logs/types failed after ${duration}ms`);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity log types',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

export default router;
