import { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../utils/database';
import { ICreateTimesheet, IUpdateTimesheet, IQueryParams, ActivityType } from '../types';
import { IAuthenticatedRequest } from '../types';

export const createTimesheet = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { projectId, activityType, description, startTime, endTime, duration }: ICreateTimesheet = req.body;
    const userId = req.user!.id;

    // Validate project if provided
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        res.status(400).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }
    }

    // Create timesheet
    const timesheet = await prisma.timesheet.create({
      data: {
        userId,
        projectId,
        activityType,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Timesheet created successfully',
      data: timesheet
    });
  } catch (error) {
    console.error('Create timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getTimesheets = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
      userId,
      projectId,
      activityType
    }: IQueryParams = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {
      isActive: true
    };

    // Filter by user (admin can see all, others only their own)
    if (req.user!.role !== 'ADMIN') {
      where.userId = req.user!.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (activityType) {
      where.activityType = activityType;
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    // Get timesheets with pagination
    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          project: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          startTime: 'desc'
        },
        skip,
        take: Number(limit)
      }),
      prisma.timesheet.count({ where })
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      message: 'Timesheets retrieved successfully',
      data: timesheets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get timesheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getTimesheetById = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!timesheet) {
      res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
      return;
    }

    // Check permissions
    if (req.user!.role !== 'ADMIN' && timesheet.userId !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Timesheet retrieved successfully',
      data: timesheet
    });
  } catch (error) {
    console.error('Get timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateTimesheet = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const updateData: IUpdateTimesheet = req.body;

    // Check if timesheet exists
    const existingTimesheet = await prisma.timesheet.findUnique({
      where: { id }
    });

    if (!existingTimesheet) {
      res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
      return;
    }

    // Check permissions
    if (req.user!.role !== 'ADMIN' && existingTimesheet.userId !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Validate project if provided
    if (updateData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: updateData.projectId }
      });

      if (!project) {
        res.status(400).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }
    }

    // Update timesheet
    const timesheet = await prisma.timesheet.update({
      where: { id },
      data: {
        ...updateData,
        startTime: updateData.startTime ? new Date(updateData.startTime) : undefined,
        endTime: updateData.endTime ? new Date(updateData.endTime) : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Timesheet updated successfully',
      data: timesheet
    });
  } catch (error) {
    console.error('Update timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteTimesheet = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if timesheet exists
    const timesheet = await prisma.timesheet.findUnique({
      where: { id }
    });

    if (!timesheet) {
      res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
      return;
    }

    // Check permissions
    if (req.user!.role !== 'ADMIN' && timesheet.userId !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Soft delete
    await prisma.timesheet.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Timesheet deleted successfully'
    });
  } catch (error) {
    console.error('Delete timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Validation middleware
export const validateCreateTimesheet = [
  body('activityType').isIn(Object.values(ActivityType)).withMessage('Invalid activity type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('startTime').isISO8601().withMessage('Start time must be a valid date'),
  body('endTime').optional().isISO8601().withMessage('End time must be a valid date'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer'),
  body('projectId').optional().isUUID().withMessage('Project ID must be a valid UUID')
];

export const validateUpdateTimesheet = [
  body('activityType').optional().isIn(Object.values(ActivityType)).withMessage('Invalid activity type'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('startTime').optional().isISO8601().withMessage('Start time must be a valid date'),
  body('endTime').optional().isISO8601().withMessage('End time must be a valid date'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer'),
  body('projectId').optional().isUUID().withMessage('Project ID must be a valid UUID')
]; 