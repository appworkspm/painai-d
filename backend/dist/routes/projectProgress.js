"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = require("../utils/database");
const multer_1 = __importDefault(require("multer"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const csv_writer_1 = require("csv-writer");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
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
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only CSV files are allowed'), false);
        }
    }
});
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    try {
        const { projectId, startDate, endDate, status } = req.query;
        const where = {};
        if (projectId)
            where.projectId = projectId;
        if (startDate)
            where.date = { gte: new Date(startDate) };
        if (endDate)
            where.date = { lte: new Date(endDate) };
        if (status)
            where.status = status;
        const progressData = await database_1.prisma.projectProgress.findMany({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch project progress data' });
    }
});
router.get('/project/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { startDate, endDate } = req.query;
        const where = { projectId };
        if (startDate)
            where.date = { gte: new Date(startDate) };
        if (endDate)
            where.date = { lte: new Date(endDate) };
        const project = await database_1.prisma.project.findUnique({
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
        const progressData = await database_1.prisma.projectProgress.findMany({
            where,
            include: {
                reporter: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { date: 'asc' }
        });
        const taskProgress = calculateTaskBasedProgress(project.projectTasks);
        const sCurveData = calculateSCurveData(progressData);
        const latestProgress = progressData.length > 0 ? progressData[progressData.length - 1] : null;
        const projectMetrics = {
            totalTasks: project.projectTasks.length,
            completedTasks: project.projectTasks.filter((t) => t.status === 'COMPLETED').length,
            inProgressTasks: project.projectTasks.filter((t) => t.status === 'IN_PROGRESS').length,
            notStartedTasks: project.projectTasks.filter((t) => t.status === 'TODO').length,
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch project progress' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { projectId, progress, planned, actual, status, milestone, description } = req.body;
        if (!projectId || progress === undefined) {
            res.status(400).json({ success: false, message: 'Project ID and progress are required' });
            return;
        }
        const progressEntry = await database_1.prisma.projectProgress.create({
            data: {
                projectId,
                progress: parseInt(progress),
                planned: planned ? parseInt(planned) : null,
                actual: actual ? parseInt(actual) : null,
                status: status || 'ON_TRACK',
                milestone,
                description,
                reportedBy: req.user.id
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create progress entry' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { progress, planned, actual, status, milestone, description } = req.body;
        const progressEntry = await database_1.prisma.projectProgress.update({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update progress entry' });
    }
});
router.delete('/:id', auth_1.requireManager, async (req, res) => {
    try {
        const { id } = req.params;
        const progress = await database_1.prisma.projectProgress.findUnique({
            where: { id }
        });
        if (!progress) {
            res.status(404).json({ success: false, message: 'Progress entry not found' });
            return;
        }
        await database_1.prisma.projectProgress.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Progress entry deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete progress entry' });
    }
});
router.post('/import/:projectId', auth_1.requireManager, upload.single('file'), async (req, res) => {
    try {
        const { projectId } = req.params;
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        const results = [];
        fs.createReadStream(file.path)
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
            try {
                const progressEntries = results.map((row) => ({
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
                const createdEntries = await database_1.prisma.projectProgress.createMany({
                    data: progressEntries
                });
                fs.unlinkSync(file.path);
                res.json({
                    success: true,
                    message: `Imported ${createdEntries.count} progress entries`,
                    count: createdEntries.count
                });
            }
            catch (error) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                res.status(500).json({ success: false, message: 'Failed to process imported data' });
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to import data' });
    }
});
router.get('/export/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const progressData = await database_1.prisma.projectProgress.findMany({
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
        const csvData = progressData.map((entry) => ({
            date: entry.date.toISOString().split('T')[0],
            progress: entry.progress,
            planned: entry.planned || '',
            actual: entry.actual || '',
            status: entry.status,
            milestone: entry.milestone || '',
            description: entry.description || '',
            reporter: entry.reporter?.name || 'Unknown'
        }));
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to export data' });
    }
});
router.get('/s-curve/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { startDate, endDate } = req.query;
        const where = { projectId };
        if (startDate)
            where.date = { gte: new Date(startDate) };
        if (endDate)
            where.date = { lte: new Date(endDate) };
        const progressData = await database_1.prisma.projectProgress.findMany({
            where,
            orderBy: { date: 'asc' }
        });
        const sCurveData = calculateSCurveData(progressData);
        res.json({ success: true, data: sCurveData });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to calculate S-Curve data' });
    }
});
router.put('/bulk/:projectId', auth_1.requireManager, async (req, res) => {
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
                const updated = await database_1.prisma.projectProgress.update({
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
            }
            catch (error) {
                results.push({ id: update.id, error: 'Failed to update' });
            }
        }
        res.json({
            success: true,
            message: `Updated ${results.length} entries`,
            results
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to bulk update' });
    }
});
function calculateSCurveData(progressData) {
    if (progressData.length === 0)
        return [];
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
function calculateTaskBasedProgress(tasks) {
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
                taskProgress = 50;
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
function calculateDaysRemaining(endDate) {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
exports.default = router;
//# sourceMappingURL=projectProgress.js.map