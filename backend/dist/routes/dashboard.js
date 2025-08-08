"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = require("../utils/database");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/projects/overview', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = { isDeleted: false };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const totalProjects = await database_1.prisma.project.count({ where });
        const activeProjects = await database_1.prisma.project.count({
            where: { ...where, status: 'ACTIVE' }
        });
        const completedProjects = await database_1.prisma.project.count({
            where: { ...where, status: 'COMPLETED' }
        });
        const onHoldProjects = await database_1.prisma.project.count({
            where: { ...where, status: 'ON_HOLD' }
        });
        const projectsByStatus = await database_1.prisma.project.groupBy({
            by: ['status'],
            where,
            _count: {
                status: true
            }
        });
        const recentProjects = await database_1.prisma.project.findMany({
            where,
            include: {
                manager: {
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
            take: 5
        });
        res.json({
            success: true,
            data: {
                totalProjects,
                activeProjects,
                completedProjects,
                onHoldProjects,
                projectsByStatus,
                recentProjects
            }
        });
    }
    catch (error) {
        console.error('Error fetching project overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project overview'
        });
    }
});
router.get('/projects/progress', async (req, res) => {
    try {
        const latestProgress = await database_1.prisma.projectProgress.findMany({
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        startDate: true,
                        endDate: true
                    }
                },
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                reportedAt: 'desc'
            }
        });
        const projectLatestProgress = latestProgress.reduce((acc, progress) => {
            if (!acc[progress.projectId]) {
                acc[progress.projectId] = progress;
            }
            return acc;
        }, {});
        const progressData = Object.values(projectLatestProgress);
        const onTrackCount = progressData.filter((p) => p.status === 'ON_TRACK').length;
        const behindCount = progressData.filter((p) => p.status === 'BEHIND').length;
        const aheadCount = progressData.filter((p) => p.status === 'AHEAD').length;
        const completedCount = progressData.filter((p) => p.status === 'COMPLETED').length;
        const totalProgress = progressData.reduce((sum, p) => sum + p.progress, 0);
        const averageProgress = progressData.length > 0 ? totalProgress / progressData.length : 0;
        res.json({
            success: true,
            data: {
                progressData,
                statistics: {
                    onTrackCount,
                    behindCount,
                    aheadCount,
                    completedCount,
                    averageProgress: Math.round(averageProgress)
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching project progress dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project progress dashboard'
        });
    }
});
router.get('/costs/overview', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        const totalCosts = await database_1.prisma.projectCost.findMany({ where });
        const totalAmount = totalCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
        const costsByProject = await database_1.prisma.projectCost.groupBy({
            by: ['projectId'],
            where,
            _sum: {
                amount: true
            },
            orderBy: {
                _sum: {
                    amount: 'desc'
                }
            },
            take: 10
        });
        const projectDetails = await database_1.prisma.project.findMany({
            where: {
                id: { in: costsByProject.map(c => c.projectId) }
            },
            select: {
                id: true,
                name: true
            }
        });
        const costsByCategory = costsByProject.map(cost => ({
            projectId: cost.projectId,
            projectName: projectDetails.find(p => p.id === cost.projectId)?.name || 'Unknown Project',
            totalAmount: cost._sum.amount || 0
        }));
        const pendingRequests = await database_1.prisma.costRequest.count({
            where: { status: 'PENDING' }
        });
        const approvedRequests = await database_1.prisma.costRequest.count({
            where: { status: 'APPROVED' }
        });
        const rejectedRequests = await database_1.prisma.costRequest.count({
            where: { status: 'REJECTED' }
        });
        const recentCostRequests = await database_1.prisma.costRequest.findMany({
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                requestedAt: 'desc'
            },
            take: 5
        });
        res.json({
            success: true,
            data: {
                totalAmount,
                totalCosts: totalCosts.length,
                costsByCategory,
                costRequests: {
                    pending: pendingRequests,
                    approved: approvedRequests,
                    rejected: rejectedRequests
                },
                recentCostRequests
            }
        });
    }
    catch (error) {
        console.error('Error fetching cost overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cost overview'
        });
    }
});
router.get('/timesheets/overview', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        const totalTimesheets = await database_1.prisma.timesheet.count({ where });
        const pendingTimesheets = await database_1.prisma.timesheet.count({
            where: { ...where, status: 'pending' }
        });
        const approvedTimesheets = await database_1.prisma.timesheet.count({
            where: { ...where, status: 'approved' }
        });
        const rejectedTimesheets = await database_1.prisma.timesheet.count({
            where: { ...where, status: 'rejected' }
        });
        const timesheets = await database_1.prisma.timesheet.findMany({ where });
        const totalHours = timesheets.reduce((sum, ts) => sum + Number(ts.hours_worked), 0);
        const totalOvertimeHours = timesheets.reduce((sum, ts) => sum + Number(ts.overtime_hours || 0), 0);
        const timesheetsByProject = await database_1.prisma.timesheet.groupBy({
            by: ['project_id'],
            where,
            _sum: {
                hours_worked: true,
                overtime_hours: true
            }
        });
        const recentTimesheets = await database_1.prisma.timesheet.findMany({
            where,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 5
        });
        res.json({
            success: true,
            data: {
                totalTimesheets,
                pendingTimesheets,
                approvedTimesheets,
                rejectedTimesheets,
                totalHours,
                totalOvertimeHours,
                timesheetsByProject,
                recentTimesheets
            }
        });
    }
    catch (error) {
        console.error('Error fetching timesheet overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch timesheet overview'
        });
    }
});
router.get('/activities/overview', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const totalActivities = await database_1.prisma.activityLog.count({ where });
        const activitiesByType = await database_1.prisma.activityLog.groupBy({
            by: ['type'],
            where,
            _count: {
                type: true
            }
        });
        const activitiesBySeverity = await database_1.prisma.activityLog.groupBy({
            by: ['severity'],
            where,
            _count: {
                severity: true
            }
        });
        const recentActivities = await database_1.prisma.activityLog.findMany({
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
            take: 10
        });
        res.json({
            success: true,
            data: {
                totalActivities,
                activitiesByType,
                activitiesBySeverity,
                recentActivities
            }
        });
    }
    catch (error) {
        console.error('Error fetching activity overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity overview'
        });
    }
});
router.get('/comprehensive', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const [projectOverview, progressData, costOverview, timesheetOverview, activityOverview] = await Promise.all([
            (async () => {
                const where = { isDeleted: false };
                if (startDate || endDate) {
                    where.createdAt = {};
                    if (startDate)
                        where.createdAt.gte = new Date(startDate);
                    if (endDate)
                        where.createdAt.lte = new Date(endDate);
                }
                const totalProjects = await database_1.prisma.project.count({ where });
                const activeProjects = await database_1.prisma.project.count({
                    where: { ...where, status: 'ACTIVE' }
                });
                return { totalProjects, activeProjects };
            })(),
            (async () => {
                const latestProgress = await database_1.prisma.projectProgress.findMany({
                    include: {
                        project: {
                            select: { id: true, name: true, status: true }
                        }
                    },
                    orderBy: { reportedAt: 'desc' }
                });
                const projectLatestProgress = latestProgress.reduce((acc, progress) => {
                    if (!acc[progress.projectId]) {
                        acc[progress.projectId] = progress;
                    }
                    return acc;
                }, {});
                return Object.values(projectLatestProgress);
            })(),
            (async () => {
                const where = {};
                if (startDate || endDate) {
                    where.date = {};
                    if (startDate)
                        where.date.gte = new Date(startDate);
                    if (endDate)
                        where.date.lte = new Date(endDate);
                }
                const totalCosts = await database_1.prisma.projectCost.findMany({ where });
                const totalAmount = totalCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
                const pendingRequests = await database_1.prisma.costRequest.count({
                    where: { status: 'PENDING' }
                });
                return { totalAmount, totalCosts: totalCosts.length, pendingRequests };
            })(),
            (async () => {
                const where = {};
                if (startDate || endDate) {
                    where.date = {};
                    if (startDate)
                        where.date.gte = new Date(startDate);
                    if (endDate)
                        where.date.lte = new Date(endDate);
                }
                const totalTimesheets = await database_1.prisma.timesheet.count({ where });
                const pendingTimesheets = await database_1.prisma.timesheet.count({
                    where: { ...where, status: 'pending' }
                });
                const timesheets = await database_1.prisma.timesheet.findMany({ where });
                const totalHours = timesheets.reduce((sum, ts) => sum + Number(ts.hours_worked), 0);
                return { totalTimesheets, pendingTimesheets, totalHours };
            })(),
            (async () => {
                const where = {};
                if (startDate || endDate) {
                    where.createdAt = {};
                    if (startDate)
                        where.createdAt.gte = new Date(startDate);
                    if (endDate)
                        where.createdAt.lte = new Date(endDate);
                }
                const totalActivities = await database_1.prisma.activityLog.count({ where });
                return { totalActivities };
            })()
        ]);
        res.json({
            success: true,
            data: {
                projects: projectOverview,
                progress: progressData,
                costs: costOverview,
                timesheets: timesheetOverview,
                activities: activityOverview
            }
        });
    }
    catch (error) {
        console.error('Error fetching comprehensive dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comprehensive dashboard'
        });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map