"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUser = exports.isManager = exports.isAdmin = exports.hasPermission = exports.extractTokenFromHeader = exports.verifyToken = exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'b7e2c1a4e8f3d9b6c2a7e4f1b3d8c6a1e9f2b4c7d1a6e3f8b2c5d7e1a3f6b9c4';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
    };
    const options = { expiresIn: JWT_EXPIRES_IN };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error('Invalid token');
    }
};
exports.verifyToken = verifyToken;
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Invalid authorization header');
    }
    return authHeader.substring(7);
};
exports.extractTokenFromHeader = extractTokenFromHeader;
const hasPermission = (userRole, requiredRole) => {
    const roleHierarchy = {
        'VP': 4,
        'ADMIN': 3,
        'MANAGER': 2,
        'USER': 1
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
exports.hasPermission = hasPermission;
const isAdmin = (role) => role === 'ADMIN' || role === 'VP';
exports.isAdmin = isAdmin;
const isManager = (role) => ['ADMIN', 'MANAGER', 'VP'].includes(role);
exports.isManager = isManager;
const isUser = (role) => true;
exports.isUser = isUser;
//# sourceMappingURL=auth.js.map