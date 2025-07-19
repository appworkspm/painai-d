
import { Router } from 'express';
import { authenticate, requireManager } from '../middleware/auth';
import { prisma } from '../utils/database';
import { IAuthenticatedRequest } from '../types';

const router = Router();

// Middleware: require authentication for all routes
router.use(authenticate);

// Get all projects
router.get('/', async (req: IAuthenticatedRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
});

// Create new project (manager/admin only)
router.post('/', requireManager, async (req: IAuthenticatedRequest, res) => {
  try {
    const { name, description, status, managerId, jobCode, customerName, paymentTerm, paymentCondition, startDate, endDate, budget } = req.body;
    if (!name || !description || !status || !managerId) {
      res.status(400).json({ success: false, message: 'Name, description, status, and manager are required' });
      return;
    }
    const project = await prisma.project.create({
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create project' });
  }
});

// Update project (manager/admin only)
router.put('/:id', requireManager, async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, managerId, jobCode, customerName, paymentTerm, paymentCondition, startDate, endDate, budget } = req.body;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (managerId) updateData.managerId = managerId;
    if (jobCode !== undefined) updateData.jobCode = jobCode;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (paymentTerm !== undefined) updateData.paymentTerm = paymentTerm;
    if (paymentCondition !== undefined) updateData.paymentCondition = paymentCondition;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (budget !== undefined) updateData.budget = parseFloat(budget);
    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        manager: { select: { id: true, name: true, email: true } }
      }
    });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update project' });
  }
});

// Delete project (manager/admin only)
router.delete('/:id', requireManager, async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    await prisma.project.delete({ where: { id } });
    res.json({ success: true, message: 'Project deleted successfully' });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
});

export default router;

// --- ADVANCED PROJECT MANAGEMENT & REPORTING APIs ---

// S Curve Data (Progress over time)
router.get('/:id/s-curve', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    // Example: fetch progress data by date (replace with real logic)
    const progress = await prisma.projectProgress.findMany({
      where: { projectId: id },
      orderBy: [{ reportedAt: 'asc' }]
    });
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch S Curve data' });
  }
});

// Cost Breakdown Report
router.get('/:id/cost-breakdown', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    // Fetch all costs for the project
    const costs = await prisma.projectCost.findMany({
      where: { projectId: id },
      orderBy: { date: 'asc' }
    });
    // Calculate total cost
    const totalCost = costs.reduce((sum, c) => sum + Number(c.amount), 0);
    res.json({ success: true, totalCost, breakdown: costs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch cost breakdown' });
  }
});

// Progress Summary
router.get('/:id/progress-summary', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    // Example: fetch summary (replace with real logic)
    const summary = await prisma.projectProgress.aggregate({
      where: { projectId: id },
      _avg: { progress: true },
      _count: { _all: true }
    });
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch progress summary' });
  }
});

// Timeline (Milestones)
router.get('/:id/timeline', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const milestones = await prisma.projectTimeline.findMany({
      where: { projectId: id },
      orderBy: [{ createdAt: 'asc' }]
    });
    res.json({ success: true, data: milestones });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch timeline' });
  }
});

// Team Members
router.get('/:id/team', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const team = await prisma.projectTeamMember.findMany({
      where: { projectId: id, isDeleted: false },
      include: { user: { select: { id: true, name: true, email: true, position: true } } }
    });
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch team' });
  }
});

// Budget vs Actual Report
router.get('/:id/budget-vs-actual', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });
    // No projectCost model in schema, so actual = 0
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch budget vs actual' });
  }
});

// --- END ADVANCED APIs ---







