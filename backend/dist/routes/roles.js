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
router.get('/roles', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch roles'
        });
    }
});
router.get('/permissions', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const permissions = await prisma.permission.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({
            success: true,
            data: permissions
        });
    }
    catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch permissions'
        });
    }
});
router.post('/roles', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        if (!name || !permissions || !Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message: 'Name and permissions array are required'
            });
        }
        const existingRole = await prisma.role.findUnique({
            where: { name }
        });
        if (existingRole) {
            return res.status(400).json({
                success: false,
                message: 'Role name already exists'
            });
        }
        const role = await prisma.role.create({
            data: {
                name,
                description,
                permissions: {
                    create: permissions.map((permissionId) => ({
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
    }
    catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create role'
        });
    }
});
router.put('/roles/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;
        if (!name || !permissions || !Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message: 'Name and permissions array are required'
            });
        }
        const existingRole = await prisma.role.findUnique({
            where: { id }
        });
        if (!existingRole) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }
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
        const role = await prisma.role.update({
            where: { id },
            data: {
                name,
                description,
                permissions: {
                    deleteMany: {},
                    create: permissions.map((permissionId) => ({
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
    }
    catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update role'
        });
    }
});
router.delete('/roles/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
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
        if (existingRole.users.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete role that is assigned to users'
            });
        }
        await prisma.role.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Role deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete role'
        });
    }
});
exports.default = router;
//# sourceMappingURL=roles.js.map