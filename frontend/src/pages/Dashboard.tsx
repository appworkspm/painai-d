import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  Briefcase, 
  AlertCircle, 
  Users, 
  FileText,
  CheckCircle2,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  Plus,
  Settings,
  Bell,
  Star,
  Award,
  Zap,
  CalendarDays,
  FolderOpen,
  CheckSquare,
  TrendingUp
} from 'lucide-react';
import { format, parseISO, isThisWeek } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

import { useAuth } from '@/contexts/AuthContext';
import { projectAPI, timesheetAPI, usersAPI, costRequestAPI } from '@/services/api';
import { StatCard } from '@/components/ui/StatCard';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isVP = user?.role === 'vp';

  // Fetch projects
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectAPI.getProjects(),
  });

  // Fetch user's timesheets
  const { data: timesheetsData, isLoading: isLoadingTimesheets } = useQuery({
    queryKey: ['my-timesheets'],
    queryFn: () => timesheetAPI.getMyTimesheets(),
    enabled: !!user,
  });

  // Fetch all timesheets (for managers/admins)
  const { data: allTimesheetsData } = useQuery({
    queryKey: ['all-timesheets'],
    queryFn: () => timesheetAPI.getTimesheets(),
    enabled: isAdmin || isManager || isVP,
  });

  // Fetch team members (for managers/admins)
  const { data: teamData } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => usersAPI.getTeamMembers(),
    enabled: isAdmin || isManager || isVP,
  });

  // Fetch cost requests
  const { data: costRequestsData } = useQuery({
    queryKey: ['cost-requests'],
    queryFn: () => costRequestAPI.getCostRequests(),
    enabled: isAdmin || isManager || isVP,
  });

  // Fetch user's cost requests
  const { data: myCostRequestsData } = useQuery({
    queryKey: ['my-cost-requests'],
    queryFn: () => costRequestAPI.getCostRequests({ userId: user?.id }),
    enabled: !!user,
  });

  // Helper function to safely extract data from paginated responses
  const getDataFromPaginated = (data: any) => (data && Array.isArray(data.data) ? data.data : []);
  
  const projects = getDataFromPaginated(projectsData);
  const timesheets = getDataFromPaginated(timesheetsData);
  const allTimesheets = getDataFromPaginated(allTimesheetsData);
  const teamMembers = getDataFromPaginated(teamData);
  const costRequests = getDataFromPaginated(costRequestsData);
  const myCostRequests = getDataFromPaginated(myCostRequestsData);

  // Calculate comprehensive statistics with type safety
  const activeProjects = projects?.filter((p: any) => p?.status === 'ACTIVE').length || 0;
  const completedProjects = projects?.filter((p: any) => p?.status === 'COMPLETED').length || 0;
  const onHoldProjects = projects?.filter((p: any) => p?.status === 'ON_HOLD').length || 0;
  
  // Timesheet statistics
  // Initialize accumulator with proper types
  const timesheetStats = (timesheets as any[]).reduce((acc: {
    totalHours: number;
    weeklyHours: Record<string, number>;
    pendingApprovals: number;
    approvedTimesheets: number;
    rejectedTimesheets: number;
  }, ts: any) => {
    const hours = parseFloat(ts.hours_worked) || 0;
    const overtime = parseFloat(ts.overtime_hours) || 0;
    const total = hours + overtime;
    
    // Weekly hours for chart
    const date = parseISO(ts.date);
    if (isThisWeek(date, { weekStartsOn: 1 })) {
      const day = format(date, 'EEEE', { locale: th });
      acc.weeklyHours[day] = (acc.weeklyHours[day] || 0) + total;
    }

    // Status counts
    if (ts.status === 'approved') {
      acc.approvedTimesheets += 1;
    } else if (ts.status === 'rejected') {
      acc.rejectedTimesheets += 1;
    } else if (['draft', 'submitted'].includes(ts.status)) {
      acc.pendingApprovals += 1;
    }

    acc.totalHours += total;
    return acc;
  }, { 
    totalHours: 0, 
    weeklyHours: {} as Record<string, number>,
    pendingApprovals: 0,
    approvedTimesheets: 0,
    rejectedTimesheets: 0
  });

  const { totalHours, weeklyHours, pendingApprovals, approvedTimesheets, rejectedTimesheets } = timesheetStats;

  // Cost request statistics with null checks
  const pendingCostRequests = costRequests.filter((cr: any) => cr?.status === 'pending').length;
  // const approvedCostRequests = costRequests.filter((cr: any) => cr.status === 'approved').length;
  const totalCostAmount = costRequests.reduce((sum: number, cr: any) => sum + (parseFloat(cr.amount) || 0), 0);

  // Team statistics
  const activeTeamMembers = teamMembers?.filter((member: any) => member?.isActive).length || 0;
  const totalTeamHours = allTimesheets?.reduce((sum: number, ts: any) => {
    return sum + (parseFloat(ts?.hours_worked) || 0) + (parseFloat(ts?.overtime_hours) || 0);
  }, 0) || 0;

  // Prepare comprehensive chart data with null checks
  const weeklyChartData = Object.entries(weeklyHours || {}).map(([day, hours]) => ({
    day: day?.charAt(0)?.toUpperCase() + day?.slice(1, 3) || '',
    hours: hours ? Number(Number(hours).toFixed(2)) : 0
  }));

  // Project status distribution
  const projectStatusData = [
    { name: 'กำลังดำเนินการ', value: activeProjects, color: '#10b981' },
    { name: 'เสร็จสิ้น', value: completedProjects, color: '#3b82f6' },
    { name: 'ระงับ', value: onHoldProjects, color: '#f59e0b' }
  ];

  // Timesheet status distribution with default values
  const timesheetStatusData = [
    { name: 'อนุมัติแล้ว', value: approvedTimesheets || 0, color: '#10b981' },
    { name: 'รออนุมัติ', value: pendingApprovals || 0, color: '#f59e0b' },
    { name: 'ไม่อนุมัติ', value: rejectedTimesheets || 0, color: '#ef4444' }
  ];

  // Recent activities with null checks
  const recentActivities = [
    ...(timesheets || []).slice(0, 3).map((ts: any) => ({
      type: 'timesheet',
      title: 'บันทึกเวลาใหม่',
      description: `${ts?.hours_worked || 0} ชั่วโมง • ${ts?.project?.name || 'ไม่มีชื่อโปรเจค'}`,
      date: ts?.date || new Date().toISOString(),
      icon: FileText,
      color: 'blue'
    })),
    ...(myCostRequests || []).slice(0, 2).map((cr: any) => ({
      type: 'cost',
      title: 'คำขอต้นทุนใหม่',
      description: `${cr?.amount || 0} บาท • ${cr?.description || 'ไม่มีคำอธิบาย'}`,
      date: cr?.createdAt || new Date().toISOString(),
      icon: DollarSign,
      color: 'green'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Loading state
  if (isLoadingProjects || isLoadingTimesheets) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-80 bg-gray-200 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-80 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-80 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('dashboard.welcome', { name: user?.name })} • {format(new Date(), 'd MMMM yyyy', { locale: th })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/profile'}>
            <Bell className="h-4 w-4 mr-2" />
            {t('dashboard.notifications')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/settings'}>
            <Settings className="h-4 w-4 mr-2" />
            {t('dashboard.settings')}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.quick_actions')}</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Button className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 dark:hover:bg-blue-900/20" variant="outline" onClick={() => window.location.href = '/timesheets/create'}>
            <Plus className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium">{t('dashboard.record_work')}</span>
          </Button>
          <Button className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 dark:hover:bg-green-900/20" variant="outline" onClick={() => window.location.href = '/projects'}>
            <FolderOpen className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">{t('dashboard.view_projects_short')}</span>
          </Button>
          <Button className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 dark:hover:bg-purple-900/20" variant="outline" onClick={() => window.location.href = '/cost/my-requests'}>
            <DollarSign className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium">{t('dashboard.cost_requests_short')}</span>
          </Button>
          <Button className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 dark:hover:bg-orange-900/20" variant="outline" onClick={() => window.location.href = '/reports/workload'}>
            <BarChart3 className="h-6 w-6 text-orange-600" />
            <span className="text-sm font-medium">{t('dashboard.view_reports_short')}</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <StatCard
            title={t('dashboard.total_hours')}
            value={(totalHours || 0).toFixed(2)}
            icon={Clock}
            description={t('dashboard.total_hours_desc')}
            className="text-blue-600"
          />
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <StatCard
            title={t('dashboard.active_projects')}
            value={activeProjects.toString()}
            icon={Briefcase}
            description={`จากทั้งหมด ${projects.length} โครงการ`}
            className="text-green-600"
          />
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <StatCard
            title={t('dashboard.pending_approvals')}
            value={pendingApprovals.toString()}
            icon={AlertCircle}
            description={t('dashboard.pending_approvals_desc')}
            className="text-amber-600"
          />
        </div>
        <div className="border rounded-lg p-4 bg-purple-50">
          <StatCard
            title="สมาชิกในทีม"
            value={activeTeamMembers.toString()}
            icon={Users}
            description="ทั้งหมดในทีม"
            className="text-purple-600"
          />
        </div>
      </div>

      {/* Additional Stats for Managers/Admins */}
      {(isAdmin || isManager || isVP) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="border rounded-lg p-4 bg-indigo-50">
            <StatCard
              title="ชั่วโมงรวมทีม"
              value={(totalTeamHours || 0).toFixed(2)}
              icon={Activity}
              description="ชั่วโมงทำงานของทีมทั้งหมด"
              className="text-indigo-600"
            />
          </div>
          <div className="border rounded-lg p-4 bg-amber-50">
            <StatCard
              title="คำขอต้นทุนรออนุมัติ"
              value={pendingCostRequests.toString()}
              icon={DollarSign}
              description="คำขอที่รอการอนุมัติ"
              className="text-amber-600"
            />
          </div>
          <div className="border rounded-lg p-4 bg-red-50">
            <StatCard
              title="ต้นทุนรวม"
              value={`฿${totalCostAmount.toLocaleString()}`}
              icon={Target}
              description="ต้นทุนรวมทั้งหมด"
              className="text-red-600"
            />
          </div>
          <div className="border rounded-lg p-4 bg-emerald-50">
            <StatCard
              title="อัตราการอนุมัติ"
              value={`${((approvedTimesheets || 0) / Math.max(1, (approvedTimesheets || 0) + (rejectedTimesheets || 0)) * 100).toFixed(1)}%`}
              icon={CheckCircle2}
              description="อัตราการอนุมัติไทม์ชีท"
              className="text-emerald-600"
            />
          </div>
        </div>
      )}

      {/* Main Dashboard Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('dashboard.analytics')}</TabsTrigger>
          <TabsTrigger value="projects">{t('dashboard.projects')}</TabsTrigger>
          <TabsTrigger value="activities">{t('dashboard.activities')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Weekly Hours Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  สถิติชั่วโมงทำงานรายสัปดาห์
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} ชั่วโมง`, "ชั่วโมงทำงาน"]}
                        labelFormatter={(label) => `วัน${label}`}
                      />
                      <Bar 
                        dataKey="hours" 
                        fill="#3b82f6" 
                        name="ชั่วโมงทำงาน"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Project Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  สถานะโครงการ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6">
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Timesheet Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  สถานะไทม์ชีท
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={timesheetStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {timesheetStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  แนวโน้มประสิทธิภาพ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2" />
                โครงการล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {projects.slice(0, 6).map((project: any) => (
                  <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-lg">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.jobCode && `Job Code: ${project.jobCode}`}
                        </p>
                      </div>
                      <Badge variant={
                        project.status === 'ACTIVE' ? 'default' :
                        project.status === 'COMPLETED' ? 'secondary' : 'outline'
                      }>
                        {project.status === 'ACTIVE' ? 'กำลังดำเนินการ' : 
                         project.status === 'COMPLETED' ? 'เสร็จสิ้น' : 'ระงับ'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>ความคืบหน้า</span>
                        <span>{project.progress || 0}%</span>
                      </div>
                      <Progress value={project.progress || 0} className="h-2" />
                      <div className="text-sm text-muted-foreground">
                        <div>ผู้จัดการ: {project.manager?.name || 'ไม่ระบุ'}</div>
                        <div>งบประมาณ: {project.budget ? `฿${Number(project.budget).toLocaleString()}` : 'ไม่ระบุ'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                กิจกรรมล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full ${
                      activity.color === 'blue' ? 'bg-blue-100' :
                      activity.color === 'green' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      <activity.icon className={`h-4 w-4 ${
                        activity.color === 'blue' ? 'text-blue-600' :
                        activity.color === 'green' ? 'text-green-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{activity.title}</p>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(activity.date), 'd MMM HH:mm', { locale: th })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Zap className="h-4 w-4 mr-2" />
              ข้อมูลด่วน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">ประสิทธิภาพเฉลี่ย</span>
              <Badge variant="outline">85%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">เป้าหมายรายสัปดาห์</span>
              <Badge variant="outline">40 ชม.</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">คะแนนความพึงพอใจ</span>
              <Badge variant="outline">4.8/5</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <CalendarDays className="h-4 w-4 mr-2" />
              ปฏิทิน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-2xl font-bold">{format(new Date(), 'd')}</div>
              <div className="text-sm text-muted-foreground">{format(new Date(), 'MMMM yyyy', { locale: th })}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>ประชุมทีม 14:00</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>ส่งรายงาน 16:00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Star className="h-4 w-4 mr-2" />
              ความสำเร็จ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">เสร็จสิ้นโครงการ 3 โครงการ</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <span className="text-sm">อนุมัติไทม์ชีท 25 รายการ</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm">บรรลุเป้าหมาย 90%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;