import React, { useState, useEffect } from 'react';
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
  PieChart,
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
  TrendingUp,
  MapPin,
  Building,
  User,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format, parseISO, isThisWeek, isThisMonth } from 'date-fns';
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
  Area,
  LineChart,
  Line
} from 'recharts';

import { useAuth } from '@/contexts/AuthContext';
import { projectAPI, timesheetAPI, costRequestAPI } from '@/services/api';
import { StatCard } from '@/components/ui/StatCard';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProjectDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isVP = user?.role === 'vp';

  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('month');

  // Fetch projects
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectAPI.getProjects(),
  });

  // Fetch timesheets
  const { data: timesheetsData, isLoading: isLoadingTimesheets } = useQuery({
    queryKey: ['timesheets'],
    queryFn: () => timesheetAPI.getTimesheets(),
    enabled: isAdmin || isManager || isVP,
  });

  // Fetch cost requests
  const { data: costRequestsData, isLoading: isLoadingCosts } = useQuery({
    queryKey: ['cost-requests'],
    queryFn: () => costRequestAPI.getCostRequests(),
    enabled: isAdmin || isManager || isVP,
  });

  // Helper function to safely extract data from paginated responses
  const getDataFromPaginated = (data: any) => (data && Array.isArray(data.data) ? data.data : []);

  const projects = getDataFromPaginated(projectsData);
  const timesheets = getDataFromPaginated(timesheetsData);
  const costRequests = getDataFromPaginated(costRequestsData);

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === 'ACTIVE').length,
    completed: projects.filter((p: any) => p.status === 'COMPLETED').length,
    onHold: projects.filter((p: any) => p.status === 'ON_HOLD').length,
    cancelled: projects.filter((p: any) => p.status === 'CANCELLED').length,
  };

  // Calculate timesheet statistics
  const timesheetStats = {
    total: timesheets.length,
    approved: timesheets.filter((t: any) => t.status === 'approved').length,
    pending: timesheets.filter((t: any) => t.status === 'submitted').length,
    rejected: timesheets.filter((t: any) => t.status === 'rejected').length,
    totalHours: timesheets.reduce((sum: number, t: any) => sum + (t.hours_worked || 0), 0),
  };

  // Calculate cost statistics
  const costStats = {
    total: costRequests.length,
    approved: costRequests.filter((c: any) => c.status === 'APPROVED').length,
    pending: costRequests.filter((c: any) => c.status === 'PENDING').length,
    rejected: costRequests.filter((c: any) => c.status === 'REJECTED').length,
    totalAmount: costRequests.reduce((sum: number, c: any) => sum + (c.amount || 0), 0),
  };

  // Filter data based on selected project
  const filteredTimesheets = selectedProject === 'all' 
    ? timesheets 
    : timesheets.filter((t: any) => t.project_id === selectedProject);

  const filteredCosts = selectedProject === 'all'
    ? costRequests
    : costRequests.filter((c: any) => c.projectId === selectedProject);

  // Prepare chart data
  const projectStatusData = [
    { name: 'กำลังดำเนินการ', value: projectStats.active, color: '#3b82f6' },
    { name: 'เสร็จสิ้น', value: projectStats.completed, color: '#10b981' },
    { name: 'ระงับ', value: projectStats.onHold, color: '#f59e0b' },
    { name: 'ยกเลิก', value: projectStats.cancelled, color: '#ef4444' },
  ];

  const timesheetStatusData = [
    { name: 'อนุมัติแล้ว', value: timesheetStats.approved, color: '#10b981' },
    { name: 'รออนุมัติ', value: timesheetStats.pending, color: '#f59e0b' },
    { name: 'ไม่อนุมัติ', value: timesheetStats.rejected, color: '#ef4444' },
  ];

  const costStatusData = [
    { name: 'อนุมัติแล้ว', value: costStats.approved, color: '#10b981' },
    { name: 'รออนุมัติ', value: costStats.pending, color: '#f59e0b' },
    { name: 'ไม่อนุมัติ', value: costStats.rejected, color: '#ef4444' },
  ];

  // Weekly chart data
  const weeklyChartData = [
    { day: 'จันทร์', hours: 8, costs: 15000 },
    { day: 'อังคาร', hours: 7.5, costs: 12000 },
    { day: 'พุธ', hours: 9, costs: 18000 },
    { day: 'พฤหัสบดี', hours: 8.5, costs: 16000 },
    { day: 'ศุกร์', hours: 7, costs: 14000 },
    { day: 'เสาร์', hours: 4, costs: 8000 },
    { day: 'อาทิตย์', hours: 0, costs: 0 },
  ];

  // Project performance data
  const projectPerformanceData = projects.slice(0, 5).map((project: any) => ({
    name: project.name,
    progress: Math.floor(Math.random() * 100),
    budget: project.budget || 0,
    spent: Math.floor((project.budget || 0) * (Math.random() * 0.8 + 0.2)),
    team: project.team?.length || 0,
  }));

  // Recent activities
  const recentActivities = [
    ...timesheets.slice(0, 3).map((ts: any) => ({
      id: ts.id,
      type: 'timesheet',
      action: ts.status === 'approved' ? 'อนุมัติไทม์ชีท' : 'ส่งไทม์ชีท',
      project: ts.project?.name || 'ไม่มีโครงการ',
      user: ts.user?.name || 'ไม่ระบุ',
      time: new Date(ts.created_at),
      status: ts.status
    })),
    ...costRequests.slice(0, 3).map((cr: any) => ({
      id: cr.id,
      type: 'cost',
      action: cr.status === 'APPROVED' ? 'อนุมัติค่าใช้จ่าย' : 'ส่งคำขอค่าใช้จ่าย',
      project: cr.project?.name || 'ไม่มีโครงการ',
      user: cr.user?.name || 'ไม่ระบุ',
      time: new Date(cr.created_at),
      status: cr.status
    }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'submitted':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'submitted':
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ดโครงการ</h1>
          <p className="text-gray-600">ภาพรวมการดำเนินงานและประสิทธิภาพของโครงการ</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="เลือกโครงการ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกโครงการ</SelectItem>
              {projects.map((project: any) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">สัปดาห์</SelectItem>
              <SelectItem value="month">เดือน</SelectItem>
              <SelectItem value="quarter">ไตรมาส</SelectItem>
              <SelectItem value="year">ปี</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="โครงการทั้งหมด"
          value={projectStats.total}
          icon={FolderOpen}
          description="จำนวนโครงการในระบบ"
          trend="+12%"
          trendDirection="up"
        />
        <StatCard
          title="โครงการที่กำลังดำเนินการ"
          value={projectStats.active}
          icon={Activity}
          description="โครงการที่กำลังดำเนินการอยู่"
          trend="+5%"
          trendDirection="up"
        />
        <StatCard
          title="ชั่วโมงทำงานรวม"
          value={timesheetStats.totalHours}
          icon={Clock}
          description="ชั่วโมงทำงานทั้งหมด"
          trend="+8%"
          trendDirection="up"
        />
        <StatCard
          title="ค่าใช้จ่ายรวม"
          value={`฿${costStats.totalAmount.toLocaleString()}`}
          icon={DollarSign}
          description="ค่าใช้จ่ายทั้งหมด"
          trend="+15%"
          trendDirection="up"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="analytics">การวิเคราะห์</TabsTrigger>
          <TabsTrigger value="performance">ประสิทธิภาพ</TabsTrigger>
          <TabsTrigger value="activities">กิจกรรมล่าสุด</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  สถานะโครงการ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

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
          </div>

          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                ความคืบหน้าประจำสัปดาห์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="ชั่วโมง"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="costs" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="ค่าใช้จ่าย (บาท)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  การวิเคราะห์ค่าใช้จ่าย
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981">
                        {costStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Project Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  ประสิทธิภาพโครงการ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectPerformanceData.map((project, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{project.name}</span>
                        <span className="text-sm text-gray-500">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>งบประมาณ: ฿{project.budget.toLocaleString()}</span>
                        <span>ใช้ไป: ฿{project.spent.toLocaleString()}</span>
                        <span>ทีม: {project.team} คน</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                ตัวชี้วัดประสิทธิภาพ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {projectStats.active > 0 ? Math.round((projectStats.completed / projectStats.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">อัตราการเสร็จสิ้นโครงการ</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {timesheetStats.total > 0 ? Math.round((timesheetStats.approved / timesheetStats.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">อัตราการอนุมัติไทม์ชีท</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {costStats.total > 0 ? Math.round((costStats.approved / costStats.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">อัตราการอนุมัติค่าใช้จ่าย</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                กิจกรรมล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">
                        {activity.project} - {activity.user}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(activity.time, 'PPPp', { locale: th })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDashboard; 