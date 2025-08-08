"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const execAsync = (0, util_1.promisify)(child_process_1.exec);
router.get('/database/status', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const dbConnected = await prisma.$queryRaw `SELECT 1 as test`;
        const dbInfo = await prisma.$queryRaw `
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as size,
        (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count
    `;
        const backupDir = path_1.default.join(process.cwd(), 'backups');
        let lastBackup = null;
        let backupCount = 0;
        if (fs_1.default.existsSync(backupDir)) {
            const files = fs_1.default.readdirSync(backupDir).filter(file => file.endsWith('.sql'));
            backupCount = files.length;
            if (files.length > 0) {
                const latestFile = files.sort().reverse()[0];
                const stats = fs_1.default.statSync(path_1.default.join(backupDir, latestFile));
                lastBackup = {
                    filename: latestFile,
                    createdAt: stats.mtime,
                    size: stats.size
                };
            }
        }
        const uptime = process.uptime();
        const uptimeDays = Math.floor(uptime / (24 * 60 * 60));
        res.json({
            success: true,
            data: {
                status: dbConnected ? 'healthy' : 'disconnected',
                size: dbInfo[0]?.size || 'Unknown',
                tables: parseInt(dbInfo[0]?.table_count) || 0,
                lastBackup: lastBackup ? {
                    filename: lastBackup.filename,
                    createdAt: lastBackup.createdAt.toISOString(),
                    size: `${(lastBackup.size / 1024 / 1024).toFixed(2)} MB`
                } : null,
                uptime: `${uptimeDays} days`,
                backupCount
            }
        });
    }
    catch (error) {
        console.error('Error getting database status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get database status'
        });
    }
});
router.get('/database/backups', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const backupDir = path_1.default.join(process.cwd(), 'backups');
        const backups = [];
        if (fs_1.default.existsSync(backupDir)) {
            const files = fs_1.default.readdirSync(backupDir).filter(file => file.endsWith('.sql'));
            for (const file of files) {
                const filePath = path_1.default.join(backupDir, file);
                const stats = fs_1.default.statSync(filePath);
                backups.push({
                    id: file.replace('.sql', ''),
                    filename: file,
                    size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
                    createdAt: stats.mtime.toISOString(),
                    status: 'completed'
                });
            }
        }
        backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.json({
            success: true,
            data: backups
        });
    }
    catch (error) {
        console.error('Error getting backups:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get backups'
        });
    }
});
router.post('/database/backup', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const backupDir = path_1.default.join(process.cwd(), 'backups');
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `backup_${timestamp}.sql`;
        const filePath = path_1.default.join(backupDir, filename);
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return res.status(500).json({
                success: false,
                message: 'Database URL not configured'
            });
        }
        const url = new URL(databaseUrl);
        const host = url.hostname;
        const port = url.port || '5432';
        const database = url.pathname.slice(1);
        const username = url.username;
        const password = url.password;
        const pgDumpCmd = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f "${filePath}"`;
        await execAsync(pgDumpCmd);
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error('Backup file was not created');
        }
        const stats = fs_1.default.statSync(filePath);
        const backupInfo = {
            id: filename.replace('.sql', ''),
            filename,
            size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
            createdAt: stats.mtime.toISOString(),
            status: 'completed'
        };
        res.status(201).json({
            success: true,
            data: backupInfo,
            message: 'Database backup created successfully'
        });
    }
    catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create backup'
        });
    }
});
router.post('/database/restore/:backupId', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { backupId } = req.params;
        const backupDir = path_1.default.join(process.cwd(), 'backups');
        const filename = `${backupId}.sql`;
        const filePath = path_1.default.join(backupDir, filename);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup file not found'
            });
        }
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return res.status(500).json({
                success: false,
                message: 'Database URL not configured'
            });
        }
        const url = new URL(databaseUrl);
        const host = url.hostname;
        const port = url.port || '5432';
        const database = url.pathname.slice(1);
        const username = url.username;
        const password = url.password;
        const psqlCmd = `PGPASSWORD="${password}" psql -h ${host} -p ${port} -U ${username} -d ${database} -f "${filePath}"`;
        await execAsync(psqlCmd);
        res.json({
            success: true,
            message: 'Database restored successfully'
        });
    }
    catch (error) {
        console.error('Error restoring backup:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore backup'
        });
    }
});
router.delete('/database/backup/:backupId', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { backupId } = req.params;
        const backupDir = path_1.default.join(process.cwd(), 'backups');
        const filename = `${backupId}.sql`;
        const filePath = path_1.default.join(backupDir, filename);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup file not found'
            });
        }
        fs_1.default.unlinkSync(filePath);
        res.json({
            success: true,
            message: 'Backup deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting backup:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete backup'
        });
    }
});
exports.default = router;
//# sourceMappingURL=database.js.map