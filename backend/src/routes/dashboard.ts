import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/database';
import { IAuthenticatedRequest } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get project dashboard overview
router.get('/projects/overview', async (req: IAuthenticatedRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = { isDeleted: false };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Get project statistics
    const totalProjects = await prisma.project.count({ where });
    const activeProjects = await prisma.project.count({ 
      where: { ...where, status: 'ACTIVE' } 
    });
    const completedProjects = await prisma.project.count({ 
      where: { ...where, status: 'COMPLETED' } 
    });
    const onHoldProjects = await prisma.project.count({ 
      where: { ...where, status: 'ON_HOLD' } 
    });

    // Get projects by status
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true
      }
    });

    // Get recent projects
    const recentProjects = await prisma.project.findMany({
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
  } catch (error) {
    console.error('Error fetching project overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project overview'
    });
  }
});

// Get project progress dashboard
router.get('/projects/progress', async (req: IAuthenticatedRequest, res) => {
  try {
    // Get latest progress for all projects
    const latestProgress = await prisma.projectProgress.findMany({
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

    // Group by project and get latest for each
    const projectLatestProgress = latestProgress.reduce((acc, progress) => {
      if (!acc[progress.projectId]) {
        acc[progress.projectId] = progress;
      }
      return acc;
    }, {} as any);

    const progressData = Object.values(projectLatestProgress);

    // Calculate progress statistics
    const onTrackCount = progressData.filter((p: any) => p.status === 'ON_TRACK').length;
    const behindCount = progressData.filter((p: any) => p.status === 'BEHIND').length;
    const aheadCount = progressData.filter((p: any) => p.status === 'AHEAD').length;
    const completedCount = progressData.filter((p: any) => p.status === 'COMPLETED').length;

    // Calculate average progress
    const totalProgress = progressData.reduce((sum: number, p: any) => sum + p.progress, 0);
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
  } catch (error) {
    console.error('Error fetching project progress dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project progress dashboard'
    });
  }
});

// Get cost management dashboard
router.get('/costs/overview', async (req: IAuthenticatedRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    // Get cost statistics
    const totalCosts = await prisma.projectCost.findMany({ where });
    const totalAmount = totalCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);

    // Get costs by project
    const costsByProject = await prisma.projectCost.groupBy({
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
      take: 10 // Limit to top 10 projects by cost
    });

    // Get project details for the grouped results
    const projectDetails = await prisma.project.findMany({
      where: {
        id: { in: costsByProject.map(c => c.projectId) }
      },
      select: {
        id: true,
        name: true
      }
    });

    // Map project details to the costs
    const costsByCategory = costsByProject.map(cost => ({
      projectId: cost.projectId,
      projectName: projectDetails.find(p => p.id === cost.projectId)?.name || 'Unknown Project',
      totalAmount: cost._sum.amount || 0
    }));

    // Get cost requests statistics
    const pendingRequests = await prisma.costRequest.count({ 
      where: { status: 'PENDING' } 
    });
    const approvedRequests = await prisma.costRequest.count({ 
      where: { status: 'APPROVED' } 
    });
    const rejectedRequests = await prisma.costRequest.count({ 
      where: { status: 'REJECTED' } 
    });

    // Get recent cost requests
    const recentCostRequests = await prisma.costRequest.findMany({
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
  } catch (error) {
    console.error('Error fetching cost overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cost overview'
    });
  }
});

