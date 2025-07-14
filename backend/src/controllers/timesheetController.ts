import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all timesheets for the authenticated user
export const getMyTimesheets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, status, project_id, start_date, end_date } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { user_id: userId };

    if (status) where.status = status;
    if (project_id) where.project_id = project_id;
    if (start_date && end_date) {
      where.date = {
        gte: new Date(start_date as string),
        lte: new Date(end_date as string),
      };
    }

    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          approver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.timesheet.count({ where }),
    ]);

    res.json({
      success: true,
      data: timesheets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get my timesheets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get pending timesheets for approval (for managers/admins)
export const getPendingTimesheets = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
        where: { status: 'submitted' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { submitted_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.timesheet.count({ where: { status: 'submitted' } }),
    ]);

    res.json({
      success: true,
      data: timesheets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get pending timesheets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all timesheets (admin/manager)
export const getAllTimesheets = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, project_id, user_id, start_date, end_date } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (status) where.status = status;
    if (project_id) where.project_id = project_id;
    if (user_id) where.user_id = user_id;
    if (start_date && end_date) {
      where.date = {
        gte: new Date(start_date as string),
        lte: new Date(end_date as string),
      };
    }
    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
          approver: { select: { id: true, name: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.timesheet.count({ where }),
    ]);
    res.json({
      success: true,
      data: timesheets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all timesheets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new timesheet
export const createTimesheet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      project_id,
      work_type = 'PROJECT',
      sub_work_type = 'SOFTWARE',
      activity,
      date,
      hours_worked,
      overtime_hours = 0,
      description,
      billable = true,
      hourly_rate,
      status = 'draft'
    } = req.body;

    // Check if timesheet already exists for this user, project, and date
    const existingTimesheet = await prisma.timesheet.findFirst({
      where: {
        user_id: userId,
        project_id: project_id || null,
        date: new Date(date),
        work_type,
        sub_work_type,
      },
    });

    if (existingTimesheet) {
      res.status(400).json({ 
        message: 'Timesheet already exists for this date, project, and work type' 
      });
      return;
    }

    const timesheet = await prisma.timesheet.create({
      data: {
        user_id: userId,
        project_id: project_id || null,
        work_type,
        sub_work_type,
        activity,
        date: new Date(date),
        hours_worked,
        overtime_hours,
        description,
        status,
        billable,
        hourly_rate,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
      },
    });

    res.status(201).json({
      message: 'Timesheet created successfully',
      timesheet,
    });
  } catch (error) {
    console.error('Create timesheet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update timesheet
export const updateTimesheet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if timesheet exists and belongs to user
    const existingTimesheet = await prisma.timesheet.findFirst({
      where: { id, user_id: userId }
    });

    if (!existingTimesheet) {
      res.status(404).json({ message: 'Timesheet not found' });
      return;
    }

    // Don't allow updates if already submitted/approved
    if (existingTimesheet.status !== 'draft') {
      res.status(400).json({ 
        message: 'Cannot update timesheet that is already submitted or approved' 
      });
      return;
    }

    const timesheet = await prisma.timesheet.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
      },
    });

    // Save edit history
    await prisma.timesheetEditHistory.create({
      data: {
        timesheetId: id,
        userId,
        action: 'edit',
        oldValue: existingTimesheet,
        newValue: updateData,
        createdAt: new Date(),
      },
    });

    res.json({
      message: 'Timesheet updated successfully',
      timesheet,
    });
  } catch (error) {
    console.error('Update timesheet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete timesheet
export const deleteTimesheet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if timesheet exists and belongs to user
    const existingTimesheet = await prisma.timesheet.findFirst({
      where: { id, user_id: userId }
    });

    if (!existingTimesheet) {
      res.status(404).json({ message: 'Timesheet not found' });
      return;
    }

    // Don't allow deletion if already submitted/approved
    if (existingTimesheet.status !== 'draft') {
      res.status(400).json({ 
        message: 'Cannot delete timesheet that is already submitted or approved' 
      });
      return;
    }

    await prisma.timesheet.delete({
      where: { id }
    });

    res.json({ message: 'Timesheet deleted successfully' });
  } catch (error) {
    console.error('Delete timesheet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit timesheet for approval
export const submitTimesheet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if timesheet exists and belongs to user
    const existingTimesheet = await prisma.timesheet.findFirst({
      where: { id, user_id: userId }
    });

    if (!existingTimesheet) {
      res.status(404).json({ message: 'Timesheet not found' });
      return;
    }

    if (existingTimesheet.status !== 'draft') {
      res.status(400).json({ 
        message: 'Timesheet is already submitted or approved' 
      });
      return;
    }

    const timesheet = await prisma.timesheet.update({
      where: { id },
      data: {
        status: 'submitted',
        submitted_at: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
      },
    });

    // Save submit history
    await prisma.timesheetEditHistory.create({
      data: {
        timesheetId: id,
        userId,
        action: 'submit',
        oldValue: existingTimesheet,
        newValue: { status: 'submitted' },
        createdAt: new Date(),
      },
    });

    res.json({
      message: 'Timesheet submitted successfully',
      timesheet,
    });
  } catch (error) {
    console.error('Submit timesheet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Approve/reject timesheet (for managers/admins)
export const approveTimesheet = async (req: Request, res: Response) => {
  try {
    const approverId = (req as any).user.id;
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    // Check if timesheet exists
    const existingTimesheet = await prisma.timesheet.findFirst({
      where: { id }
    });

    if (!existingTimesheet) {
      res.status(404).json({ message: 'Timesheet not found' });
      return;
    }

    if (existingTimesheet.status !== 'submitted') {
      res.status(400).json({ 
        message: 'Timesheet is not in submitted status' 
      });
      return;
    }

    const updateData: any = {
      status,
      approved_by: approverId,
      approved_at: new Date(),
    };

    if (status === 'rejected' && rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }

    const timesheet = await prisma.timesheet.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Save approve/reject history
    await prisma.timesheetEditHistory.create({
      data: {
        timesheetId: id,
        userId: approverId,
        action: status === 'approved' ? 'approve' : 'reject',
        oldValue: existingTimesheet,
        newValue: updateData,
        createdAt: new Date(),
      },
    });

    res.json({
      message: `Timesheet ${status} successfully`,
      timesheet,
    });
  } catch (error) {
    console.error('Approve timesheet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 

// Get timesheet edit history
export const getTimesheetHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = await prisma.timesheetEditHistory.findMany({
      where: { timesheetId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Get timesheet history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 