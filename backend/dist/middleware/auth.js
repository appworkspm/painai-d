"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.requireUser = exports.requireManager = exports.requireAdmin = exports.requireRole = exports.authenticate = void 0;
const auth_1 = require("../utils/auth");
const database_1 = require("../utils/database");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'Access token required'
            });
            return;
        }
        const token = (0, auth_1.extractTokenFromHeader)(authHeader);
        const decoded = (0, auth_1.verifyToken)(token);
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.id },
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
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};
exports.authenticate = authenticate;
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const userRole = req.user.role;
        const hasAccess = userRole === 'VP' ? true :
            requiredRole === 'ADMIN' ? userRole === 'ADMIN' :
                requiredRole === 'MANAGER' ? ['ADMIN', 'MANAGER'].includes(userRole) :
                    true;
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)('ADMIN');
exports.requireManager = (0, exports.requireRole)('MANAGER');
exports.requireUser = (0, exports.requireRole)('USER');
exports.requireAuth = exports.authenticate;
//# sourceMappingURL=auth.js.map