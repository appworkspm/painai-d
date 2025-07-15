import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all holidays
router.get('/holidays', authenticate, requireAdmin, async (req, res) => {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' }
    });
    
    res.json({
      success: true,
      data: holidays
    });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays'
    });
  }
});

// Create new holiday
router.post('/holidays', authenticate, requireAdmin, async (req, res) => {
  try {
    const { date, name, nameEn, type, description } = req.body;
    
    const holiday = await prisma.holiday.create({
      data: {
        date: new Date(date),
        name,
        nameEn,
        type,
        description: description || null
      }
    });
    
    res.json({
      success: true,
      data: holiday
    });
  } catch (error) {
    console.error('Error creating holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create holiday'
    });
  }
});

// Update holiday
router.put('/holidays/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, name, nameEn, type, description } = req.body;
    
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
    
    res.json({
      success: true,
      data: holiday
    });
  } catch (error) {
    console.error('Error updating holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update holiday'
    });
  }
});

// Delete holiday
router.delete('/holidays/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.holiday.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete holiday'
    });
  }
});

export default router; 