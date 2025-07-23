import { Router } from 'express';
import { authenticate, requireManager } from '../middleware/auth';
import { prisma } from '../utils/database';
import { IAuthenticatedRequest } from '../types';
import multer from 'multer';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Middleware: require authentication for all routes
router.use(authenticate);

// Get all project progress data
router.get('/', async (req: IAuthenticatedRequest, res) => {
  try {
    const { projectId, startDate, endDate, status } = req.query;
    
    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (startDate) where.date = { gte: new Date(startDate as string) };
    if (endDate) where.date = { lte: new Date(endDate as string) };
    if (status) where.status = status as string;

    const progressData = await prisma.projectProgress.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, status: true }
        },
        reporter: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, data: progressData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch project progress data' });
  }
});

// Get project progress by project ID with enhanced data
router.get('/project/:projectId', async (req: IAuthenticatedRequest, res) => {
  try {
    const { projectId } = req.params;
    const { startDate, endDate } = req.query;

    const where: any = { projectId };
    if (startDate) where.date = { gte: new Date(startDate as string) };
    if (endDate) where.date = { lte: new Date(endDate as string) };

    // Get project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        projectTasks: {
          where: { isDeleted: false },
          include: { assignee: { select: { id: true, name: true, email: true } } }
        }
      }
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Get progress data
    const progressData = await prisma.projectProgress.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate project-level progress from tasks
    const taskProgress = calculateTaskBasedProgress(project.projectTasks);
    
    // Calculate S-Curve data
    const sCurveData = calculateSCurveData(progressData);

    // Get latest progress entry
    const latestProgress = progressData.length > 0 ? progressData[progressData.length - 1] : null;

    // Calculate overall project metrics
    const projectMetrics = {
      totalTasks: project.projectTasks.length,
      completedTasks: project.projectTasks.filter((t: any) => t.status === 'COMPLETED').length,
      inProgressTasks: project.projectTasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
      notStartedTasks: project.projectTasks.filter((t: any) => t.status === 'TODO').length,
      overallProgress: taskProgress.overallProgress,
      taskBasedProgress: taskProgress.taskBasedProgress,
      manualProgress: latestProgress?.progress || 0,
      daysRemaining: project.endDate ? calculateDaysRemaining(project.endDate) : null,
      isOnTrack: latestProgress ? latestProgress.status === 'ON_TRACK' : true
    };

    res.json({ 
      success: true, 
      data: progressData,
      sCurveData,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        manager: project.manager,
        metrics: projectMetrics
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch project progress' });
  }
});

