import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import { getOrSet, getHolidaysKey, invalidateCache } from '../services/cacheService';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route GET /holidays
 * @description Get all holidays with caching
 * @middleware authenticate, requireAdmin
 * @cached 5 minutes
 * @indexes Ensure you have the following database indexes for optimal performance:
 * - CREATE INDEX idx_holidays_date ON public."Holiday" (date);
 */
router.get('/holidays', authenticate, requireAdmin, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const holidays = await getOrSet(getHolidaysKey, async () => {
      console.time('holidays_query');
      const result = await prisma.holiday.findMany({
        select: {
          id: true,
          date: true,
          name: true,
          nameEn: true,
          type: true,
          description: true
        },
        orderBy: { date: 'asc' }
      });
      console.timeEnd('holidays_query');
      return result;
    });
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] GET /holidays completed in ${duration}ms`);
    
    res.json({
      success: true,
      data: holidays,
      meta: {
        count: holidays.length,
        cached: Date.now() - startTime < 1000 // If response was very fast, it's likely from cache
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching holidays:', error);
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] GET /holidays failed after ${duration}ms`);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * @route POST /holidays
 * @description Create a new holiday
 * @middleware authenticate, requireAdmin
 */
router.post('/holidays', authenticate, requireAdmin, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { date, name, nameEn, type, description } = req.body;
    
    console.time('create_holiday');
    const holiday = await prisma.holiday.create({
      data: {
        date: new Date(date),
        name,
        nameEn,
        type,
        description: description || null
      }
    });
    console.timeEnd('create_holiday');
    
    // Invalidate the cache to ensure fresh data on next request
    invalidateCache(getHolidaysKey);
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] POST /holidays completed in ${duration}ms`);
    
    res.status(201).json({
      success: true,
      data: holiday
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error creating holiday:', error);
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] POST /holidays failed after ${duration}ms`);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create holiday',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * @route PUT /holidays/:id
 * @description Update a holiday
 * @middleware authenticate, requireAdmin
 */
router.put('/holidays/:id', authenticate, requireAdmin, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { date, name, nameEn, type, description } = req.body;
    
    console.time('update_holiday');
    const holiday = await prisma.holiday.update({
      where: { id },
      data: {
        date: new Date(date),
        name,
        nameEn,
        type,
        description: description || null
      }
    });
    console.timeEnd('update_holiday');
    
    // Invalidate the cache to ensure fresh data on next request
    invalidateCache(getHolidaysKey);
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] PUT /holidays/${id} completed in ${duration}ms`);
    
    res.json({
      success: true,
      data: holiday
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error updating holiday:', error);
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] PUT /holidays/${req.params.id} failed after ${duration}ms`);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update holiday',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * @route DELETE /holidays/:id
 * @description Delete a holiday
 * @middleware authenticate, requireAdmin
 */
router.delete('/holidays/:id', authenticate, requireAdmin, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    
    console.time('delete_holiday');
    await prisma.holiday.delete({
      where: { id }
    });
    console.timeEnd('delete_holiday');
    
    // Invalidate the cache to ensure fresh data on next request
    invalidateCache(getHolidaysKey);
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] DELETE /holidays/${id} completed in ${duration}ms`);
    
    res.json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error deleting holiday:', error);
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] DELETE /holidays/${req.params.id} failed after ${duration}ms`);
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete holiday',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

export default router;