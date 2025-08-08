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
let systemSettings = {
    systemName: 'ไปไหน (Painai)',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    maintenanceMode: false,
    emailNotifications: true,
    backupFrequency: 'daily',
    retentionDays: 30
};
router.get('/settings', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        res.json({
            success: true,
            data: systemSettings
        });
    }
    catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get settings'
        });
    }
});
router.put('/settings', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { systemName, sessionTimeout, maxLoginAttempts, maintenanceMode, emailNotifications, backupFrequency, retentionDays } = req.body;
        if (systemName && typeof systemName !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'System name must be a string'
            });
        }
        if (sessionTimeout && (typeof sessionTimeout !== 'number' || sessionTimeout < 1 || sessionTimeout > 1440)) {
            return res.status(400).json({
                success: false,
                message: 'Session timeout must be a number between 1 and 1440 minutes'
            });
        }
        if (maxLoginAttempts && (typeof maxLoginAttempts !== 'number' || maxLoginAttempts < 1 || maxLoginAttempts > 10)) {
            return res.status(400).json({
                success: false,
                message: 'Max login attempts must be a number between 1 and 10'
            });
        }
        if (retentionDays && (typeof retentionDays !== 'number' || retentionDays < 1 || retentionDays > 365)) {
            return res.status(400).json({
                success: false,
                message: 'Retention days must be a number between 1 and 365'
            });
        }
        systemSettings = {
            ...systemSettings,
            ...(systemName && { systemName }),
            ...(sessionTimeout && { sessionTimeout }),
            ...(maxLoginAttempts && { maxLoginAttempts }),
            ...(typeof maintenanceMode === 'boolean' && { maintenanceMode }),
            ...(typeof emailNotifications === 'boolean' && { emailNotifications }),
            ...(backupFrequency && ['daily', 'weekly', 'monthly'].includes(backupFrequency) && { backupFrequency }),
            ...(retentionDays && { retentionDays })
        };
        await prisma.activityLog.create({
            data: {
                userId: req.user?.id,
                type: 'settings_updated',
                message: 'System settings updated',
                severity: 'info'
            }
        });
        res.json({
            success: true,
            data: systemSettings,
            message: 'Settings updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings'
        });
    }
});
router.post('/settings/reset', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        systemSettings = {
            systemName: 'ไปไหน (Painai)',
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            maintenanceMode: false,
            emailNotifications: true,
            backupFrequency: 'daily',
            retentionDays: 30
        };
        await prisma.activityLog.create({
            data: {
                userId: req.user?.id,
                type: 'settings_reset',
                message: 'System settings reset to defaults',
                severity: 'warning'
            }
        });
        res.json({
            success: true,
            data: systemSettings,
            message: 'Settings reset to defaults'
        });
    }
    catch (error) {
        console.error('Error resetting settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset settings'
        });
    }
});
router.get('/settings/health', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const dbConnected = await prisma.$queryRaw `SELECT 1 as test`;
        const systemInfo = {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            database: {
                connected: !!dbConnected,
                status: dbConnected ? 'healthy' : 'disconnected'
            },
            environment: process.env.NODE_ENV || 'development'
        };
        res.json({
            success: true,
            data: systemInfo
        });
    }
    catch (error) {
        console.error('Error getting system health:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get system health'
        });
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map