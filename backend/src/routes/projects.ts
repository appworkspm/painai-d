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
    const { name, description, status, managerId } = req.body;

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
        managerId
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
    const { name, description, status, managerId } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (managerId) updateData.managerId = managerId;

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

export default router; 