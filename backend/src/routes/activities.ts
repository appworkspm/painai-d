import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/activities - รายการ activities (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const activities = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error });
  }
});

// GET /api/holidays - รายการวันหยุดทั้งหมด (admin only)
router.get('/holidays', requireAdmin, async (req, res) => {
  try {
    const holidays = await prisma.holiday.findMany({ orderBy: { date: 'asc' } });
    res.json({ success: true, data: holidays });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error });
  }
});

// POST /api/holidays - เพิ่มวันหยุดใหม่ (admin only)
router.post('/holidays', requireAdmin, async (req, res) => {
  try {
    const { date, name, nameEn, type, description } = req.body;
    const holiday = await prisma.holiday.create({
      data: { date: new Date(date), name, nameEn, type, description },
    });
    res.json({ success: true, data: holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error });
  }
});

// PUT /api/holidays/:id - แก้ไขวันหยุด (admin only)
router.put('/holidays/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, name, nameEn, type, description } = req.body;
    const holiday = await prisma.holiday.update({
      where: { id },
      data: { date: new Date(date), name, nameEn, type, description },
    });
    res.json({ success: true, data: holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error });
  }
});

// DELETE /api/holidays/:id - ลบวันหยุด (admin only)
router.delete('/holidays/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.holiday.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error });
  }
});

export default router; 