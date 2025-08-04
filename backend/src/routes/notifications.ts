import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, IAuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware: require authentication for all routes
router.use(authenticate);

// Get notifications for the current user
router.get('/', async (req: IAuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user's timesheets that need attention
    const pendingTimesheets = await prisma.timesheet.findMany({
      where: {
        user_id: userId,
        status: 'submitted'
      },
      select: {
        id: true,
        date: true,
        activity: true,
        project: {
          select: {
            name: true
          }
        }
      }
    });

    // Get cost requests that need attention
    const pendingCostRequests = await prisma.costRequest.findMany({
      where: {
        requester_id: userId,
        user_id: userId,
        status: 'pending'
      },
      select: {
        id: true,
        title: true,
        amount: true,
        created_at: true
      }
    });

    // Generate notifications based on data
    const notifications = [];

    // Timesheet notifications
    if (pendingTimesheets.length > 0) {
      notifications.push({
        id: 'timesheet-pending',
        type: 'warning',
        title: 'ไทม์ชีทรออนุมัติ',
        message: `คุณมีไทม์ชีท ${pendingTimesheets.length} รายการที่รอการอนุมัติ`,
        timestamp: new Date(),
        read: false,
        priority: 'high',
        category: 'timesheet',
        actionUrl: '/timesheets/pending'
      });
    }

    // Cost request notifications
    if (pendingCostRequests.length > 0) {
      notifications.push({
        id: 'cost-pending',
        type: 'info',
        title: 'คำขอต้นทุนรอการอนุมัติ',
        message: `คุณมีคำขอต้นทุน ${pendingCostRequests.length} รายการที่รอการอนุมัติ`,
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        category: 'cost',
        actionUrl: '/cost-requests'
      });
    }

    // System notifications (example)
    notifications.push({
      id: 'system-update',
      type: 'info',
      title: 'อัปเดตระบบ',
      message: 'ระบบได้รับการอัปเดตใหม่แล้ว',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: false,
      priority: 'low',
      category: 'system',
      actionUrl: '/settings'
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req: IAuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // TODO: Implement actual notification marking as read
    // For now, just return success
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req: IAuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // TODO: Implement actual marking all notifications as read
    // For now, just return success
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', async (req: IAuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // TODO: Implement actual notification deletion
    // For now, just return success
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router; 