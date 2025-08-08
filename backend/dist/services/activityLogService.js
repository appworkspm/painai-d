"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const database_1 = require("../utils/database");
const logActivity = async ({ userId, type, message, severity = 'info', }) => {
    return database_1.prisma.activityLog.create({
        data: { userId, type, message, severity },
    });
};
exports.logActivity = logActivity;
//# sourceMappingURL=activityLogService.js.map