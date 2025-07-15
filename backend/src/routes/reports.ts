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
    const { start, end, status, project } = req.query;
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
      t.activity_type || '',
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
    const { status } = req.query;
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
      p.created_at ? new Date(p.created_at).toISOString() : '',
      p.updated_at ? new Date(p.updated_at).toISOString() : ''
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
    const { start, end, user } = req.query;
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
      t.activity_type || '',
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
    const { start, end, department } = req.query;
    const where: any = {};
    if (start && end) {
      where.date = {
        gte: new Date(start as string),
        lte: new Date(end as string)
      };
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
      'Department',
      'User',
      'Project',
      'Date',
      'Hours Worked',
      'Overtime Hours',
      'Total Hours',
      'Status'
    ];

    const csvRows = timesheets.map(t => [
      t.user?.role || '',
      t.user?.name || '',
      t.project?.name || '',
      t.date ? t.date.toISOString().split('T')[0] : '',
      t.hours_worked || 0,
      t.overtime_hours || 0,
      (Number(t.hours_worked || 0) + Number(t.overtime_hours || 0)),
      t.status || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="workload-report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting workload CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export workload data'
    });
  }
});

// Get workload report
router.get('/workload', async (req: IAuthenticatedRequest, res) => {
  try {
    // รับ filter จาก query string
    const { start, end, department } = req.query;
    const where: any = {};
    if (start && end) {
      where.date = {
        gte: new Date(start as string),
        lte: new Date(end as string)
      };
    }

    // ดึง timesheet ทั้งหมดตาม filter
    const timesheets = await prisma.timesheet.findMany({
      where,
      include: {
        user: true,
        project: true
      }
    });

    // สรุปข้อมูล
    const totalHours = timesheets.reduce((sum, t) => sum + Number(t.hours_worked || 0) + Number(t.overtime_hours || 0), 0);
    const uniqueUsers = new Set(timesheets.map(t => t.user_id)).size;
    const activeUsers = uniqueUsers; // ใช้ unique users เป็น active users

    // Group by department (ใช้ role ของ user เป็น department)
    const deptMap: Record<string, any> = {};
    timesheets.forEach(t => {
      if (!t.user) return;
      const dept = t.user.role || 'UNKNOWN';
      if (!deptMap[dept]) {
        deptMap[dept] = {
          name: dept,
          totalHours: 0,
          averageHours: 0,
          userCount: 0,
          users: new Set()
        };
      }
      deptMap[dept].totalHours += Number(t.hours_worked || 0) + Number(t.overtime_hours || 0);
      deptMap[dept].users.add(t.user_id);
    });

    const departments = Object.values(deptMap).map((dept: any) => ({
      name: dept.name,
      totalHours: dept.totalHours,
      averageHours: dept.users.size > 0 ? dept.totalHours / dept.users.size : 0,
      userCount: dept.users.size
    }));

    // Weekly data (group by week)
    const weeklyDataMap: Record<string, any> = {};
    timesheets.forEach(t => {
      const week = t.date ? `${t.date.getFullYear()}-W${getWeekNumber(t.date)}` : 'Unknown';
      if (!weeklyDataMap[week]) weeklyDataMap[week] = { week, hours: 0, users: new Set() };
      weeklyDataMap[week].hours += Number(t.hours_worked || 0) + Number(t.overtime_hours || 0);
      weeklyDataMap[week].users.add(t.user_id);
    });
    const weeklyData = Object.values(weeklyDataMap).map((week: any) => ({
      week: week.week,
      hours: week.hours,
      users: week.users.size
    }));

    // Top users
    const userMap: Record<string, any> = {};
    timesheets.forEach(t => {
      if (!t.user) return;
      if (!userMap[t.user.id]) {
        userMap[t.user.id] = {
          name: t.user.name,
          hours: 0,
          department: t.user.role
        };
      }
      userMap[t.user.id].hours += Number(t.hours_worked || 0) + Number(t.overtime_hours || 0);
    });
    const topUsers = Object.values(userMap)
      .sort((a: any, b: any) => b.hours - a.hours)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalHours,
        averageHoursPerWeek: weeklyData.length > 0 ? totalHours / weeklyData.length : 0,
        totalUsers: uniqueUsers,
        activeUsers,
        departments,
        weeklyData,
        topUsers
      }
    });
  } catch (error) {
    console.error('Error fetching workload report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workload report'
    });
  }
});

// Get timesheet report
router.get('/timesheet', async (req: IAuthenticatedRequest, res) => {
  try {
    // รับ filter จาก query string
    const { start, end, status, project } = req.query;
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
    const { start, end, status } = req.query;
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
      const timesheets = project.timesheets || [];
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
    const { start, end, user_id } = req.query;
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
      const timesheetEntries = user.timesheets?.length || 0;
      const approvalActions = user.approved_timesheets?.length || 0;
      const userActivities = activities.filter(a => a.userId === user.id);
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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