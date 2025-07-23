import { Router } from 'express';
import { authenticate, requireManager } from '../middleware/auth';
import { prisma } from '../utils/database';
import { IAuthenticatedRequest } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Export timesheet data as CSV
router.get('/export/timesheet/csv', async (req: IAuthenticatedRequest, res) => {
  try {
    const { start, end, status, project, workType, subWorkType, activity } = req.query;
    const where: any = {};
    if (start && end) {
      where.date = {
        gte: new Date(start as string),
        lte: new Date(end as string)
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

    const timesheets = await prisma.timesheet.findMany({
      where,
      include: {
        project: true,
        user: true
      }
    });

    // Create CSV content
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
  } catch (error) {
    console.error('Error exporting timesheet CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export timesheet data'
    });
  }
});

// Export project data as CSV
router.get('/export/project/csv', async (req: IAuthenticatedRequest, res) => {
  try {
    const { status, workType, subWorkType, activity } = req.query;
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toString().toUpperCase();
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        manager: true
      }
    });

    // Create CSV content
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
  } catch (error) {
    console.error('Error exporting project CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export project data'
    });
  }
});

// Export user activity data as CSV
router.get('/export/user-activity/csv', async (req: IAuthenticatedRequest, res) => {
  try {
    const { start, end, user, workType, subWorkType, activity } = req.query;
    const where: any = {};
    if (start && end) {
      where.date = {
        gte: new Date(start as string),
        lte: new Date(end as string)
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

    const timesheets = await prisma.timesheet.findMany({
      where,
      include: {
        user: true,
        project: true
      }
    });

    // Create CSV content
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
  } catch (error) {
    console.error('Error exporting user activity CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user activity data'
    });
  }
});

// Export workload data as CSV
router.get('/export/workload/csv', async (req: IAuthenticatedRequest, res) => {
  try {
    const { timeframe = 'week' } = req.query;
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);
    
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

    // Get real data from database
    const [
      timesheets,
      users,
      projects,
      totalHoursResult,
      workTypeStats,
      userStats,
      projectStats
    ] = await Promise.all([
      // Get timesheets in date range
      prisma.timesheet.findMany({
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
      
      // Get all active users
      prisma.user.findMany({
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
      
      // Get all active projects
      prisma.project.findMany({
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
      
      // Get total hours
      prisma.timesheet.aggregate({
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
      
      // Get work type statistics
      prisma.timesheet.groupBy({
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
      
      // Get user statistics
      prisma.timesheet.groupBy({
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
      
      // Get project statistics
      prisma.timesheet.groupBy({
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

    // Calculate total hours (regular + overtime)
    const totalRegularHours = Number(totalHoursResult._sum?.hours_worked || 0);
    const totalOvertimeHours = Number(totalHoursResult._sum?.overtime_hours || 0);
    const totalHours = totalRegularHours + totalOvertimeHours;
    
    const totalUsers = users.length;
    const totalProjects = projects.length;
    const averageHoursPerUser = totalUsers > 0 ? totalHours / totalUsers : 0;

    // Process work type data
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

    // Process user data
    const userMap = new Map(users.map(user => [user.id, user]));
    const userWorkload = userStats.map(stat => {
      const user = userMap.get(stat.user_id || '');
      if (!user) return null;
      
      // Count unique projects for this user
      const userProjects = timesheets
        .filter(ts => ts.user_id === stat.user_id)
        .map(ts => ts.project_id)
        .filter((id, index, arr) => id && arr.indexOf(id) === index);
      
      const regularHours = Number(stat._sum?.hours_worked || 0);
      const overtimeHours = Number(stat._sum?.overtime_hours || 0);
      const totalUserHours = regularHours + overtimeHours;
      
      return {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role,
        position: (user as any).position,
        hours: totalUserHours,
        projects: userProjects.length,
        timesheetCount: stat._count?.id || 0
      };
    }).filter((user): user is NonNullable<typeof user> => user !== null).sort((a, b) => b.hours - a.hours);

    // Get top users (top 10)
    const topUsers = userWorkload.slice(0, 10);

    // Process department/role data
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

    // Process project data
    const projectMap = new Map(projects.map(project => [project.id, project]));
    const projectWorkload = projectStats.map(stat => {
      const project = projectMap.get(stat.project_id || '');
      if (!project) return null;
      
      // Count unique users for this project
      const projectUsers = timesheets
        .filter(ts => ts.project_id === stat.project_id)
        .map(ts => ts.user_id)
        .filter((id, index, arr) => id && arr.indexOf(id) === index);
      
      const regularHours = Number(stat._sum?.hours_worked || 0);
      const overtimeHours = Number(stat._sum?.overtime_hours || 0);
      const totalProjectHours = regularHours + overtimeHours;
      
      return {
        id: (project as any).id,
        name: (project as any).name,
        status: (project as any).status,
        budget: (project as any).budget,
        customer: (project as any).customerName,
        hours: totalProjectHours,
        users: projectUsers.length,
        timesheetCount: stat._count?.id || 0
      };
    }).filter((project): project is NonNullable<typeof project> => project !== null).sort((a, b) => b.hours - a.hours);

    // Generate CSV content
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

    const csvContent = csvRows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="workload-report-${timeframe}-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting workload CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export workload data'
    });
  }
});

// Workload summary report for dashboard/charts
router.get('/workload', async (req: IAuthenticatedRequest, res) => {
  try {
    const { timeframe = 'week' } = req.query;
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);
    
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

    // Get real data from database
    const [
      timesheets,
      users,
      projects,
      totalHoursResult,
      workTypeStats,
      userStats,
      projectStats
    ] = await Promise.all([
      // Get timesheets in date range
      prisma.timesheet.findMany({
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
      
      // Get all active users
      prisma.user.findMany({
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
      
      // Get all active projects
      prisma.project.findMany({
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
      
      // Get total hours
      prisma.timesheet.aggregate({
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
      
      // Get work type statistics
      prisma.timesheet.groupBy({
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
      
      // Get user statistics
      prisma.timesheet.groupBy({
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
      
      // Get project statistics
      prisma.timesheet.groupBy({
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

    // Calculate total hours (regular + overtime)
    const totalRegularHours = Number(totalHoursResult._sum?.hours_worked || 0);
    const totalOvertimeHours = Number(totalHoursResult._sum?.overtime_hours || 0);
    const totalHours = totalRegularHours + totalOvertimeHours;
    
    const totalUsers = users.length;
    const totalProjects = projects.length;
    const averageHoursPerUser = totalUsers > 0 ? totalHours / totalUsers : 0;

    // Process work type data
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

    // Process user data
    const userMap = new Map(users.map(user => [user.id, user]));
    const userWorkload = userStats.map(stat => {
      const user = userMap.get(stat.user_id || '');
      if (!user) return null;
      
      // Count unique projects for this user
      const userProjects = timesheets
        .filter(ts => ts.user_id === stat.user_id)
        .map(ts => ts.project_id)
        .filter((id, index, arr) => id && arr.indexOf(id) === index);
      
      const regularHours = Number(stat._sum?.hours_worked || 0);
      const overtimeHours = Number(stat._sum?.overtime_hours || 0);
      const totalUserHours = regularHours + overtimeHours;
      
      return {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role,
        position: (user as any).position,
        hours: totalUserHours,
        projects: userProjects.length,
        timesheetCount: stat._count?.id || 0
      };
    }).filter((user): user is NonNullable<typeof user> => user !== null).sort((a, b) => b.hours - a.hours);

    // Get top users (top 10)
    const topUsers = userWorkload.slice(0, 10);

    // Process department/role data
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

    // Process project data
    const projectMap = new Map(projects.map(project => [project.id, project]));
    const projectWorkload = projectStats.map(stat => {
      const project = projectMap.get(stat.project_id || '');
      if (!project) return null;
      
      // Count unique users for this project
      const projectUsers = timesheets
        .filter(ts => ts.project_id === stat.project_id)
        .map(ts => ts.user_id)
        .filter((id, index, arr) => id && arr.indexOf(id) === index);
      
      const regularHours = Number(stat._sum?.hours_worked || 0);
      const overtimeHours = Number(stat._sum?.overtime_hours || 0);
      const totalProjectHours = regularHours + overtimeHours;
      
      return {
        id: (project as any).id,
        name: (project as any).name,
        status: (project as any).status,
        budget: (project as any).budget,
        customer: (project as any).customerName,
        hours: totalProjectHours,
        users: projectUsers.length,
        timesheetCount: stat._count?.id || 0
      };
    }).filter((project): project is NonNullable<typeof project> => project !== null).sort((a, b) => b.hours - a.hours);

    // Get top projects (top 10)
    const topProjects = projectWorkload.slice(0, 10);

    // Calculate additional metrics
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

  } catch (error) {
    console.error('Error generating workload report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate workload report'
    });
  }
});

// Get timesheet report
router.get('/timesheet', async (req: IAuthenticatedRequest, res) => {
  try {
    // รับ filter จาก query string
    const { start, end, status, project, workType, subWorkType, activity } = req.query;
    const where: any = {};
    if (start && end) {
      where.date = {
        gte: new Date(start as string),
        lte: new Date(end as string)
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

    // ดึง timesheet ทั้งหมดตาม filter
    const timesheets = await prisma.timesheet.findMany({
      where,
      include: {
        project: true,
        user: true
      }
    });

    // สรุปข้อมูล
    const totalEntries = timesheets.length;
    const totalHours = timesheets.reduce((sum, t) => sum + Number(t.hours_worked || 0) + Number(t.overtime_hours || 0), 0);
    const approvedEntries = timesheets.filter(t => t.status === 'APPROVED').length;
    const pendingEntries = timesheets.filter(t => t.status === 'PENDING').length;
    const rejectedEntries = timesheets.filter(t => t.status === 'REJECTED').length;
    const averageHoursPerEntry = totalEntries > 0 ? totalHours / totalEntries : 0;

    // Group by project
    const projectMap: Record<string, any> = {};
    timesheets.forEach(t => {
      if (!t.project) return;
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

    // Status breakdown
    const statusBreakdown = [
      { status: 'APPROVED', count: approvedEntries, percentage: totalEntries ? Math.round(approvedEntries / totalEntries * 100) : 0 },
      { status: 'PENDING', count: pendingEntries, percentage: totalEntries ? Math.round(pendingEntries / totalEntries * 100) : 0 },
      { status: 'REJECTED', count: rejectedEntries, percentage: totalEntries ? Math.round(rejectedEntries / totalEntries * 100) : 0 }
    ];

    // Weekly data (group by week)
    const weeklyDataMap: Record<string, any> = {};
    timesheets.forEach(t => {
      const week = t.date ? `${t.date.getFullYear()}-W${getWeekNumber(t.date)}` : 'Unknown';
      if (!weeklyDataMap[week]) weeklyDataMap[week] = { week, entries: 0, hours: 0, approved: 0 };
      weeklyDataMap[week].entries++;
      weeklyDataMap[week].hours += Number(t.hours_worked || 0) + Number(t.overtime_hours || 0);
      if (t.status === 'APPROVED') weeklyDataMap[week].approved++;
    });
    const weeklyData = Object.values(weeklyDataMap);

    // Top users
    const userMap: Record<string, any> = {};
    timesheets.forEach(t => {
      if (!t.user) return;
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
      if (t.status === 'APPROVED') userMap[t.user.id].approved++;
    });
    const topUsers = Object.values(userMap).map((u: any) => ({
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
  } catch (error) {
    console.error('Error fetching timesheet report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timesheet report'
    });
  }
});

// Get project report
router.get('/project', async (req: IAuthenticatedRequest, res) => {
  try {
    // รับ filter จาก query string
    const { start, end, status, workType, subWorkType, activity } = req.query;
    const where: any = { isDeleted: false };
    if (status && status !== 'all') {
      where.status = status.toString().toUpperCase();
    }

    // ดึง projects ทั้งหมดตาม filter
    const projects = await prisma.project.findMany({
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

    // สรุปข้อมูล
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const onHoldProjects = projects.filter(p => p.status === 'ON_HOLD').length;

    // คำนวณ budget และ spent จาก timesheets
    const projectStats = projects.map(project => {
      let timesheets = project.timesheets || [];
      
      // Filter timesheets based on work type, sub work type, and activity
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
      
      // คำนวณ progress จาก timesheets
      const progress = timesheets.length > 0 ? Math.min(100, Math.round((timesheets.length / 100) * 100)) : 0;
      
      return {
        id: project.id,
        name: project.name,
        status: project.status,
        progress,
        budget: 0, // ยังไม่มี budget field ใน schema
        spent: Math.round(spent),
        startDate: project.createdAt,
        endDate: project.updatedAt, // ใช้ updatedAt เป็น endDate ชั่วคราว
        teamSize: new Set(timesheets.map(t => t.user_id)).size,
        totalHours,
        manager: project.manager?.name || 'Unknown'
      };
    });

    // Status breakdown
    const statusBreakdown = [
      { status: 'ACTIVE', count: activeProjects, percentage: totalProjects ? Math.round(activeProjects / totalProjects * 100) : 0 },
      { status: 'COMPLETED', count: completedProjects, percentage: totalProjects ? Math.round(completedProjects / totalProjects * 100) : 0 },
      { status: 'ON_HOLD', count: onHoldProjects, percentage: totalProjects ? Math.round(onHoldProjects / totalProjects * 100) : 0 }
    ];

    // Monthly data (group by month)
    const monthlyDataMap: Record<string, any> = {};
    projects.forEach(project => {
      const month = project.createdAt ? `${project.createdAt.getFullYear()}-${String(project.createdAt.getMonth() + 1).padStart(2, '0')}` : 'Unknown';
      if (!monthlyDataMap[month]) monthlyDataMap[month] = { month, projects: 0, budget: 0, hours: 0 };
      monthlyDataMap[month].projects++;
      monthlyDataMap[month].hours += project.timesheets?.reduce((sum, t) => sum + Number(t.hours_worked || 0) + Number(t.overtime_hours || 0), 0) || 0;
    });
    const monthlyData = Object.values(monthlyDataMap);

    const totalBudget = projectStats.reduce((sum, p) => sum + p.budget, 0);
    const spentBudget = projectStats.reduce((sum, p) => sum + p.spent, 0);

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        totalBudget,
        spentBudget,
        projects: projectStats,
        statusBreakdown,
        monthlyData
      }
    });
  } catch (error) {
    console.error('Error fetching project report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project report'
    });
  }
});

// Get user activity report
router.get('/user-activity', async (req: IAuthenticatedRequest, res) => {
  try {
    // รับ filter จาก query string
    const { start, end, user_id, workType, subWorkType, activity } = req.query;
    const where: any = {};
    if (start && end) {
      where.createdAt = {
        gte: new Date(start as string),
        lte: new Date(end as string)
      };
    }
    if (user_id) {
      where.userId = user_id;
    }

    // ดึง users ทั้งหมด
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      include: {
        timesheets: true,
        approved_timesheets: true
      }
    });

    // ดึง timesheet edit histories (activity logs)
    const activities = await prisma.timesheetEditHistory.findMany({
      where,
      include: {
        user: true,
        timesheet: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // สรุปข้อมูล
    const totalActivities = activities.length;
    const uniqueUsers = users.length;
    const activeUsers = users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    const failedActions = 0; // ยังไม่มี field เก็บ failed actions

    // สรุปข้อมูล user
    const userStats = users.map(user => {
      let timesheets = user.timesheets || [];
      
      // Filter timesheets based on work type, sub work type, and activity
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
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role,
        totalActivities: userActivities.length,
        lastActive: user.lastLogin || user.updatedAt,
        loginCount: 0, // ยังไม่มี field เก็บ login count
        timesheetEntries,
        approvalActions
      };
    });

    // Activity breakdown
    const actionMap: Record<string, number> = {};
    activities.forEach(activity => {
      const action = activity.action;
      actionMap[action] = (actionMap[action] || 0) + 1;
    });
    
    const activityBreakdown = Object.entries(actionMap).map(([action, count]) => ({
      action: action.toUpperCase(),
      count,
      percentage: totalActivities ? Math.round((count / totalActivities) * 100) : 0
    }));

    // Daily data (group by day)
    const dailyDataMap: Record<string, any> = {};
    activities.forEach(activity => {
      const date = activity.createdAt ? activity.createdAt.toISOString().split('T')[0] : 'Unknown';
      if (!dailyDataMap[date]) dailyDataMap[date] = { date, activities: 0, users: new Set() };
      dailyDataMap[date].activities++;
      dailyDataMap[date].users.add(activity.userId);
    });
    const dailyData = Object.values(dailyDataMap).map((day: any) => ({
      date: day.date,
      activities: day.activities,
      users: day.users.size
    }));

    // Top actions
    const actionStats = Object.entries(actionMap).map(([action, count]) => ({
      action: action.charAt(0).toUpperCase() + action.slice(1),
      count,
      successRate: 95 // ยังไม่มีข้อมูล success rate จริง
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
  } catch (error) {
    console.error('Error fetching user activity report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity report'
    });
  }
});

export default router;

// Helper: get week number
function getWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1) / 7);
} 