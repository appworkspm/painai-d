import { Router } from 'express';
import { authenticate, requireManager } from '../middleware/auth';
import { prisma } from '../utils/database';
import { IAuthenticatedRequest } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get project progress by project ID
router.get('/project/:projectId', async (req: IAuthenticatedRequest, res) => {
  try {
    const { projectId } = req.params;
    
    const progress = await prisma.projectProgress.findMany({
      where: { projectId },
      include: {
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

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching project progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project progress'
    });
  }
});

// Create new project progress
router.post('/', requireManager, async (req: IAuthenticatedRequest, res) => {
  try {
    const { projectId, progress, status, milestone, description } = req.body;
    const reportedBy = req.user.id;

    if (!projectId || progress === undefined) {
      res.status(400).json({
        success: false,
        message: 'Project ID and progress are required'
      });
      return;
    }

    // Validate progress percentage
    if (progress < 0 || progress > 100) {
      res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
      return;
    }

    const projectProgress = await prisma.projectProgress.create({
      data: {
        projectId,
        progress,
        status: status || 'ON_TRACK',
        milestone,
        description,
        reportedBy
      },
      include: {
        reporter: {
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
      data: projectProgress
    });
  } catch (error) {
    console.error('Error creating project progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project progress'
    });
  }
});

// Update project progress
router.put('/:id', requireManager, async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { progress, status, milestone, description } = req.body;

    const updateData: any = {};
    if (progress !== undefined) {
      if (progress < 0 || progress > 100) {
        res.status(400).json({
          success: false,
          message: 'Progress must be between 0 and 100'
        });
        return;
      }
      updateData.progress = progress;
    }
    if (status) updateData.status = status;
    if (milestone !== undefined) updateData.milestone = milestone;
    if (description !== undefined) updateData.description = description;

    const projectProgress = await prisma.projectProgress.update({
      where: { id },
      data: updateData,
      include: {
        reporter: {
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
      data: projectProgress
    });
  } catch (error) {
    console.error('Error updating project progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project progress'
    });
  }
});

// Delete project progress
router.delete('/:id', requireManager, async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.projectProgress.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Project progress deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project progress'
    });
  }
});

// Get latest progress for all projects
router.get('/latest', async (req: IAuthenticatedRequest, res) => {
  try {
    const latestProgress = await prisma.projectProgress.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
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

    // Group by project and get latest for each
    const projectLatestProgress = latestProgress.reduce((acc, progress) => {
      if (!acc[progress.projectId]) {
        acc[progress.projectId] = progress;
      }
      return acc;
    }, {} as any);

    res.json({
      success: true,
      data: Object.values(projectLatestProgress)
    });
  } catch (error) {
    console.error('Error fetching latest project progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest project progress'
    });
  }
});

export default router; 