import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, IAuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// In-memory settings store (in production, use database or config file)
let systemSettings = {
  systemName: 'ไปไหน (Painai)',
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  maintenanceMode: false,
  emailNotifications: true,
  backupFrequency: 'daily',
  retentionDays: 30
};

/**
 * @route GET /settings
 * @description Get system settings
 * @middleware authenticate, requireAdmin
 */
router.get('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      data: systemSettings
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings'
    });
  }
});

/**
 * @route PUT /settings
 * @description Update system settings
 * @middleware authenticate, requireAdmin
 */
router.put('/settings', authenticate, requireAdmin, async (req: IAuthenticatedRequest, res) => {
  try {
    const { 
      systemName, 
      sessionTimeout, 
      maxLoginAttempts, 
      maintenanceMode,
      emailNotifications,
      backupFrequency,
      retentionDays
    } = req.body;

    // Validate input
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

    // Update settings
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

    // Log the settings change
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
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

/**
 * @route POST /settings/reset
 * @description Reset system settings to defaults
 * @middleware authenticate, requireAdmin
 */
router.post('/settings/reset', authenticate, requireAdmin, async (req: IAuthenticatedRequest, res) => {
  try {
    // Reset to default settings
    systemSettings = {
      systemName: 'ไปไหน (Painai)',
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      maintenanceMode: false,
      emailNotifications: true,
      backupFrequency: 'daily',
      retentionDays: 30
    };

    // Log the reset
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
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings'
    });
  }
});

/**
 * @route GET /settings/health
 * @description Get system health information
 * @middleware authenticate, requireAdmin
 */
router.get('/settings/health', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get database connection status
    const dbConnected = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Get system information
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
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system health'
    });
  }
});

export default router; 