// Create new progress entry
router.post('/', async (req: IAuthenticatedRequest, res) => {
  try {
    const { projectId, progress, planned, actual, status, milestone, description } = req.body;
    
    if (!projectId || progress === undefined) {
      res.status(400).json({ success: false, message: 'Project ID and progress are required' });
      return;
    }

    const progressEntry = await prisma.projectProgress.create({
      data: {
        projectId,
        progress: parseInt(progress),
        planned: planned ? parseInt(planned) : null,
        actual: actual ? parseInt(actual) : null,
        status: status || 'ON_TRACK',
        milestone,
        description,
        reportedBy: req.user!.id
      },
      include: {
        project: {
          select: { id: true, name: true, status: true }
        },
        reporter: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({ success: true, data: progressEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create progress entry' });
  }
});

// Update progress entry
router.put('/:id', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { progress, planned, actual, status, milestone, description } = req.body;

    const progressEntry = await prisma.projectProgress.update({
      where: { id },
      data: {
        progress: progress ? parseInt(progress) : undefined,
        planned: planned ? parseInt(planned) : undefined,
        actual: actual ? parseInt(actual) : undefined,
        status,
        milestone,
        description
      },
      include: {
        project: {
          select: { id: true, name: true, status: true }
        },
        reporter: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ success: true, data: progressEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update progress entry' });
  }
});

// Delete progress entry
router.delete('/:id', requireManager, async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const progress = await prisma.projectProgress.findUnique({
      where: { id }
    });

    if (!progress) {
      res.status(404).json({ success: false, message: 'Progress entry not found' });
      return;
    }

    await prisma.projectProgress.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Progress entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete progress entry' });
  }
});

// Import CSV data
router.post('/import/:projectId', requireManager, upload.single('file'), async (req: IAuthenticatedRequest, res) => {
  try {
    const { projectId } = req.params;
    const file = (req as any).file;

    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const results: any[] = [];
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', async () => {
        try {
          // Process the imported data
          const progressEntries = results.map((row: any) => ({
            projectId,
            date: new Date(row.date),
            progress: parseFloat(row.progress),
            planned: parseFloat(row.planned || '0'),
            actual: parseFloat(row.actual || '0'),
            status: row.status || 'ON_TRACK',
            milestone: row.milestone || '',
            description: row.description || '',
            reportedBy: req.user?.id
          }));

          // Insert the data
          const createdEntries = await prisma.projectProgress.createMany({
            data: progressEntries
          });

          // Clean up the uploaded file
          fs.unlinkSync(file.path);

          res.json({ 
            success: true, 
            message: `Imported ${createdEntries.count} progress entries`,
            count: createdEntries.count
          });
        } catch (error) {
          // Clean up the uploaded file on error
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          res.status(500).json({ success: false, message: 'Failed to process imported data' });
        }
      });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to import data' });
  }
});

// Export progress data to CSV
router.get('/export/:projectId', async (req: IAuthenticatedRequest, res) => {
  try {
    const { projectId } = req.params;
    
    const progressData = await prisma.projectProgress.findMany({
      where: { projectId },
      include: {
        reporter: {
          select: { name: true, email: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    if (progressData.length === 0) {
      res.status(404).json({ success: false, message: 'No progress data found' });
      return;
    }

    const csvData = progressData.map((entry: any) => ({
      date: entry.date.toISOString().split('T')[0],
      progress: entry.progress,
      planned: entry.planned || '',
      actual: entry.actual || '',
      status: entry.status,
      milestone: entry.milestone || '',
      description: entry.description || '',
      reporter: entry.reporter?.name || 'Unknown'
    }));

    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, `../../exports/progress_${projectId}.csv`),
      header: [
        { id: 'date', title: 'Date' },
        { id: 'progress', title: 'Progress (%)' },
        { id: 'planned', title: 'Planned (%)' },
        { id: 'actual', title: 'Actual (%)' },
        { id: 'status', title: 'Status' },
        { id: 'milestone', title: 'Milestone' },
        { id: 'description', title: 'Description' },
        { id: 'reporter', title: 'Reporter' }
      ]
    });

    await csvWriter.writeRecords(csvData);
    res.download(path.join(__dirname, `../../exports/progress_${projectId}.csv`), `progress_${projectId}.csv`);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
});

// Get S-Curve data for a project
router.get('/s-curve/:projectId', async (req: IAuthenticatedRequest, res) => {
  try {
    const { projectId } = req.params;
    const { startDate, endDate } = req.query;

    const where: any = { projectId };
    if (startDate) where.date = { gte: new Date(startDate as string) };
    if (endDate) where.date = { lte: new Date(endDate as string) };

    const progressData = await prisma.projectProgress.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    const sCurveData = calculateSCurveData(progressData);

    res.json({ success: true, data: sCurveData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate S-Curve data' });
  }
});

// Bulk update progress entries
router.put('/bulk/:projectId', requireManager, async (req: IAuthenticatedRequest, res) => {
  try {
    const { projectId } = req.params;
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      res.status(400).json({ success: false, message: 'Updates must be an array' });
      return;
    }

    const results = [];
    for (const update of updates) {
      try {
        const updated = await prisma.projectProgress.update({
          where: { id: update.id },
          data: {
            progress: update.progress,
            planned: update.planned,
            actual: update.actual,
            status: update.status,
            milestone: update.milestone,
            description: update.description
          }
        });
        results.push(updated);
      } catch (error) {
        results.push({ id: update.id, error: 'Failed to update' });
      }
    }

    res.json({ 
      success: true, 
      message: `Updated ${results.length} entries`,
      results 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to bulk update' });
  }
});

// Helper function to calculate S-Curve data
function calculateSCurveData(progressData: any[]) {
  if (progressData.length === 0) return [];

  const sortedData = progressData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let cumulativePlanned = 0;
  let cumulativeActual = 0;

  return sortedData.map((entry, index) => {
    const planned = entry.planned || 0;
    const actual = entry.actual || entry.progress || 0;
    
    cumulativePlanned += planned;
    cumulativeActual += actual;

    return {
      date: entry.date,
      planned: Math.min(cumulativePlanned, 100),
      actual: Math.min(cumulativeActual, 100),
      progress: entry.progress,
      status: entry.status,
      milestone: entry.milestone,
      description: entry.description
    };
  });
}

// Helper function to calculate task-based progress
function calculateTaskBasedProgress(tasks: any[]) {
  if (tasks.length === 0) {
    return { overallProgress: 0, taskBasedProgress: 0 };
  }

  const totalWeight = tasks.reduce((sum, task) => sum + (task.priority || 1), 0);
  const weightedProgress = tasks.reduce((sum, task) => {
    let taskProgress = 0;
    switch (task.status) {
      case 'COMPLETED':
        taskProgress = 100;
        break;
      case 'IN_PROGRESS':
        taskProgress = 50; // Default progress for in-progress tasks
        break;
      case 'TODO':
        taskProgress = 0;
        break;
      default:
        taskProgress = 0;
    }
    return sum + (taskProgress * (task.priority || 1));
  }, 0);

  const overallProgress = totalWeight > 0 ? (weightedProgress / totalWeight) : 0;
  
  return {
    overallProgress: Math.round(overallProgress * 100) / 100,
    taskBasedProgress: overallProgress
  };
}

// Helper function to calculate days remaining
function calculateDaysRemaining(endDate: Date) {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default router; 