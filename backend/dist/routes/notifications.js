"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const pendingTimesheets = await prisma.timesheet.findMany({
            where: {
                userId: userId,
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
        const pendingCostRequests = await prisma.costRequest.findMany({
            where: {
                requesterId: userId,
                userId: userId,
                status: 'pending'
            },
            select: {
                id: true,
                title: true,
                amount: true,
                createdAt: true
            }
        });
        const notifications = [];
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
        notifications.push({
            id: 'system-update',
            type: 'info',
            title: 'อัปเดตระบบ',
            message: 'ระบบได้รับการอัปเดตใหม่แล้ว',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            read: false,
            priority: 'low',
            category: 'system',
            actionUrl: '/settings'
        });
        res.json(notifications);
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
router.patch('/:id/read', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        res.json({ success: true, message: 'Notification marked as read' });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});
router.patch('/read-all', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        res.json({ success: true, message: 'Notification deleted' });
    }
    catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map