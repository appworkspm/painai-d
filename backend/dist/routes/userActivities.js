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
router.get('/', auth_1.requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, userId, action, status, startDate, endDate } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (action) {
            where.action = action;
        }
        if (status) {
            where.status = status;
        }
        if (startDate && endDate) {
            where.createdAt = {};
        }
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
        const total = await prisma.activityLog.count({ where });
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
    }
    catch (error) {
        console.error('Error fetching user activities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user activities'
        });
    }
});
router.get('/user/:userId', auth_1.requireAdmin, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching user activities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user activities'
        });
    }
});
router.get('/stats', auth_1.requireAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        const actionStats = await prisma.activityLog.groupBy({
            by: ['action'],
            where,
            _count: {
                action: true
            }
        });
        const statusStats = await prisma.activityLog.groupBy({
            by: ['status'],
            where,
            _count: {
                status: true
            }
        });
        const totalActivities = await prisma.activityLog.count({ where });
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
    }
    catch (error) {
        console.error('Error fetching activity statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch activity statistics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=userActivities.js.map