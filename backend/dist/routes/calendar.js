"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticate);
router.get('/events', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const events = await prisma.timesheet.findMany({
            where: {
                user_id: userId,
                date: {
                    gte: new Date(new Date().getFullYear(), 0, 1),
                    lte: new Date(new Date().getFullYear(), 11, 31)
                }
            },
            select: {
                id: true,
                date: true,
                activity: true,
                description: true,
                hours_worked: true,
                status: true
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
            endTime: new Date(new Date(event.date).getTime() + Number(event.hours_worked) * 60 * 60 * 1000),
            type: 'timesheet',
            priority: event.status === 'submitted' ? 'high' : 'medium',
            hours: Number(event.hours_worked),
            status: event.status
        }));
        res.json(calendarEvents);
    }
    catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
});
router.get('/events/range', async (req, res) => {
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
                user_id: userId,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            select: {
                id: true,
                date: true,
                activity: true,
                description: true,
                hours_worked: true,
                status: true
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
            endTime: new Date(new Date(event.date).getTime() + Number(event.hours_worked) * 60 * 60 * 1000),
            type: 'timesheet',
            priority: event.status === 'submitted' ? 'high' : 'medium',
            hours: Number(event.hours_worked),
            status: event.status
        }));
        res.json(calendarEvents);
    }
    catch (error) {
        console.error('Error fetching calendar events for range:', error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
});
exports.default = router;
//# sourceMappingURL=calendar.js.map