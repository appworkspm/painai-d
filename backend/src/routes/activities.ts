import express, { Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth';
import { z } from 'zod';
import { prisma } from '../prismaClient';

const router = express.Router();

// --- Async handler wrapper ---
function asyncHandler(fn: any) {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error(err);
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error: err });
    });
  };
}

// --- Zod schema for holiday validation ---
const holidaySchema = z.object({
  date: z.string().min(1),
  name: z.string().min(1),
  nameEn: z.string().optional(),
  type: z.string().min(1),
  description: z.string().optional(),
});

// Activities (admin only) with pagination
router.get('/', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 50;
  const skip = (page - 1) * pageSize;
  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    skip,
    take: pageSize,
    include: { user: { select: { id: true, name: true, email: true } } }
  });
  res.json({ success: true, data: activities });
}));

// Holiday Management (admin only)
router.get('/holidays', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const holidays = await prisma.holiday.findMany({
    orderBy: { date: 'asc' },
    select: { id: true, date: true, name: true, nameEn: true, type: true, description: true }
  });
  res.json({ success: true, data: holidays });
}));

router.post('/holidays', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const parse = holidaySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, message: 'Invalid input', errors: parse.error.issues });
    return;
  }
  const { date, name, nameEn, type, description } = parse.data;
  const holiday = await prisma.holiday.create({
    data: {
      date: new Date(date),
      name,
      nameEn: nameEn ?? '',
      type,
      description: description ?? ''
    },
  });
  res.json({ success: true, data: holiday });
}));

router.put('/holidays/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const parse = holidaySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, message: 'Invalid input', errors: parse.error.issues });
    return;
  }
  const { id } = req.params;
  const { date, name, nameEn, type, description } = parse.data;
  const holiday = await prisma.holiday.update({
    where: { id },
    data: {
      date: new Date(date),
      name,
      nameEn: nameEn ?? '',
      type,
      description: description ?? ''
    },
  });
  res.json({ success: true, data: holiday });
}));

router.delete('/holidays/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.holiday.delete({ where: { id } });
  res.json({ success: true });
}));

export default router;