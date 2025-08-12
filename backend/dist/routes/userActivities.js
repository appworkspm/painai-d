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
        const total = await prisma.activityLog.count({ where });
        const transformedActivities = activities.map(activity => ({
            id: activity.id,
            userId: activity.userId,
            userName: activity.user?.name || 'Unknown User',
            userEmail: activity.user?.email || 'unknown@example.com',
            type: activity.type,
            message: activity.message,
            severity: activity.severity,
            createdAt: activity.createdAt.toISOString()
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
            type: activity.type,
            message: activity.message,
            severity: activity.severity,
            createdAt: activity.createdAt.toISOString()
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
        const typeStats = await prisma.activityLog.groupBy({
            by: ['type'],
            where,
            _count: {
                type: true
            }
        });
        const severityStats = await prisma.activityLog.groupBy({
            by: ['severity'],
            where,
            _count: {
                severity: true
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
                typeStats: typeStats.map(stat => ({
                    type: stat.type,
                    count: stat._count.type
                })),
                severityStats: severityStats.map(stat => ({
                    severity: stat.severity,
                    count: stat._count.severity
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