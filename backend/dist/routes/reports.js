"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = require("../utils/database");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/export/timesheet/csv', async (req, res) => {
    try {
        const { start, end, status, project, workType, subWorkType, activity } = req.query;
        const where = {};
        if (start && end) {
            where.date = {
                gte: new Date(start),
                lte: new Date(end)
            };
        }
        if (status && status !== 'all') {
            where.status = status.toString().toUpperCase();
        }
        if (project && project !== 'all') {
            where.project_id = project;
        }
        if (workType && workType !== 'all') {
            where.work_type = workType;
        }
        if (subWorkType && subWorkType !== 'all') {
            where.sub_work_type = subWorkType;
        }
        if (activity && activity !== 'all') {
            where.activity = activity;
        }
        const timesheets = await database_1.prisma.timesheet.findMany({
            where,
            include: {
                project: true,
                user: true
            }
        });
        const csvHeaders = [
            'Date',
            'User',
            'Project',
            'Activity Type',
            'Description',
            'Hours Worked',
            'Overtime Hours',
            'Status',
            'Billable',
            'Created At'
        ];
        const csvRows = timesheets.map(t => [
            t.date ? t.date.toISOString().split('T')[0] : '',
            t.user?.name || '',
            t.project?.name || '',
            t.activity || '',
            t.description || '',
            t.hours_worked || 0,
            t.overtime_hours || 0,
            t.status || '',
            t.billable ? 'Yes' : 'No',
            t.created_at ? new Date(t.created_at).toISOString() : ''
        ]);
        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="timesheet-report-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
    }
    catch (error) {
        console.error('Error exporting timesheet CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export timesheet data'
        });
    }
});
router.get('/export/project/csv', async (req, res) => {
    try {
        const { status, workType, subWorkType, activity } = req.query;
        const where = {};
        if (status && status !== 'all') {
            where.status = status.toString().toUpperCase();
        }
        const projects = await database_1.prisma.project.findMany({
            where,
            include: {
                manager: true
            }
        });
        const csvHeaders = [
            'Project Name',
            'Description',
            'Status',
            'Manager',
            'Created At',
            'Updated At'
        ];
        const csvRows = projects.map(p => [
            p.name || '',
            p.description || '',
            p.status || '',
            p.manager?.name || '',
            p.createdAt ? new Date(p.createdAt).toISOString() : '',
            p.updatedAt ? new Date(p.updatedAt).toISOString() : ''
        ]);
        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="project-report-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
    }
    catch (error) {
        console.error('Error exporting project CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export project data'
        });
    }
});
router.get('/export/user-activity/csv', async (req, res) => {
    try {
        const { start, end, user, workType, subWorkType, activity } = req.query;
        const where = {};
        if (start && end) {
            where.date = {
                gte: new Date(start),
                lte: new Date(end)
            };
        }
        if (user && user !== 'all') {
            where.user_id = user;
        }
        if (workType && workType !== 'all') {
            where.work_type = workType;
        }
        if (subWorkType && subWorkType !== 'all') {
            where.sub_work_type = subWorkType;
        }
        if (activity && activity !== 'all') {
            where.activity = activity;
        }
        const timesheets = await database_1.prisma.timesheet.findMany({
            where,
            include: {
                user: true,
                project: true
            }
        });
        const csvHeaders = [
            'User',
            'Date',
            'Project',
            'Activity Type',
            'Description',
            'Hours Worked',
            'Overtime Hours',
            'Status',
            'Billable'
        ];
        const csvRows = timesheets.map(t => [
            t.user?.name || '',
            t.date ? t.date.toISOString().split('T')[0] : '',
            t.project?.name || '',
            t.activity || '',
            t.description || '',
            t.hours_worked || 0,
            t.overtime_hours || 0,
            t.status || '',
            t.billable ? 'Yes' : 'No'
        ]);
        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="user-activity-report-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
    }
    catch (error) {
        console.error('Error exporting user activity CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export user activity data'
        });
    }
});
router.get('/export/workload/csv', async (req, res) => {
    try {
        const { timeframe = 'week' } = req.query;
        const now = new Date();
        let startDate;
        let endDate = new Date(now);
        switch (timeframe) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
        }
        const [timesheets, users, projects, totalHoursResult, workTypeStats, userStats, projectStats] = await Promise.all([
            database_1.prisma.timesheet.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: {
                        in: ['submitted', 'approved']
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            position: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                            customerName: true,
                            budget: true
                        }
                    }
                }
            }),
            database_1.prisma.user.findMany({
                where: {
                    isActive: true
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    position: true
                }
            }),
            database_1.prisma.project.findMany({
                where: {
                    status: {
                        in: ['ACTIVE', 'ON_GOING', 'COMPLETED']
                    }
                },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    budget: true,
                    customerName: true
                }
            }),
            database_1.prisma.timesheet.aggregate({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: {
                        in: ['submitted', 'approved']
                    }
                },
                _sum: {
                    hours_worked: true,
                    overtime_hours: true
                }
            }),
            database_1.prisma.timesheet.groupBy({
                by: ['work_type'],
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: {
                        in: ['submitted', 'approved']
                    }
                },
                _sum: {
                    hours_worked: true,
                    overtime_hours: true
                },
                _count: {
                    id: true
                }
            }),
            database_1.prisma.timesheet.groupBy({
                by: ['user_id'],
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: {
                        in: ['submitted', 'approved']
                    }
                },
                _sum: {
                    hours_worked: true,
                    overtime_hours: true
                },
                _count: {
                    id: true
                }
            }),
            database_1.prisma.timesheet.groupBy({
                by: ['project_id'],
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: {
                        in: ['submitted', 'approved']
                    }
                },
                _sum: {
                    hours_worked: true,
                    overtime_hours: true
                },
                _count: {
                    id: true
                }
            })
        ]);
        const totalRegularHours = Number(totalHoursResult._sum?.hours_worked || 0);
        const totalOvertimeHours = Number(totalHoursResult._sum?.overtime_hours || 0);
        const totalHours = totalRegularHours + totalOvertimeHours;
        const totalUsers = users.length;
        const totalProjects = projects.length;
        const averageHoursPerUser = totalUsers > 0 ? totalHours / totalUsers : 0;
        const workTypes = workTypeStats.map(stat => {
            const regularHours = Number(stat._sum?.hours_worked || 0);
            const overtimeHours = Number(stat._sum?.overtime_hours || 0);
            const totalWorkTypeHours = regularHours + overtimeHours;
            const percentage = totalHours > 0 ? totalWorkTypeHours / totalHours * 100 : 0;
            return {
                name: stat.work_type || 'Unknown',
                hours: totalWorkTypeHours,
                percentage: Math.round(percentage * 100) / 100,
                count: stat._count?.id || 0
            };
        }).sort((a, b) => b.hours - a.hours);
        const userMap = new Map(users.map(user => [user.id, user]));
        const userWorkload = userStats.map(stat => {
            const user = userMap.get(stat.user_id || '');
            if (!user)
                return null;
            const userProjects = timesheets
                .filter(ts => ts.user_id === stat.user_id)
                .map(ts => ts.project_id)
                .filter((id, index, arr) => id && arr.indexOf(id) === index);
            const regularHours = Number(stat._sum?.hours_worked || 0);
            const overtimeHours = Number(stat._sum?.overtime_hours || 0);
            const totalUserHours = regularHours + overtimeHours;
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                position: user.position,
                hours: totalUserHours,
                projects: userProjects.length,
                timesheetCount: stat._count?.id || 0
            };
        }).filter((user) => user !== null).sort((a, b) => b.hours - a.hours);
        const topUsers = userWorkload.slice(0, 10);
        const roleStats = new Map();
        userWorkload.forEach(user => {
            const role = user.role || 'Unknown';
            if (!roleStats.has(role)) {
                roleStats.set(role, { hours: 0, users: 0, userList: [] });
            }
            const roleData = roleStats.get(role);
            roleData.hours += user.hours;
            roleData.users += 1;
            roleData.userList.push(user.name);
        });
        const departments = Array.from(roleStats.entries()).map(([name, data]) => ({
            name,
            hours: data.hours,
            users: data.users,
            userList: data.userList
        })).sort((a, b) => b.hours - a.hours);
        const projectMap = new Map(projects.map(project => [project.id, project]));
        const projectWorkload = projectStats.map(stat => {
            const project = projectMap.get(stat.project_id || '');
            if (!project)
                return null;
            const projectUsers = timesheets
                .filter(ts => ts.project_id === stat.project_id)
                .map(ts => ts.user_id)
                .filter((id, index, arr) => id && arr.indexOf(id) === index);
            const regularHours = Number(stat._sum?.hours_worked || 0);
            const overtimeHours = Number(stat._sum?.overtime_hours || 0);
            const totalProjectHours = regularHours + overtimeHours;
            return {
                id: project.id,
                name: project.name,
                status: project.status,
                budget: project.budget,
                customer: project.customerName,
                hours: totalProjectHours,
                users: projectUsers.length,
                timesheetCount: stat._count?.id || 0
            };
        }).filter((project) => project !== null).sort((a, b) => b.hours - a.hours);
        const csvRows = [
            ['Workload Report', ''],
            ['Timeframe', timeframe],
            ['Date Range', `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`],
            ['Generated', new Date().toLocaleString()],
            [''],
            ['Summary'],
            ['Total Hours', totalHours],
            ['Total Users', totalUsers],
            ['Total Projects', totalProjects],
            ['Active Users', userWorkload.filter(user => user.hours > 0).length],
            ['Active Projects', projectWorkload.filter(project => project.hours > 0).length],
            ['Average Hours per User', averageHoursPerUser.toFixed(2)],
            [''],
            ['Top Users'],
            ['Name', 'Email', 'Role', 'Position', 'Hours', 'Projects', 'Timesheets'],
            ...topUsers.map(user => [
                user.name,
                user.email,
                user.role,
                user.position,
                user.hours,
                user.projects,
                user.timesheetCount
            ]),
            [''],
            ['All Users'],
            ['Name', 'Email', 'Role', 'Position', 'Hours', 'Projects', 'Timesheets'],
            ...userWorkload.map(user => [
                user.name,
                user.email,
                user.role,
                user.position,
                user.hours,
                user.projects,
                user.timesheetCount
            ]),
            [''],
            ['Departments/Roles'],
            ['Department', 'Hours', 'Users', 'User List'],
            ...departments.map(dept => [
                dept.name,
                dept.hours,
                dept.users,
                dept.userList.join('; ')
            ]),
            [''],
            ['Work Types'],
            ['Type', 'Hours', 'Percentage', 'Count'],
            ...workTypes.map(type => [
                type.name,
                type.hours,
                `${type.percentage}%`,
                type.count
            ]),
            [''],
            ['Top Projects'],
            ['Name', 'Status', 'Customer', 'Budget', 'Hours', 'Users', 'Timesheets'],
            ...projectWorkload.slice(0, 10).map(project => [
                project.name,
                project.status,
                project.customer,
                project.budget,
                project.hours,
                project.users,
                project.timesheetCount
            ]),
            [''],
            ['All Projects'],
            ['Name', 'Status', 'Customer', 'Budget', 'Hours', 'Users', 'Timesheets'],
            ...projectWorkload.map(project => [
                project.name,
                project.status,
                project.customer,
                project.budget,
                project.hours,
                project.users,
                project.timesheetCount
            ])
        ];
        const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="workload-report-${timeframe}-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
    }
    catch (error) {
        console.error('Error exporting workload CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export workload data'
        });
    }
});
router.get('/workload', async (req, res) => {
    try {
        const { timeframe = 'week' } = req.query;
        const now = new Date();
        let startDate;
        let endDate = new Date(now);
        switch (timeframe) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
        }
        const [timesheets, users, projects, totalHoursResult, workTypeStats, userStats, projectStats] = await Promise.all([
            database_1.prisma.timesheet.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: {
                        in: ['submitted', 'approved']
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            position: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                            customerName: true,
                            budget: true
                        }
                    }
                }
            }),
            database_1.prisma.user.findMany({
                where: {
                    isActive: true
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    position: true
                }
            }),
            database_1.prisma.project.findMany({
                where: {
                    status: {
                        in: ['ACTIVE', 'ON_GOING', 'COMPLETED']
                    }
                },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    budget: true,
                    customerName: true
                }
            }),
            database_1.prisma.timesheet.aggregate({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: {
                        in: ['submitted', 'approved']
                    }
                },
                _sum: {
                    hours_worked: true,
                    overtime_hours: true
                }
            }),
            database_1.prisma.timesheet.groupBy({
                by: ['work_type'],
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: {
                        in: ['submitted', 'approved']
                    }
                },
                _sum: {
                    hours_worked: true,
                    overtime_hours: true
                },
                _count: {
                    id: true
                }
            }),
            database_1.prisma.timesheet.groupBy({
                by: ['user_id'],
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: {
                        in: ['submitted', 'approved']
                    }
                },
                _sum: {
                    hours_worked: true,
                    overtime_hours: true
                },
                _count: {
                    id: true
                }
            }),
            database_1.prisma.timesheet.groupBy({
                by: ['project_id'],
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: {
                        in: ['submitted', 'approved']
                    }
                },
                _sum: {
                    hours_worked: true,
                    overtime_hours: true
                },
                _count: {
                    id: true
                }
            })
        ]);
        const totalRegularHours = Number(totalHoursResult._sum?.hours_worked || 0);
        const totalOvertimeHours = Number(totalHoursResult._sum?.overtime_hours || 0);
        const totalHours = totalRegularHours + totalOvertimeHours;
        const totalUsers = users.length;
        const totalProjects = projects.length;
        const averageHoursPerUser = totalUsers > 0 ? totalHours / totalUsers : 0;
        const workTypes = workTypeStats.map(stat => {
            const regularHours = Number(stat._sum?.hours_worked || 0);
            const overtimeHours = Number(stat._sum?.overtime_hours || 0);
            const totalWorkTypeHours = regularHours + overtimeHours;
            const percentage = totalHours > 0 ? totalWorkTypeHours / totalHours * 100 : 0;
            return {
                name: stat.work_type || 'Unknown',
                hours: totalWorkTypeHours,
                percentage: Math.round(percentage * 100) / 100,
                count: stat._count?.id || 0
            };
        }).sort((a, b) => b.hours - a.hours);
        const userMap = new Map(users.map(user => [user.id, user]));
        const userWorkload = userStats.map(stat => {
            const user = userMap.get(stat.user_id || '');
            if (!user)
                return null;
            const userProjects = timesheets
                .filter(ts => ts.user_id === stat.user_id)
                .map(ts => ts.project_id)
                .filter((id, index, arr) => id && arr.indexOf(id) === index);
            const regularHours = Number(stat._sum?.hours_worked || 0);
            const overtimeHours = Number(stat._sum?.overtime_hours || 0);
            const totalUserHours = regularHours + overtimeHours;
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                position: user.position,
                hours: totalUserHours,
                projects: userProjects.length,
                timesheetCount: stat._count?.id || 0
            };
        }).filter((user) => user !== null).sort((a, b) => b.hours - a.hours);
        const topUsers = userWorkload.slice(0, 10);
        const roleStats = new Map();
        userWorkload.forEach(user => {
            const role = user.role || 'Unknown';
            if (!roleStats.has(role)) {
                roleStats.set(role, { hours: 0, users: 0, userList: [] });
            }
            const roleData = roleStats.get(role);
            roleData.hours += user.hours;
            roleData.users += 1;
            roleData.userList.push(user.name);
        });
        const departments = Array.from(roleStats.entries()).map(([name, data]) => ({
            name,
            hours: data.hours,
            users: data.users,
            userList: data.userList
        })).sort((a, b) => b.hours - a.hours);
        const projectMap = new Map(projects.map(project => [project.id, project]));
        const projectWorkload = projectStats.map(stat => {
            const project = projectMap.get(stat.project_id || '');
            if (!project)
                return null;
            const projectUsers = timesheets
                .filter(ts => ts.project_id === stat.project_id)
                .map(ts => ts.user_id)
                .filter((id, index, arr) => id && arr.indexOf(id) === index);
            const regularHours = Number(stat._sum?.hours_worked || 0);
            const overtimeHours = Number(stat._sum?.overtime_hours || 0);
            const totalProjectHours = regularHours + overtimeHours;
            return {
                id: project.id,
                name: project.name,
                status: project.status,
                budget: project.budget,
                customer: project.customerName,
                hours: totalProjectHours,
                users: projectUsers.length,
                timesheetCount: stat._count?.id || 0
            };
        }).filter((project) => project !== null).sort((a, b) => b.hours - a.hours);
        const topProjects = projectWorkload.slice(0, 10);
        const activeUsers = userWorkload.filter(user => user.hours > 0).length;
        const activeProjects = projectWorkload.filter(project => project.hours > 0).length;
        const averageHoursPerProject = activeProjects > 0 ? totalHours / activeProjects : 0;
        const workloadData = {
            totalHours,
            totalUsers,
            totalProjects,
            activeUsers,
            activeProjects,
            averageHoursPerUser: Math.round(averageHoursPerUser * 100) / 100,
            averageHoursPerProject: Math.round(averageHoursPerProject * 100) / 100,
            timeframe,
            dateRange: {
                start: startDate.toISOString(),
                end: endDate.toISOString()
            },
            users: userWorkload,
            departments,
            workTypes,
            topUsers,
            topProjects,
            projects: projectWorkload,
            summary: {
                totalTimesheets: timesheets.length,
                averageHoursPerTimesheet: timesheets.length > 0 ? totalHours / timesheets.length : 0,
                mostActiveUser: topUsers[0] || null,
                mostActiveProject: topProjects[0] || null,
                mostCommonWorkType: workTypes[0] || null
            }
        };
        res.json({
            success: true,
            data: workloadData
        });
    }
    catch (error) {
        console.error('Error generating workload report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate workload report'
        });
    }
});
router.get('/timesheet', async (req, res) => {
    try {
        const { start, end, status, project, workType, subWorkType, activity } = req.query;
        const where = {};
        if (start && end) {
            where.date = {
                gte: new Date(start),
                lte: new Date(end)
            };
        }
        if (status && status !== 'all') {
            where.status = status.toString().toUpperCase();
        }
        if (project && project !== 'all') {
            where.project_id = project;
        }
        if (workType && workType !== 'all') {
            where.work_type = workType;
        }
        if (subWorkType && subWorkType !== 'all') {
            where.sub_work_type = subWorkType;
        }
        if (activity && activity !== 'all') {
            where.activity = activity;
        }
        const timesheets = await database_1.prisma.timesheet.findMany({
            where,
            include: {
                project: true,
                user: true
            }
        });
        const totalEntries = timesheets.length;
        const totalHours = timesheets.reduce((sum, t) => sum + Number(t.hours_worked || 0) + Number(t.overtime_hours || 0), 0);
        const approvedEntries = timesheets.filter(t => t.status === 'APPROVED').length;
        const pendingEntries = timesheets.filter(t => t.status === 'PENDING').length;
        const rejectedEntries = timesheets.filter(t => t.status === 'REJECTED').length;
        const averageHoursPerEntry = totalEntries > 0 ? totalHours / totalEntries : 0;
        const projectMap = {};
        timesheets.forEach(t => {
            if (!t.project)
                return;
            if (!projectMap[t.project.id]) {
                projectMap[t.project.id] = {
                    name: t.project.name,
                    entries: 0,
                    hours: 0,
                    status: t.project.status
                };
            }
            projectMap[t.project.id].entries++;
            projectMap[t.project.id].hours += Number(t.hours_worked || 0) + Number(t.overtime_hours || 0);
        });
        const projects = Object.values(projectMap);
        const statusBreakdown = [
            { status: 'APPROVED', count: approvedEntries, percentage: totalEntries ? Math.round(approvedEntries / totalEntries * 100) : 0 },
            { status: 'PENDING', count: pendingEntries, percentage: totalEntries ? Math.round(pendingEntries / totalEntries * 100) : 0 },
            { status: 'REJECTED', count: rejectedEntries, percentage: totalEntries ? Math.round(rejectedEntries / totalEntries * 100) : 0 }
        ];
        const weeklyDataMap = {};
        timesheets.forEach(t => {
            const week = t.date ? `${t.date.getFullYear()}-W${getWeekNumber(t.date)}` : 'Unknown';
            if (!weeklyDataMap[week])
                weeklyDataMap[week] = { week, entries: 0, hours: 0, approved: 0 };
            weeklyDataMap[week].entries++;
            weeklyDataMap[week].hours += Number(t.hours_worked || 0) + Number(t.overtime_hours || 0);
            if (t.status === 'APPROVED')
                weeklyDataMap[week].approved++;
        });
        const weeklyData = Object.values(weeklyDataMap);
        const userMap = {};
        timesheets.forEach(t => {
            if (!t.user)
                return;
            if (!userMap[t.user.id]) {
                userMap[t.user.id] = {
                    name: t.user.name,
                    entries: 0,
                    hours: 0,
                    approvalRate: 0,
                    approved: 0
                };
            }
            userMap[t.user.id].entries++;
            userMap[t.user.id].hours += Number(t.hours_worked || 0) + Number(t.overtime_hours || 0);
            if (t.status === 'APPROVED')
                userMap[t.user.id].approved++;
        });
        const topUsers = Object.values(userMap).map((u) => ({
            ...u,
            approvalRate: u.entries > 0 ? Math.round((u.approved / u.entries) * 100) : 0
        })).sort((a, b) => b.entries - a.entries).slice(0, 5);
        res.json({
            success: true,
            data: {
                totalEntries,
                totalHours,
                approvedEntries,
                pendingEntries,
                rejectedEntries,
                averageHoursPerEntry,
                projects,
                statusBreakdown,
                weeklyData,
                topUsers
            }
        });
    }
    catch (error) {
        console.error('Error fetching timesheet report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch timesheet report'
        });
    }
});
router.get('/project', async (req, res) => {
    try {
        const { start, end, status, workType, subWorkType, activity } = req.query;
        const where = { isDeleted: false };
        if (status && status !== 'all') {
            where.status = status.toString().toUpperCase();
        }
        const projects = await database_1.prisma.project.findMany({
            where,
            include: {
                manager: true,
                timesheets: {
                    include: {
                        user: true
                    }
                }
            }
        });
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
        const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
        const onHoldProjects = projects.filter(p => p.status === 'ON_HOLD').length;
        const projectStats = projects.map(project => {
            let timesheets = project.timesheets || [];
            if (workType && workType !== 'all') {
                timesheets = timesheets.filter(t => t.work_type === workType);
            }
            if (subWorkType && subWorkType !== 'all') {
                timesheets = timesheets.filter(t => t.sub_work_type === subWorkType);
            }
            if (activity && activity !== 'all') {
                timesheets = timesheets.filter(t => t.activity === activity);
            }
            const totalHours = timesheets.reduce((sum, t) => sum + Number(t.hours_worked || 0) + Number(t.overtime_hours || 0), 0);
            const spent = timesheets.reduce((sum, t) => {
                const hourlyRate = Number(t.hourly_rate || 0);
                const hours = Number(t.hours_worked || 0) + Number(t.overtime_hours || 0);
                return sum + (hourlyRate * hours);
            }, 0);
            const progress = timesheets.length > 0 ? Math.min(100, Math.round((timesheets.length / 100) * 100)) : 0;
            return {
                id: project.id,
                name: project.name,
                status: project.status,
                progress,
                budget: 0,
                spent: Math.round(spent),
                startDate: project.createdAt,
                endDate: project.updatedAt,
                teamSize: new Set(timesheets.map(t => t.user_id)).size,
                totalHours,
                manager: project.manager?.name || 'Unknown'
            };
        });
        const statusBreakdown = [
            { status: 'ACTIVE', count: activeProjects, percentage: totalProjects ? Math.round(activeProjects / totalProjects * 100) : 0 },
            { status: 'COMPLETED', count: completedProjects, percentage: totalProjects ? Math.round(completedProjects / totalProjects * 100) : 0 },
            { status: 'ON_HOLD', count: onHoldProjects, percentage: totalProjects ? Math.round(onHoldProjects / totalProjects * 100) : 0 }
        ];
        const monthlyDataMap = {};
        projects.forEach(project => {
            const month = project.createdAt ? `${project.createdAt.getFullYear()}-${String(project.createdAt.getMonth() + 1).padStart(2, '0')}` : 'Unknown';
            if (!monthlyDataMap[month])
                monthlyDataMap[month] = { month, projects: 0, budget: 0, hours: 0 };
            monthlyDataMap[month].projects++;
            monthlyDataMap[month].hours += project.timesheets?.reduce((sum, t) => sum + Number(t.hours_worked || 0) + Number(t.overtime_hours || 0), 0) || 0;
        });
        const monthlyData = Object.values(monthlyDataMap);
        const totalBudget = projectStats.reduce((sum, p) => sum + p.budget, 0);
        const spentBudget = projectStats.reduce((sum, p) => sum + p.spent, 0);
        const totalHours = projectStats.reduce((sum, p) => sum + p.totalHours, 0);
        const averageHoursPerProject = totalProjects > 0 ? totalHours / totalProjects : 0;
        const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
        res.json({
            success: true,
            data: {
                totalProjects,
                activeProjects,
                completedProjects,
                onHoldProjects,
                totalBudget,
                totalSpent: spentBudget,
                totalHours,
                averageHoursPerProject,
                completionRate,
                projects: projectStats,
                statusBreakdown,
                monthlyData
            }
        });
    }
    catch (error) {
        console.error('Error fetching project report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project report'
        });
    }
});
router.get('/user-activity', async (req, res) => {
    try {
        const { start, end, user_id, workType, subWorkType, activity } = req.query;
        const where = {};
        if (start && end) {
            where.createdAt = {
                gte: new Date(start),
                lte: new Date(end)
            };
        }
        if (user_id) {
            where.userId = user_id;
        }
        const users = await database_1.prisma.user.findMany({
            where: { isDeleted: false },
            include: {
                timesheets: true,
                approved_timesheets: true
            }
        });
        const activities = await database_1.prisma.timesheetEditHistory.findMany({
            where,
            include: {
                user: true,
                timesheet: true
            },
            orderBy: { createdAt: 'desc' }
        });
        const totalActivities = activities.length;
        const uniqueUsers = users.length;
        const activeUsers = users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
        const failedActions = 0;
        const userStats = users.map(user => {
            let timesheets = user.timesheets || [];
            if (workType && workType !== 'all') {
                timesheets = timesheets.filter(t => t.work_type === workType);
            }
            if (subWorkType && subWorkType !== 'all') {
                timesheets = timesheets.filter(t => t.sub_work_type === subWorkType);
            }
            if (activity && activity !== 'all') {
                timesheets = timesheets.filter(t => t.activity === activity);
            }
            const timesheetEntries = timesheets.length;
            const approvalActions = user.approved_timesheets?.length || 0;
            const userActivities = activities.filter(a => a.userId === user.id);
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                totalActivities: userActivities.length,
                lastActive: user.lastLogin || user.updatedAt,
                loginCount: 0,
                timesheetEntries,
                approvalActions
            };
        });
        const actionMap = {};
        activities.forEach(activity => {
            const action = activity.action;
            actionMap[action] = (actionMap[action] || 0) + 1;
        });
        const activityBreakdown = Object.entries(actionMap).map(([action, count]) => ({
            action: action.toUpperCase(),
            count,
            percentage: totalActivities ? Math.round((count / totalActivities) * 100) : 0
        }));
        const dailyDataMap = {};
        activities.forEach(activity => {
            const date = activity.createdAt ? activity.createdAt.toISOString().split('T')[0] : 'Unknown';
            if (!dailyDataMap[date])
                dailyDataMap[date] = { date, activities: 0, users: new Set() };
            dailyDataMap[date].activities++;
            dailyDataMap[date].users.add(activity.userId);
        });
        const dailyData = Object.values(dailyDataMap).map((day) => ({
            date: day.date,
            activities: day.activities,
            users: day.users.size
        }));
        const actionStats = Object.entries(actionMap).map(([action, count]) => ({
            action: action.charAt(0).toUpperCase() + action.slice(1),
            count,
            successRate: 95
        }));
        res.json({
            success: true,
            data: {
                totalActivities,
                uniqueUsers,
                activeUsers,
                failedActions,
                users: userStats,
                activityBreakdown,
                dailyData,
                topActions: actionStats
            }
        });
    }
    catch (error) {
        console.error('Error fetching user activity report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user activity report'
        });
    }
});
exports.default = router;
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
//# sourceMappingURL=reports.js.map