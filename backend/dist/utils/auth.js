"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenBlacklisted = exports.addToBlacklist = exports.isUser = exports.isManager = exports.isAdmin = exports.hasPermission = exports.extractTokenFromHeader = exports.verifyToken = exports.generateAccessToken = exports.generateTokenPair = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'b7e2c1a4e8f3d9b6c2a7e4f1b3d8c6a1e9f2b4c7d1a6e3f8b2c5d7e1a3f6b9c4';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const REFRESH_TOKEN_BYTES = 32;
const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generateRefreshToken = () => {
    return (0, crypto_1.randomBytes)(REFRESH_TOKEN_BYTES).toString('hex');
};
const generateTokenPair = (user) => {
    const accessToken = (0, exports.generateAccessToken)(user);
    const refreshToken = generateRefreshToken();
    return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60
    };
};
exports.generateTokenPair = generateTokenPair;
const generateAccessToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
    };
    const options = {
        expiresIn: JWT_ACCESS_EXPIRES_IN
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
};
exports.generateAccessToken = generateAccessToken;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof decoded === 'string' || !('id' in decoded)) {
            throw new Error('Invalid token payload');
        }
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Token expired');
        }
        throw new Error('Invalid token');
    }
};
exports.verifyToken = verifyToken;
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) {
        throw new Error('Authorization header is required');
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        throw new Error('Invalid authorization header format');
    }
    const token = parts[1];
    if (!token) {
        throw new Error('No token provided');
    }
    return token;
};
exports.extractTokenFromHeader = extractTokenFromHeader;
const hasPermission = (userRole, requiredRole) => {
    const roleHierarchy = {
        'VP': 4,
        'ADMIN': 3,
        'MANAGER': 2,
        'USER': 1
    };
    const userRank = roleHierarchy[userRole] || 0;
    const requiredRank = roleHierarchy[requiredRole] || 0;
    return userRank >= requiredRank;
};
exports.hasPermission = hasPermission;
const isAdmin = (role) => role === 'ADMIN' || role === 'VP';
exports.isAdmin = isAdmin;
const isManager = (role) => ['ADMIN', 'MANAGER', 'VP'].includes(role);
exports.isManager = isManager;
const isUser = (role) => !!role;
exports.isUser = isUser;
const tokenBlacklist = new Set();
const addToBlacklist = (token) => {
    tokenBlacklist.add(token);
};
exports.addToBlacklist = addToBlacklist;
const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};
exports.isTokenBlacklisted = isTokenBlacklisted;
//# sourceMappingURL=auth.js.map