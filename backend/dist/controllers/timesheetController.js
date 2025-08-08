"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTimesheetHistory = exports.getTimesheetHistory = exports.rejectTimesheet = exports.approveTimesheet = exports.submitTimesheet = exports.deleteTimesheet = exports.updateTimesheet = exports.createTimesheet = exports.getAllTimesheets = exports.getPendingTimesheets = exports.getMyTimesheets = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getMyTimesheets = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status, project_id, start_date, end_date } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = { user_id: userId };
        if (status)
            where.status = status;
        if (project_id)
            where.project_id = project_id;
        if (start_date && end_date) {
            where.date = {
                gte: new Date(start_date),
                lte: new Date(end_date),
            };
        }
        const [timesheets, total] = await Promise.all([
            prisma.timesheet.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        },
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    approver: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { date: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.timesheet.count({ where }),
        ]);
        res.json({
            success: true,
            data: timesheets,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get my timesheets error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMyTimesheets = getMyTimesheets;
const getPendingTimesheets = async (req, res) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        let where = { status: 'submitted' };
        if (user.role === 'MANAGER') {
            const managedProjects = await prisma.project.findMany({
                where: { managerId: user.id },
                select: { id: true }
            });
            const managedProjectIds = managedProjects.map(p => p.id);
            where.project_id = { in: managedProjectIds };
        }
        const [timesheets, total] = await Promise.all([
            prisma.timesheet.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        },
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { submitted_at: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.timesheet.count({ where }),
        ]);
        res.json({
            success: true,
            data: timesheets,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get pending timesheets error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPendingTimesheets = getPendingTimesheets;
const getAllTimesheets = async (req, res) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10, status, project_id, user_id, start_date, end_date, month, year } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (user.role === 'ADMIN') {
        }
        else if (user.role === 'MANAGER') {
            const managedProjects = await prisma.project.findMany({
                where: { managerId: user.id },
                select: { id: true }
            });
            const managedProjectIds = managedProjects.map(p => p.id);
            where.OR = [
                { user_id: user.id },
                {
                    project_id: { in: managedProjectIds }
                }
            ];
        }
        else {
            where.user_id = user.id;
        }
        if (status)
            where.status = status;
        if (project_id)
            where.project_id = project_id;
        if (user_id && user.role === 'ADMIN')
            where.user_id = user_id;
        if (start_date && end_date) {
            where.date = {
                gte: new Date(start_date),
                lte: new Date(end_date),
            };
        }
        else if (month && year) {
            const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
            const endOfMonth = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
            where.date = {
                gte: startOfMonth,
                lte: endOfMonth,
            };
        }
        const [timesheets, total] = await Promise.all([
            prisma.timesheet.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    project: { select: { id: true, name: true } },
                    approver: { select: { id: true, name: true } },
                },
                orderBy: { date: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.timesheet.count({ where }),
        ]);
        res.json({
            success: true,
            data: timesheets,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get all timesheets error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllTimesheets = getAllTimesheets;
const createTimesheet = async (req, res) => {
    try {
        const userId = req.user.id;
        const { project_id, work_type = 'PROJECT', sub_work_type = 'SOFTWARE', activity, date, hours_worked, overtime_hours = 0, description, billable = true, hourly_rate, status = 'draft' } = req.body;
        const existingTimesheet = await prisma.timesheet.findFirst({
            where: {
                user_id: userId,
                project_id: project_id || null,
                date: new Date(date),
                work_type,
                sub_work_type,
            },
        });
        if (existingTimesheet) {
            res.status(400).json({
                message: 'Timesheet already exists for this date, project, and work type'
            });
            return;
        }
        const timesheet = await prisma.timesheet.create({
            data: {
                user_id: userId,
                project_id: project_id || null,
                work_type,
                sub_work_type,
                activity,
                date: new Date(date),
                hours_worked,
                overtime_hours,
                description,
                status,
                billable,
                hourly_rate,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
            },
        });
        res.status(201).json({
            message: 'Timesheet created successfully',
            timesheet,
        });
    }
    catch (error) {
        console.error('Create timesheet error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createTimesheet = createTimesheet;
const updateTimesheet = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updateData = req.body;
        const existingTimesheet = await prisma.timesheet.findFirst({
            where: { id, user_id: userId }
        });
        if (!existingTimesheet) {
            res.status(404).json({ message: 'Timesheet not found' });
            return;
        }
        if (existingTimesheet.status !== 'draft') {
            res.status(400).json({
                message: 'Cannot update timesheet that is already submitted or approved'
            });
            return;
        }
        const timesheet = await prisma.timesheet.update({
            where: { id },
            data: updateData,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
            },
        });
        await prisma.timesheetEditHistory.create({
            data: {
                timesheetId: id,
                userId,
                action: 'edit',
                oldValue: existingTimesheet,
                newValue: updateData,
                createdAt: new Date(),
            },
        });
        res.json({
            message: 'Timesheet updated successfully',
            timesheet,
        });
    }
    catch (error) {
        console.error('Update timesheet error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateTimesheet = updateTimesheet;
const deleteTimesheet = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const existingTimesheet = await prisma.timesheet.findFirst({
            where: { id, user_id: userId }
        });
        if (!existingTimesheet) {
            res.status(404).json({ message: 'Timesheet not found' });
            return;
        }
        if (existingTimesheet.status !== 'draft') {
            res.status(400).json({
                message: 'Cannot delete timesheet that is already submitted or approved'
            });
            return;
        }
        await prisma.timesheet.delete({
            where: { id }
        });
        res.json({ message: 'Timesheet deleted successfully' });
    }
    catch (error) {
        console.error('Delete timesheet error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteTimesheet = deleteTimesheet;
const submitTimesheet = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const existingTimesheet = await prisma.timesheet.findFirst({
            where: { id, user_id: userId }
        });
        if (!existingTimesheet) {
            res.status(404).json({ message: 'Timesheet not found' });
            return;
        }
        if (existingTimesheet.status !== 'draft') {
            res.status(400).json({
                message: 'Timesheet is already submitted or approved'
            });
            return;
        }
        const timesheet = await prisma.timesheet.update({
            where: { id },
            data: {
                status: 'submitted',
                submitted_at: new Date(),
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
            },
        });
        await prisma.timesheetEditHistory.create({
            data: {
                timesheetId: id,
                userId,
                action: 'submit',
                oldValue: existingTimesheet,
                newValue: { status: 'submitted' },
                createdAt: new Date(),
            },
        });
        res.json({
            message: 'Timesheet submitted successfully',
            timesheet,
        });
    }
    catch (error) {
        console.error('Submit timesheet error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.submitTimesheet = submitTimesheet;
const approveTimesheet = async (req, res) => {
    try {
        const approverId = req.user.id;
        const { id } = req.params;
        const { rejection_reason } = req.body;
        const existingTimesheet = await prisma.timesheet.findFirst({
            where: { id }
        });
        if (!existingTimesheet) {
            res.status(404).json({ message: 'Timesheet not found' });
            return;
        }
        if (existingTimesheet.status !== 'submitted') {
            res.status(400).json({
                message: 'Timesheet is not in submitted status'
            });
            return;
        }
        const updateData = {
            status: 'approved',
            approved_by: approverId,
            approved_at: new Date(),
        };
        const timesheet = await prisma.timesheet.update({
            where: { id },
            data: updateData,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                approver: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        await prisma.timesheetEditHistory.create({
            data: {
                timesheetId: id,
                userId: approverId,
                action: 'approve',
                oldValue: existingTimesheet,
                newValue: updateData,
                createdAt: new Date(),
            },
        });
        res.json({
            message: `Timesheet approved successfully`,
            timesheet,
        });
    }
    catch (error) {
        console.error('Approve timesheet error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.approveTimesheet = approveTimesheet;
const rejectTimesheet = async (req, res) => {
    try {
        const approverId = req.user.id;
        const { id } = req.params;
        const { rejection_reason } = req.body;
        const existingTimesheet = await prisma.timesheet.findFirst({
            where: { id }
        });
        if (!existingTimesheet) {
            res.status(404).json({ message: 'Timesheet not found' });
            return;
        }
        if (existingTimesheet.status !== 'submitted') {
            res.status(400).json({
                message: 'Timesheet is not in submitted status'
            });
            return;
        }
        const updateData = {
            status: 'rejected',
            approved_by: approverId,
            approved_at: new Date(),
            rejection_reason: rejection_reason || null
        };
        const timesheet = await prisma.timesheet.update({
            where: { id },
            data: updateData,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                approver: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        await prisma.timesheetEditHistory.create({
            data: {
                timesheetId: id,
                userId: approverId,
                action: 'reject',
                oldValue: existingTimesheet,
                newValue: updateData,
                createdAt: new Date(),
            },
        });
        res.json({
            message: 'Timesheet rejected successfully',
            timesheet,
        });
    }
    catch (error) {
        console.error('Reject timesheet error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.rejectTimesheet = rejectTimesheet;
const getTimesheetHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await prisma.timesheetEditHistory.findMany({
            where: { timesheetId: id },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: history });
    }
    catch (error) {
        console.error('Get timesheet history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getTimesheetHistory = getTimesheetHistory;
const getUserTimesheetHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status, project_id, month, year } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = { user_id: userId };
        if (status)
            where.status = status;
        if (project_id)
            where.project_id = project_id;
        if (month && year) {
            const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
            const endOfMonth = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
            where.date = {
                gte: startOfMonth,
                lte: endOfMonth,
            };
        }
        const [timesheets, total] = await Promise.all([
            prisma.timesheet.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    project: { select: { id: true, name: true } },
                    approver: { select: { id: true, name: true } },
                },
                orderBy: { date: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.timesheet.count({ where }),
        ]);
        res.json({
            success: true,
            data: timesheets,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get user timesheet history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserTimesheetHistory = getUserTimesheetHistory;
//# sourceMappingURL=timesheetController.js.map