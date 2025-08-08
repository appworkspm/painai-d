"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = require("../utils/database");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', auth_1.requireAdmin, async (req, res) => {
    try {
        const users = await database_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                position: true,
                employeeCode: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});
router.get('/:id', auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await database_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                position: true,
                employeeCode: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        return res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user'
        });
    }
});
router.post('/', auth_1.requireAdmin, async (req, res) => {
    try {
        const { email, name, password, role, position, employeeCode } = req.body;
        if (!email || !name || !password || !role || !employeeCode) {
            return res.status(400).json({
                success: false,
                message: 'Email, name, password, role, and employee code are required'
            });
        }
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await database_1.prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role,
                isActive: true,
                position,
                employeeCode
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                position: true,
                employeeCode: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return res.status(201).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create user'
        });
    }
});
router.put('/:id', auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, role, isActive, position, employeeCode } = req.body;
        const updateData = {};
        if (email)
            updateData.email = email;
        if (name)
            updateData.name = name;
        if (role)
            updateData.role = role;
        if (typeof isActive === 'boolean')
            updateData.isActive = isActive;
        if (position !== undefined)
            updateData.position = position;
        if (employeeCode !== undefined)
            updateData.employeeCode = employeeCode;
        const user = await database_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                position: true,
                employeeCode: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
});
router.delete('/:id', auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await database_1.prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        await database_1.prisma.user.update({
            where: { id },
            data: { isActive: false }
        });
        return res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});
router.get('/stats/overview', auth_1.requireAdmin, async (req, res) => {
    try {
        const [totalUsers, activeUsers, vpUsers, adminUsers, managerUsers, regularUsers] = await Promise.all([
            database_1.prisma.user.count(),
            database_1.prisma.user.count({ where: { isActive: true } }),
            database_1.prisma.user.count({ where: { role: 'VP' } }),
            database_1.prisma.user.count({ where: { role: 'ADMIN' } }),
            database_1.prisma.user.count({ where: { role: 'MANAGER' } }),
            database_1.prisma.user.count({ where: { role: 'USER' } })
        ]);
        return res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                vpUsers,
                adminUsers,
                managerUsers,
                regularUsers,
                inactiveUsers: totalUsers - activeUsers
            }
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});
router.get('/roles', auth_1.requireAdmin, (req, res) => {
    res.json({
        success: true,
        data: ['VP', 'ADMIN', 'MANAGER', 'USER']
    });
});
exports.default = router;
//# sourceMappingURL=users.js.map