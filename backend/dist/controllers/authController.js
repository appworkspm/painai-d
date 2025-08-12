"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegister = exports.forgotPassword = exports.refreshToken = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const database_1 = require("../utils/database");
const auth_1 = require("../utils/auth");
const crypto_1 = __importDefault(require("crypto"));
const register = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { email, password, name, role } = req.body;
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
            return;
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const user = await database_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'USER'
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        const { accessToken, refreshToken, expiresIn } = (0, auth_1.generateTokenPair)(user);
        await database_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                accessToken,
                refreshToken,
                expiresIn
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { email, password } = req.body;
        console.log('Login attempt:', { email });
        const user = await database_1.prisma.user.findUnique({
            where: { email }
        });
        console.log('User found:', user);
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        const isPasswordValid = await (0, auth_1.comparePassword)(password, user.password);
        console.log('Password valid:', isPasswordValid);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        const { accessToken, refreshToken, expiresIn } = (0, auth_1.generateTokenPair)(user);
        console.log('Token pair generated:', { accessToken, refreshToken, expiresIn });
        try {
            await database_1.prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            });
        }
        catch (err) {
            console.error('Error creating refresh token:', err);
            throw err;
        }
        try {
            await database_1.prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() }
            });
        }
        catch (err) {
            console.error('Error updating last login:', err);
            throw err;
        }
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
                accessToken,
                refreshToken,
                expiresIn
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : error
        });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: user
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        const { name, currentPassword, newPassword } = req.body;
        const updateData = {};
        if (name) {
            updateData.name = name;
        }
        if (newPassword) {
            if (!currentPassword) {
                res.status(400).json({
                    success: false,
                    message: 'Current password is required to change password'
                });
                return;
            }
            const isCurrentPasswordValid = await (0, auth_1.comparePassword)(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
                return;
            }
            updateData.password = await (0, auth_1.hashPassword)(newPassword);
        }
        if (!name && !newPassword) {
            res.status(400).json({
                success: false,
                message: 'No data to update'
            });
            return;
        }
        const updatedUser = await database_1.prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateProfile = updateProfile;
const refreshToken = async (req, res) => {
    try {
        console.log('Refresh token request received:', req.body);
        const { refreshToken } = req.body;
        if (!refreshToken) {
            console.log('No refresh token provided');
            res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
            return;
        }
        console.log('Looking up refresh token in database...');
        const storedToken = await database_1.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });
        console.log('Stored token found:', !!storedToken);
        const now = new Date();
        const isTokenExpired = storedToken && storedToken.expiresAt < now;
        if (!storedToken || storedToken.revoked || isTokenExpired) {
            console.log('Invalid or expired token. Revoked:', storedToken?.revoked, 'Expired:', isTokenExpired);
            if (storedToken) {
                await database_1.prisma.refreshToken.delete({
                    where: { id: storedToken.id }
                });
            }
            res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
                code: 'INVALID_REFRESH_TOKEN'
            });
            return;
        }
        if (!storedToken.user || !storedToken.user.isActive) {
            console.log('User not found or inactive');
            await database_1.prisma.refreshToken.deleteMany({
                where: { userId: storedToken.userId }
            });
            res.status(401).json({
                success: false,
                message: 'User account is no longer active',
                code: 'USER_INACTIVE'
            });
            return;
        }
        console.log('Generating new token pair...');
        const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } = (0, auth_1.generateTokenPair)(storedToken.user);
        console.log('Deleting old refresh token...');
        await database_1.prisma.refreshToken.delete({
            where: { id: storedToken.id }
        });
        console.log('Creating new refresh token...');
        await database_1.prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: storedToken.userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                revoked: false
            }
        });
        console.log('Tokens refreshed successfully');
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiresIn
            }
        });
    }
    catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error',
            code: 'INTERNAL_SERVER_ERROR'
        });
    }
};
exports.refreshToken = refreshToken;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required'
            });
            return;
        }
        const user = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent'
            });
            return;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        await database_1.prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });
        console.log(`Password reset link for ${email}: http://localhost:3000/reset-password?token=${resetToken}`);
        res.json({
            success: true,
            message: 'Password reset link has been sent to your email'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.forgotPassword = forgotPassword;
exports.validateRegister = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('role').optional().isIn(['ADMIN', 'MANAGER', 'USER']).withMessage('Invalid role')
];
exports.validateLogin = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
];
//# sourceMappingURL=authController.js.map