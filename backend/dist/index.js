"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const database_1 = require("./utils/database");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const projects_1 = __importDefault(require("./routes/projects"));
const timesheets_1 = __importDefault(require("./routes/timesheets"));
const reports_1 = __importDefault(require("./routes/reports"));
const activityLogs_1 = __importDefault(require("./routes/activityLogs"));
const holidays_1 = __importDefault(require("./routes/holidays"));
const projectProgress_1 = __importDefault(require("./routes/projectProgress"));
const costRequests_1 = __importDefault(require("./routes/costRequests"));
const projectCosts_1 = __importDefault(require("./routes/projectCosts"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const activities_1 = __importDefault(require("./routes/activities"));
const roles_1 = __importDefault(require("./routes/roles"));
const database_2 = __importDefault(require("./routes/database"));
const settings_1 = __importDefault(require("./routes/settings"));
const calendar_1 = __importDefault(require("./routes/calendar"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const userActivities_1 = __importDefault(require("./routes/userActivities"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
const security_1 = require("./middleware/security");
app.use(security_1.securityMiddleware);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.get('/health', async (req, res) => {
    try {
        const dbConnected = await (0, database_1.checkDatabaseConnection)();
        res.json({
            status: dbConnected ? 'OK' : 'WARNING',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            database: {
                connected: dbConnected,
                status: dbConnected ? 'healthy' : 'disconnected'
            }
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            database: {
                connected: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error)
            }
        });
    }
});
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/timesheets', timesheets_1.default);
app.use('/api/users', users_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/activities', activities_1.default);
app.use('/api/activity-logs', activityLogs_1.default);
app.use('/api/holidays', holidays_1.default);
app.use('/api/project-progress', projectProgress_1.default);
app.use('/api/project-costs', projectCosts_1.default);
app.use('/api/cost-requests', costRequests_1.default);
app.use('/api/roles', roles_1.default);
app.use('/api/database', database_2.default);
app.use('/api/settings', settings_1.default);
app.use('/api/calendar', calendar_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/user-activities', userActivities_1.default);
app.get('/api', (req, res) => {
    res.json({
        message: 'Painai API v1.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            projects: '/api/projects',
            timesheets: '/api/timesheets',
            reports: '/api/reports',
            activities: '/api/activities',
            holidays: '/api/holidays',
            projectProgress: '/api/project-progress',
            costRequests: '/api/cost-requests',
            projectCosts: '/api/project-costs',
            dashboard: '/api/dashboard',
            activityLogs: '/api/activity-logs',
            roles: '/api/roles',
            database: '/api/database',
            settings: '/api/settings'
        }
    });
});
const frontendPath = path_1.default.join(__dirname, '../frontend');
const indexPath = path_1.default.join(frontendPath, 'index.html');
if (process.env.NODE_ENV === 'production') {
    try {
        const fs = require('fs');
        if (!fs.existsSync(indexPath)) {
            console.warn('⚠️  Frontend build not found. API-only mode enabled.');
            console.warn('📁 Expected path:', indexPath);
            console.warn('💡 Make sure to run the build script before deployment.');
        }
        else {
            app.use(express_1.default.static(frontendPath));
        }
    }
    catch (error) {
        console.warn('⚠️  Could not check frontend build:', error);
    }
}
else {
    try {
        const fs = require('fs');
        if (fs.existsSync(indexPath)) {
            app.use(express_1.default.static(frontendPath));
        }
    }
    catch (error) {
    }
}
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return (0, notFoundHandler_1.notFoundHandler)(req, res);
    }
    try {
        const fs = require('fs');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        }
        else {
            res.status(404).json({
                success: false,
                message: 'Frontend build not found. Please ensure the frontend has been built and copied to the backend directory.',
                expectedPath: indexPath,
                suggestion: 'Run the build script: ./scripts/build-for-deployment.sh'
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error serving frontend',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const server = app.listen(PORT, async () => {
    console.log(`🚀 Painai API server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    let retries = 5;
    while (retries > 0) {
        try {
            await (0, database_1.connectDatabase)();
            break;
        }
        catch (error) {
            retries--;
            console.error(`❌ Database connection failed. Retries left: ${retries}`);
            if (retries === 0) {
                console.error('❌ Failed to connect to database after all retries. Exiting...');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    setInterval(async () => {
        const isConnected = await (0, database_1.checkDatabaseConnection)();
        if (!isConnected) {
            console.warn('⚠️ Database connection lost, attempting to reconnect...');
            try {
                await (0, database_1.connectDatabase)();
                console.log('✅ Database reconnected successfully');
            }
            catch (error) {
                console.error('❌ Failed to reconnect to database:', error);
            }
        }
    }, 30000);
});
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(async () => {
        await (0, database_1.disconnectDatabase)();
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(async () => {
        await (0, database_1.disconnectDatabase)();
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map