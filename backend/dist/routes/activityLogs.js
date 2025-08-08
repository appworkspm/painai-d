"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const cacheService_1 = require("../services/cacheService");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get('/activity-logs', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const startTime = Date.now();
    const { page = '1', limit = '20', userId, type, severity, startDate, endDate } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const cacheKey = `${(0, cacheService_1.getActivitiesKey)('all')}:${pageNum}:${limitNum}:${userId || ''}:${type || ''}:${severity || ''}:${startDate || ''}:${endDate || ''}`;
    try {
        const [logs, total] = await Promise.all([
            (0, cacheService_1.getOrSet)(cacheKey, async () => {
                console.time('activity_logs_query');
                const result = await prisma.activityLog.findMany({
                    where: {
                        userId: userId ? String(userId) : undefined,
                        type: type ? String(type) : undefined,
                        severity: severity ? String(severity) : undefined,
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
            prisma.activityLog.count({
                where: {
                    userId: userId ? String(userId) : undefined,
                    type: type ? String(type) : undefined,
                    severity: severity ? String(severity) : undefined,
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
                cached: Date.now() - startTime < 500,
            },
        });
    }
    catch (error) {
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
router.get('/activity-logs/types', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const startTime = Date.now();
    const cacheKey = 'activity_log_types';
    try {
        const types = await (0, cacheService_1.getOrSet)(cacheKey, async () => {
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
                cached: Date.now() - startTime < 100,
            },
        });
    }
    catch (error) {
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
exports.default = router;
//# sourceMappingURL=activityLogs.js.map