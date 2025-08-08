"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const cacheService_1 = require("../services/cacheService");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get('/holidays', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const startTime = Date.now();
    try {
        const holidays = await (0, cacheService_1.getOrSet)(cacheService_1.getHolidaysKey, async () => {
            console.time('holidays_query');
            const result = await prisma.holiday.findMany({
                select: {
                    id: true,
                    date: true,
                    name: true,
                    nameEn: true,
                    type: true,
                    description: true
                },
                orderBy: { date: 'asc' }
            });
            console.timeEnd('holidays_query');
            return result;
        });
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] GET /holidays completed in ${duration}ms`);
        res.json({
            success: true,
            data: holidays,
            meta: {
                count: holidays.length,
                cached: Date.now() - startTime < 1000
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error fetching holidays:', error);
        const duration = Date.now() - startTime;
        console.error(`[${new Date().toISOString()}] GET /holidays failed after ${duration}ms`);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch holidays',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});
router.post('/holidays', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const startTime = Date.now();
    try {
        const { date, name, nameEn, type, description } = req.body;
        console.time('create_holiday');
        const holiday = await prisma.holiday.create({
            data: {
                date: new Date(date),
                name,
                nameEn,
                type,
                description: description || null
            }
        });
        console.timeEnd('create_holiday');
        (0, cacheService_1.invalidateCache)(cacheService_1.getHolidaysKey);
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] POST /holidays completed in ${duration}ms`);
        res.status(201).json({
            success: true,
            data: holiday
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error creating holiday:', error);
        const duration = Date.now() - startTime;
        console.error(`[${new Date().toISOString()}] POST /holidays failed after ${duration}ms`);
        res.status(500).json({
            success: false,
            message: 'Failed to create holiday',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});
router.put('/holidays/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const startTime = Date.now();
    try {
        const { id } = req.params;
        const { date, name, nameEn, type, description } = req.body;
        console.time('update_holiday');
        const holiday = await prisma.holiday.update({
            where: { id },
            data: {
                date: new Date(date),
                name,
                nameEn,
                type,
                description: description || null
            }
        });
        console.timeEnd('update_holiday');
        (0, cacheService_1.invalidateCache)(cacheService_1.getHolidaysKey);
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] PUT /holidays/${id} completed in ${duration}ms`);
        res.json({
            success: true,
            data: holiday
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error updating holiday:', error);
        const duration = Date.now() - startTime;
        console.error(`[${new Date().toISOString()}] PUT /holidays/${req.params.id} failed after ${duration}ms`);
        res.status(500).json({
            success: false,
            message: 'Failed to update holiday',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});
router.delete('/holidays/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const startTime = Date.now();
    try {
        const { id } = req.params;
        console.time('delete_holiday');
        await prisma.holiday.delete({
            where: { id }
        });
        console.timeEnd('delete_holiday');
        (0, cacheService_1.invalidateCache)(cacheService_1.getHolidaysKey);
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] DELETE /holidays/${id} completed in ${duration}ms`);
        res.json({
            success: true,
            message: 'Holiday deleted successfully'
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error deleting holiday:', error);
        const duration = Date.now() - startTime;
        console.error(`[${new Date().toISOString()}] DELETE /holidays/${req.params.id} failed after ${duration}ms`);
        res.status(500).json({
            success: false,
            message: 'Failed to delete holiday',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
});
exports.default = router;
//# sourceMappingURL=holidays.js.map