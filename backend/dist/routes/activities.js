"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const prismaClient_1 = require("../prismaClient");
const router = express_1.default.Router();
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            console.error(err);
            res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error: err });
        });
    };
}
const holidaySchema = zod_1.z.object({
    date: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    nameEn: zod_1.z.string().optional(),
    type: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
router.get('/', auth_1.requireAdmin, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const skip = (page - 1) * pageSize;
    const activities = await prismaClient_1.prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.json({ success: true, data: activities });
}));
router.get('/holidays', auth_1.requireAdmin, asyncHandler(async (req, res) => {
    const holidays = await prismaClient_1.prisma.holiday.findMany({
        orderBy: { date: 'asc' },
        select: { id: true, date: true, name: true, nameEn: true, type: true, description: true }
    });
    res.json({ success: true, data: holidays });
}));
router.post('/holidays', auth_1.requireAdmin, asyncHandler(async (req, res) => {
    const parse = holidaySchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ success: false, message: 'Invalid input', errors: parse.error.issues });
        return;
    }
    const { date, name, nameEn, type, description } = parse.data;
    const holiday = await prismaClient_1.prisma.holiday.create({
        data: {
            date: new Date(date),
            name,
            nameEn: nameEn ?? '',
            type,
            description: description ?? ''
        },
    });
    res.json({ success: true, data: holiday });
}));
router.put('/holidays/:id', auth_1.requireAdmin, asyncHandler(async (req, res) => {
    const parse = holidaySchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ success: false, message: 'Invalid input', errors: parse.error.issues });
        return;
    }
    const { id } = req.params;
    const { date, name, nameEn, type, description } = parse.data;
    const holiday = await prismaClient_1.prisma.holiday.update({
        where: { id },
        data: {
            date: new Date(date),
            name,
            nameEn: nameEn ?? '',
            type,
            description: description ?? ''
        },
    });
    res.json({ success: true, data: holiday });
}));
router.delete('/holidays/:id', auth_1.requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prismaClient_1.prisma.holiday.delete({ where: { id } });
    res.json({ success: true });
}));
exports.default = router;
//# sourceMappingURL=activities.js.map