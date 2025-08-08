"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = require("../utils/database");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    try {
        const { projectId, category, startDate, endDate } = req.query;
        const where = {};
        if (projectId)
            where.projectId = projectId;
        if (category)
            where.category = category;
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        const projectCosts = await database_1.prisma.projectCost.findMany({
            where,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                costRequest: {
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        res.json({
            success: true,
            data: projectCosts
        });
    }
    catch (error) {
        console.error('Error fetching project costs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project costs'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const projectCost = await database_1.prisma.projectCost.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                costRequest: {
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                }
            }
        });
        if (!projectCost) {
            res.status(404).json({
                success: false,
                message: 'Project cost not found'
            });
            return;
        }
        res.json({
            success: true,
            data: projectCost
        });
    }
    catch (error) {
        console.error('Error fetching project cost:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project cost'
        });
    }
});
router.post('/', auth_1.requireManager, async (req, res) => {
    try {
        const { projectId, description, amount, date, costRequestId } = req.body;
        const recordedBy = req.user?.id;
        if (!projectId || !amount) {
            res.status(400).json({
                success: false,
                message: 'Project ID and amount are required'
            });
            return;
        }
        if (amount <= 0) {
            res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
            return;
        }
        if (costRequestId) {
            const costRequest = await database_1.prisma.costRequest.findUnique({
                where: { id: costRequestId }
            });
            if (!costRequest) {
                res.status(400).json({
                    success: false,
                    message: 'Cost request not found'
                });
                return;
            }
            if (costRequest.status !== 'APPROVED') {
                res.status(400).json({
                    success: false,
                    message: 'Can only record costs for approved cost requests'
                });
                return;
            }
        }
        const projectCost = await database_1.prisma.projectCost.create({
            data: {
                projectId,
                description,
                amount: parseFloat(amount),
                date: date ? new Date(date) : new Date(),
                costRequestId
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                costRequest: {
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: projectCost
        });
    }
    catch (error) {
        console.error('Error creating project cost:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create project cost'
        });
    }
});
router.put('/:id', auth_1.requireManager, async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount, date } = req.body;
        const updateData = {};
        if (description !== undefined)
            updateData.description = description;
        if (amount !== undefined) {
            if (amount <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Amount must be greater than 0'
                });
                return;
            }
            updateData.amount = parseFloat(amount);
        }
        if (date)
            updateData.date = new Date(date);
        const projectCost = await database_1.prisma.projectCost.update({
            where: { id },
            data: updateData,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                costRequest: {
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: projectCost
        });
    }
    catch (error) {
        console.error('Error updating project cost:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project cost'
        });
    }
});
router.delete('/:id', auth_1.requireManager, async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.prisma.projectCost.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Project cost deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting project cost:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project cost'
        });
    }
});
router.get('/summary/project/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { startDate, endDate } = req.query;
        const where = { projectId };
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        const costs = await database_1.prisma.projectCost.findMany({
            where,
            select: {
                id: true,
                amount: true,
                description: true,
                date: true,
                projectId: true
            }
        });
        const totalAmount = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);
        const projectIds = [...new Set(costs.map(cost => cost.projectId))];
        const projects = await database_1.prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, name: true }
        });
        const projectSummary = costs.reduce((acc, cost) => {
            const project = projects.find(p => p.id === cost.projectId);
            const projectName = project?.name || 'Unknown Project';
            acc[projectName] = (acc[projectName] || 0) + Number(cost.amount);
            return acc;
        }, {});
        res.json({
            success: true,
            data: {
                totalAmount,
                projectSummary,
                count: costs.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching cost summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cost summary'
        });
    }
});
exports.default = router;
//# sourceMappingURL=projectCosts.js.map