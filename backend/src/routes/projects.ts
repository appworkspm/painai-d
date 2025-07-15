import { Router } from 'express';
import { authenticate, requireManager } from '../middleware/auth';
import { prisma } from '../utils/database';
import { IAuthenticatedRequest } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all projects
router.get('/', async (req: IAuthenticatedRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
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
      }
    });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
});

// Get project by ID
router.get('/:id', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
});

// Create new project (manager/admin only)
router.post('/', requireManager, async (req: IAuthenticatedRequest, res) => {
  try {
    const { name, description, status, managerId, jobCode, customerName, paymentTerm, paymentCondition, startDate, endDate, budget } = req.body;

    if (!name || !description || !status || !managerId) {
      res.status(400).json({
        success: false,
        message: 'Name, description, status, and manager are required'
      });
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
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
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
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
});

// Delete project (manager/admin only)
router.delete('/:id', requireManager, async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    await prisma.project.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
});

// --- Project Team Member APIs ---
// Get project team members
router.get('/:id/team', async (req, res) => {
  try {
    const { id } = req.params;
    const team = await prisma.projectTeamMember.findMany({
      where: { projectId: id, isDeleted: false },
      include: { user: { select: { id: true, name: true, email: true, position: true, isActive: true } } }
    });
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch team members' });
  }
});

// Add member to project team (not manager)
router.post('/:id/team', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    // Prevent adding manager as member
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (userId === project.managerId) return res.status(400).json({ success: false, message: 'Cannot add manager as member' });
    // Check if already member
    const exists = await prisma.projectTeamMember.findUnique({ where: { projectId_userId: { projectId: id, userId } } });
    if (exists && !exists.isDeleted) return res.status(400).json({ success: false, message: 'User already a member' });
    await prisma.projectTeamMember.upsert({
      where: { projectId_userId: { projectId: id, userId } },
      update: { isDeleted: false },
      create: { projectId: id, userId }
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add member' });
  }
});

// Remove member from project team (not manager)
router.delete('/:id/team/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (userId === project.managerId) return res.status(400).json({ success: false, message: 'Cannot remove manager from team' });
    await prisma.projectTeamMember.update({
      where: { projectId_userId: { projectId: id, userId } },
      data: { isDeleted: true }
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove member' });
  }
});

// --- Project Task APIs ---
// Add task
router.post('/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, assigneeId, dueDate, priority } = req.body;
    const task = await prisma.projectTask.create({
      data: {
        projectId: id,
        name,
        description,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 1
      }
    });
    // Log to timeline
    await prisma.projectTimeline.create({
      data: {
        projectId: id,
        action: 'task_created',
        description: `Task '${name}' created`,
        userId: (req as any).user.id,
        metadata: { taskId: task.id, name }
      }
    });
    return res.json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add task' });
  }
});

// Update task (status, etc.)
router.put('/:id/tasks/:taskId', async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { name, description, assigneeId, dueDate, priority, status } = req.body;
    const task = await prisma.projectTask.update({
      where: { id: taskId },
      data: { name, description, assigneeId, dueDate, priority, status }
    });
    return res.json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id/tasks/:taskId', async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const task = await prisma.projectTask.update({
      where: { id: taskId },
      data: { isDeleted: true }
    });
    // Log to timeline
    await prisma.projectTimeline.create({
      data: {
        projectId: id,
        action: 'task_deleted',
        description: `Task '${task.name}' deleted`,
        userId: (req as any).user.id,
        metadata: { taskId: task.id, name: task.name }
      }
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
});

// --- Project Timeline APIs ---
// Get project timeline
router.get('/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const timeline = await prisma.projectTimeline.findMany({
      where: { projectId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: timeline });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch timeline' });
  }
});

export default router; 