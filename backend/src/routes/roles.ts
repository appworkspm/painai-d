import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route GET /roles
 * @description Get all roles with their permissions
 * @middleware authenticate, requireAdmin
 */
router.get('/roles', authenticate, requireAdmin, async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(rp => rp.permission),
        userCount: role.users.length
      }))
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles'
    });
  }
});

/**
 * @route GET /permissions
 * @description Get all available permissions
 * @middleware authenticate, requireAdmin
 */
router.get('/permissions', authenticate, requireAdmin, async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions'
    });
  }
});

/**
 * @route POST /roles
 * @description Create a new role
 * @middleware authenticate, requireAdmin
 */
router.post('/roles', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Validate required fields
    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Name and permissions array are required'
      });
    }

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }

    // Create role with permissions
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissions.map((permissionId: string) => ({
            permission: {
              connect: { id: permissionId }
            }
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(rp => rp.permission)
      }
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create role'
    });
  }
});

/**
 * @route PUT /roles/:id
 * @description Update a role
 * @middleware authenticate, requireAdmin
 */
router.put('/roles/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Validate required fields
    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Name and permissions array are required'
      });
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if new name conflicts with other roles
    const nameConflict = await prisma.role.findFirst({
      where: {
        name,
        id: { not: id }
      }
    });

    if (nameConflict) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }

    // Update role and permissions
    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions: {
          deleteMany: {},
          create: permissions.map((permissionId: string) => ({
            permission: {
              connect: { id: permissionId }
            }
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(rp => rp.permission)
      }
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role'
    });
  }
});

/**
 * @route DELETE /roles/:id
 * @description Delete a role
 * @middleware authenticate, requireAdmin
 */
router.delete('/roles/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        users: true
      }
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if role is assigned to any users
    if (existingRole.users.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete role that is assigned to users'
      });
    }

    // Delete role (permissions will be deleted automatically due to cascade)
    await prisma.role.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete role'
    });
  }
});

export default router; 