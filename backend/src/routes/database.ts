import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();
const execAsync = promisify(exec);

/**
 * @route GET /database/status
 * @description Get database status and information
 * @middleware authenticate, requireAdmin
 */
router.get('/database/status', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get database connection status
    const dbConnected = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Get database size and table count
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as size,
        (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count
    `;

    // Get last backup info
    const backupDir = path.join(process.cwd(), 'backups');
    let lastBackup = null;
    let backupCount = 0;

    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.sql'));
      backupCount = files.length;
      
      if (files.length > 0) {
        const latestFile = files.sort().reverse()[0];
        const stats = fs.statSync(path.join(backupDir, latestFile));
        lastBackup = {
          filename: latestFile,
          createdAt: stats.mtime,
          size: stats.size
        };
      }
    }

    // Get uptime (simplified - in production you'd want to track this properly)
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
  } catch (error) {
    console.error('Error getting database status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get database status'
    });
  }
});

/**
 * @route GET /database/backups
 * @description Get list of available backups
 * @middleware authenticate, requireAdmin
 */
router.get('/database/backups', authenticate, requireAdmin, async (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    const backups = [];

    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.sql'));
      
      for (const file of files) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        
        backups.push({
          id: file.replace('.sql', ''),
          filename: file,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          createdAt: stats.mtime.toISOString(),
          status: 'completed'
        });
      }
    }

    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('Error getting backups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backups'
    });
  }
});

/**
 * @route POST /database/backup
 * @description Create a new database backup
 * @middleware authenticate, requireAdmin
 */
router.post('/database/backup', authenticate, requireAdmin, async (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `backup_${timestamp}.sql`;
    const filePath = path.join(backupDir, filename);

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({
        success: false,
        message: 'Database URL not configured'
      });
    }

    // Parse database URL to get connection details
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = url.port || '5432';
    const database = url.pathname.slice(1);
    const username = url.username;
    const password = url.password;

    // Create pg_dump command
    const pgDumpCmd = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f "${filePath}"`;

    // Execute backup
    await execAsync(pgDumpCmd);

    // Verify backup was created
    if (!fs.existsSync(filePath)) {
      throw new Error('Backup file was not created');
    }

    const stats = fs.statSync(filePath);
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
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup'
    });
  }
});

/**
 * @route POST /database/restore/:backupId
 * @description Restore database from backup
 * @middleware authenticate, requireAdmin
 */
router.post('/database/restore/:backupId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { backupId } = req.params;
    const backupDir = path.join(process.cwd(), 'backups');
    const filename = `${backupId}.sql`;
    const filePath = path.join(backupDir, filename);

    // Check if backup file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({
        success: false,
        message: 'Database URL not configured'
      });
    }

    // Parse database URL to get connection details
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = url.port || '5432';
    const database = url.pathname.slice(1);
    const username = url.username;
    const password = url.password;

    // Create psql restore command
    const psqlCmd = `PGPASSWORD="${password}" psql -h ${host} -p ${port} -U ${username} -d ${database} -f "${filePath}"`;

    // Execute restore
    await execAsync(psqlCmd);

    res.json({
      success: true,
      message: 'Database restored successfully'
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore backup'
    });
  }
});

/**
 * @route DELETE /database/backup/:backupId
 * @description Delete a backup file
 * @middleware authenticate, requireAdmin
 */
router.delete('/database/backup/:backupId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { backupId } = req.params;
    const backupDir = path.join(process.cwd(), 'backups');
    const filename = `${backupId}.sql`;
    const filePath = path.join(backupDir, filename);

    // Check if backup file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    // Delete backup file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete backup'
    });
  }
});

export default router; 