// Get timesheet dashboard
router.get('/timesheets/overview', async (req: IAuthenticatedRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    // Get timesheet statistics
    const totalTimesheets = await prisma.timesheet.count({ where });
    const pendingTimesheets = await prisma.timesheet.count({ 
      where: { ...where, status: 'pending' } 
    });
    const approvedTimesheets = await prisma.timesheet.count({ 
      where: { ...where, status: 'approved' } 
    });
    const rejectedTimesheets = await prisma.timesheet.count({ 
      where: { ...where, status: 'rejected' } 
    });

    // Get total hours worked
    const timesheets = await prisma.timesheet.findMany({ where });
    const totalHours = timesheets.reduce((sum, ts) => sum + Number(ts.hours_worked), 0);
    const totalOvertimeHours = timesheets.reduce((sum, ts) => sum + Number(ts.overtime_hours || 0), 0);

    // Get timesheets by project
    const timesheetsByProject = await prisma.timesheet.groupBy({
      by: ['project_id'],
      where,
      _sum: {
        hours_worked: true,
        overtime_hours: true
      }
    });

    // Get recent timesheets
    const recentTimesheets = await prisma.timesheet.findMany({
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
  } catch (error) {
    console.error('Error fetching timesheet overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timesheet overview'
    });
  }
});

// Get user activity dashboard
router.get('/activities/overview', async (req: IAuthenticatedRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Get activity statistics
    const totalActivities = await prisma.activityLog.count({ where });
    const activitiesByType = await prisma.activityLog.groupBy({
      by: ['type'],
      where,
      _count: {
        type: true
      }
    });

    // Get activities by severity
    const activitiesBySeverity = await prisma.activityLog.groupBy({
      by: ['severity'],
      where,
      _count: {
        severity: true
      }
    });

    // Get recent activities
    const recentActivities = await prisma.activityLog.findMany({
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
  } catch (error) {
    console.error('Error fetching activity overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity overview'
    });
  }
});

// Get comprehensive dashboard data
router.get('/comprehensive', async (req: IAuthenticatedRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all dashboard data in parallel
    const [
      projectOverview,
      progressData,
      costOverview,
      timesheetOverview,
      activityOverview
    ] = await Promise.all([
      // Project overview
      (async () => {
        const where: any = { isDeleted: false };
        if (startDate || endDate) {
          where.createdAt = {};
          if (startDate) where.createdAt.gte = new Date(startDate as string);
          if (endDate) where.createdAt.lte = new Date(endDate as string);
        }
        
        const totalProjects = await prisma.project.count({ where });
        const activeProjects = await prisma.project.count({ 
          where: { ...where, status: 'ACTIVE' } 
        });
        
        return { totalProjects, activeProjects };
      })(),
      
      // Progress data
      (async () => {
        const latestProgress = await prisma.projectProgress.findMany({
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
        }, {} as any);
        
        return Object.values(projectLatestProgress);
      })(),
      
      // Cost overview
      (async () => {
        const where: any = {};
        if (startDate || endDate) {
          where.date = {};
          if (startDate) where.date.gte = new Date(startDate as string);
          if (endDate) where.date.lte = new Date(endDate as string);
        }
        
        const totalCosts = await prisma.projectCost.findMany({ where });
        const totalAmount = totalCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
        const pendingRequests = await prisma.costRequest.count({ 
          where: { status: 'PENDING' } 
        });
        
        return { totalAmount, totalCosts: totalCosts.length, pendingRequests };
      })(),
      
      // Timesheet overview
      (async () => {
        const where: any = {};
        if (startDate || endDate) {
          where.date = {};
          if (startDate) where.date.gte = new Date(startDate as string);
          if (endDate) where.date.lte = new Date(endDate as string);
        }
        
        const totalTimesheets = await prisma.timesheet.count({ where });
        const pendingTimesheets = await prisma.timesheet.count({ 
          where: { ...where, status: 'pending' } 
        });
        const timesheets = await prisma.timesheet.findMany({ where });
        const totalHours = timesheets.reduce((sum, ts) => sum + Number(ts.hours_worked), 0);
        
        return { totalTimesheets, pendingTimesheets, totalHours };
      })(),
      
      // Activity overview
      (async () => {
        const where: any = {};
        if (startDate || endDate) {
          where.createdAt = {};
          if (startDate) where.createdAt.gte = new Date(startDate as string);
          if (endDate) where.createdAt.lte = new Date(endDate as string);
        }
        
        const totalActivities = await prisma.activityLog.count({ where });
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
  } catch (error) {
    console.error('Error fetching comprehensive dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comprehensive dashboard'
    });
  }
});

export default router; 