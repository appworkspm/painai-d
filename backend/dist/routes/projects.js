"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = require("../utils/database");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    try {
        const projects = await database_1.prisma.project.findMany({
            include: {
                manager: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: projects });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await database_1.prisma.project.findUnique({
            where: { id },
            include: {
                manager: { select: { id: true, name: true, email: true } }
            }
        });
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        res.json({ success: true, data: project });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch project' });
    }
});
router.post('/', auth_1.requireManager, async (req, res) => {
    try {
        const { name, description, status, managerId, jobCode, customerName, paymentTerm, paymentCondition, startDate, endDate, budget } = req.body;
        if (!name || !description || !status || !managerId) {
            res.status(400).json({ success: false, message: 'Name, description, status, and manager are required' });
            return;
        }
        const project = await database_1.prisma.project.create({
            data: {
                name,
                description,
                status,
                managerId,
                jobCode,
                customerName,
                paymentTerm,
                paymentCondition,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                budget: budget ? parseFloat(budget) : null
            },
            include: {
                manager: { select: { id: true, name: true, email: true } }
            }
        });
        res.status(201).json({ success: true, data: project });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create project' });
    }
});
router.put('/:id', auth_1.requireManager, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status, managerId, jobCode, customerName, paymentTerm, paymentCondition, startDate, endDate, budget } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        if (status)
            updateData.status = status;
        if (managerId)
            updateData.managerId = managerId;
        if (jobCode !== undefined)
            updateData.jobCode = jobCode;
        if (customerName !== undefined)
            updateData.customerName = customerName;
        if (paymentTerm !== undefined)
            updateData.paymentTerm = paymentTerm;
        if (paymentCondition !== undefined)
            updateData.paymentCondition = paymentCondition;
        if (startDate)
            updateData.startDate = new Date(startDate);
        if (endDate)
            updateData.endDate = new Date(endDate);
        if (budget !== undefined)
            updateData.budget = parseFloat(budget);
        const project = await database_1.prisma.project.update({
            where: { id },
            data: updateData,
            include: {
                manager: { select: { id: true, name: true, email: true } }
            }
        });
        res.json({ success: true, data: project });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update project' });
    }
});
router.delete('/:id', auth_1.requireManager, async (req, res) => {
    try {
        const { id } = req.params;
        const project = await database_1.prisma.project.findUnique({ where: { id } });
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        await database_1.prisma.project.delete({ where: { id } });
        res.json({ success: true, message: 'Project deleted successfully' });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete project' });
    }
});
exports.default = router;
router.get('/:id/s-curve', async (req, res) => {
    try {
        const { id } = req.params;
        const progress = await database_1.prisma.projectProgress.findMany({
            where: { projectId: id },
            orderBy: [{ reportedAt: 'asc' }]
        });
        res.json({ success: true, data: progress });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch S Curve data' });
    }
});
router.get('/:id/cost-breakdown', async (req, res) => {
    try {
        const { id } = req.params;
        const costs = await database_1.prisma.projectCost.findMany({
            where: { projectId: id },
            orderBy: { date: 'asc' }
        });
        const totalCost = costs.reduce((sum, c) => sum + Number(c.amount), 0);
        res.json({ success: true, totalCost, breakdown: costs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch cost breakdown' });
    }
});
router.get('/:id/progress-summary', async (req, res) => {
    try {
        const { id } = req.params;
        const summary = await database_1.prisma.projectProgress.aggregate({
            where: { projectId: id },
            _avg: { progress: true },
            _count: { _all: true }
        });
        res.json({ success: true, data: summary });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch progress summary' });
    }
});
router.get('/:id/timeline', async (req, res) => {
    try {
        const { id } = req.params;
        const milestones = await database_1.prisma.projectTimeline.findMany({
            where: { projectId: id },
            orderBy: [{ createdAt: 'asc' }]
        });
        res.json({ success: true, data: milestones });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch timeline' });
    }
});
router.get('/:id/team', async (req, res) => {
    try {
        const { id } = req.params;
        const team = await database_1.prisma.projectTeamMember.findMany({
            where: { projectId: id, isDeleted: false },
            include: { user: { select: { id: true, name: true, email: true, position: true } } }
        });
        res.json({ success: true, data: team });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch team' });
    }
});
router.get('/:id/budget-vs-actual', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await database_1.prisma.project.findUnique({ where: { id } });
        const budget = project?.budget ? Number(project.budget) : 0;
        const actualAmount = 0;
        res.json({
            success: true,
            data: {
                budget,
                actual: actualAmount,
                variance: budget - actualAmount
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch budget vs actual' });
    }
});
//# sourceMappingURL=projects.js.map