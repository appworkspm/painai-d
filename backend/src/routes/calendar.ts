import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, IAuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware: require authentication for all routes
router.use(authenticate);

// Get calendar events for the current user
router.get('/events', async (req: IAuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get events from timesheets, projects, and other sources
    const events = await prisma.timesheet.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date(new Date().getFullYear(), 0, 1), // Start of current year
          lte: new Date(new Date().getFullYear(), 11, 31) // End of current year
        }
      },
      select: {
        id: true,
        date: true,
        activity: true,
        description: true,
        hoursWorked: true,
        status: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Transform timesheet data into calendar events
    const calendarEvents = events.map(event => ({
      id: `timesheet-${event.id}`,
      title: event.activity,
      description: event.description,
      startTime: new Date(event.date),
      endTime: new Date(new Date(event.date).getTime() + event.hoursWorked * 60 * 60 * 1000),
      type: 'timesheet' as const,
      priority: event.status === 'submitted' ? 'high' : 'medium',
      projectId: event.project?.id,
      projectName: event.project?.name,
      hours: event.hoursWorked,
      status: event.status
    }));

    res.json(calendarEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Get calendar events for a specific date range
router.get('/events/range', async (req: IAuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const events = await prisma.timesheet.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      },
      select: {
        id: true,
        date: true,
        activity: true,
        description: true,
        hoursWorked: true,
        status: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    const calendarEvents = events.map(event => ({
      id: `timesheet-${event.id}`,
      title: event.activity,
      description: event.description,
      startTime: new Date(event.date),
      endTime: new Date(new Date(event.date).getTime() + event.hoursWorked * 60 * 60 * 1000),
      type: 'timesheet' as const,
      priority: event.status === 'submitted' ? 'high' : 'medium',
      projectId: event.project?.id,
      projectName: event.project?.name,
      hours: event.hoursWorked,
      status: event.status
    }));

    res.json(calendarEvents);
  } catch (error) {
    console.error('Error fetching calendar events for range:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

export default router; 