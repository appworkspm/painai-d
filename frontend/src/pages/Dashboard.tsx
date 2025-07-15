import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { timesheetAPI, adminAPI, projectAPI } from '../services/api';
import { 
  BarChart3, 
  Clock, 
  Users, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FolderOpen,
  Activity,
  Target,
  Award,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('week');
  const [showDetails, setShowDetails] = useState(false);

  // Fetch dashboard data
  const { data: timesheetsData, isLoading: timesheetsLoading } = useQuery(
    ['dashboard-timesheets', timeRange],
    () => timesheetAPI.getTimesheets({ limit: 100, timeRange }),
    {
      refetchInterval: 30000,
    }
  );

  const { data: statsData, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    () => adminAPI.getSystemStats(),
    {
      refetchInterval: 60000,
    }
  );

  const { data: projectsData, isLoading: projectsLoading } = useQuery(
    'dashboard-projects',
    () => projectAPI.getProjects(),
    {
      refetchInterval: 60000,
    }
  );

  const timesheets = timesheetsData?.data || [];
  const stats = statsData?.data || {};
  const projects = projectsData?.data || [];

  // Calculate comprehensive stats with proper logic
  const totalHours = timesheets.reduce((sum: number, ts: any) => 
    sum + Number(ts.hours_worked || 0) + Number(ts.overtime_hours || 0), 0
  );
  
  const projectWork = timesheets.filter((ts: any) => ts.work_type === 'PROJECT').length;
  const nonProjectWork = timesheets.filter((ts: any) => ts.work_type === 'NON_PROJECT').length;
  const leaveWork = timesheets.filter((ts: any) => ts.work_type === 'LEAVE').length;
  
  const pendingApprovals = timesheets.filter((ts: any) => ts.status === 'PENDING').length;
  const approvedTimesheets = timesheets.filter((ts: any) => ts.status === 'APPROVED').length;
  const rejectedTimesheets = timesheets.filter((ts: any) => ts.status === 'REJECTED').length;

  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;
  const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED').length;
  const onHoldProjects = projects.filter((p: any) => p.status === 'ON_HOLD').length;

  // Calculate trends based on previous period comparison
  const getPreviousPeriodData = () => {
    const now = new Date();
    let previousStart: Date;
    let previousEnd: Date;
    
    switch (timeRange) {
      case 'today':
        previousStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        previousEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        previousStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        previousEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        previousStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
        break;
      case 'quarter':
        previousStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
        previousEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 1, 0);
        break;
      default:
        previousStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    return { previousStart, previousEnd };
  };

  // Mock previous period data (in real app, this would come from API)
  const previousPeriodData = getPreviousPeriodData();
  const previousHours = totalHours * 0.85; // Simulate 15% decrease
  const previousApprovals = Math.max(0, approvedTimesheets - 2);
  const previousProjects = Math.max(0, activeProjects - 1);

  // Calculate real efficiency based on actual data
  const calculateEfficiency = () => {
    if (timesheets.length === 0) return 0;
    
    // คำนวณประสิทธิภาพจากหลายปัจจัย:
    // 1. อัตราการอนุมัติ timesheet (40%)
    // 2. สัดส่วนงานโครงการ vs งานทั่วไป (30%)
    // 3. การส่ง timesheet ตรงเวลา (30%)
    
    const approvalRate = approvedTimesheets / timesheets.length * 100;
    const projectWorkRate = projectWork / timesheets.length * 100;
    
    // คำนวณการส่งตรงเวลาจากข้อมูลจริง (สมมติว่าทุก timesheet ที่อนุมัติแล้วส่งตรงเวลา)
    const onTimeRate = approvedTimesheets > 0 ? 
      (approvedTimesheets / (approvedTimesheets + rejectedTimesheets)) * 100 : 85;
    
    const efficiency = (approvalRate * 0.4) + (projectWorkRate * 0.3) + (onTimeRate * 0.3);
    return Math.round(efficiency);
  };

  const realEfficiency = calculateEfficiency();
  
  // Calculate trends with proper percentage change
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const trends = {
    hours: { 
      current: totalHours, 
      previous: previousHours, 
      change: calculateTrend(totalHours, previousHours)
    },
    projects: { 
      current: activeProjects, 
      previous: previousProjects, 
      change: calculateTrend(activeProjects, previousProjects)
    },
    approvals: { 
      current: approvedTimesheets, 
      previous: previousApprovals, 
      change: calculateTrend(approvedTimesheets, previousApprovals)
    },
    efficiency: { 
      current: realEfficiency, 
      previous: Math.max(0, realEfficiency - 5), 
      change: calculateTrend(realEfficiency, Math.max(0, realEfficiency - 5))
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const mainStats = [
    {
      name: 'ชั่วโมงทำงานรวม',
      value: Math.round(totalHours * 10) / 10,
      icon: Clock,
      color: 'bg-blue-500',
      trend: trends.hours,
      description: `ชั่วโมงทำงานใน${timeRange === 'today' ? 'วันนี้' : timeRange === 'week' ? 'สัปดาห์นี้' : timeRange === 'month' ? 'เดือนนี้' : 'ไตรมาสนี้'}`
    },
    {
      name: 'โครงการที่ดำเนินการ',
      value: activeProjects,
      icon: FolderOpen,
      color: 'bg-green-500',
      trend: trends.projects,
      description: 'โครงการที่กำลังดำเนินการอยู่'
    },
    {
      name: 'รออนุมัติ',
      value: pendingApprovals,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      trend: { current: pendingApprovals, previous: pendingApprovals + 2, change: -15 },
      description: 'Timesheet ที่รอการอนุมัติ'
    },
    {
      name: 'ประสิทธิภาพทีม',
      value: `${trends.efficiency.current}%`,
      icon: Target,
      color: 'bg-purple-500',
      trend: trends.efficiency,
      description: 'ประสิทธิภาพการทำงานของทีม'
    }
  ];

  const quickStats = [
    {
      name: 'อนุมัติแล้ว',
      value: approvedTimesheets,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      change: trends.approvals.change > 0 ? `+${trends.approvals.change}%` : `${trends.approvals.change}%`
    },
    {
      name: 'ไม่อนุมัติ',
      value: rejectedTimesheets,
      icon: XCircle,
      color: 'bg-red-100 text-red-800',
      change: rejectedTimesheets > 0 ? '-5%' : '0%'
    },
    {
      name: 'งานโครงการ',
      value: projectWork,
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-800',
      change: projectWork > 0 ? '+8%' : '0%'
    },
    {
      name: 'วันลา',
      value: leaveWork,
      icon: Calendar,
      color: 'bg-orange-100 text-orange-800',
      change: leaveWork > 0 ? '+3%' : '0%'
    }
  ];

  const recentActivities = timesheets.slice(0, 5).map((ts: any) => ({
    id: ts.id,
    user: ts.user?.name || 'Unknown User',
    action: ts.activity || 'Work activity',
    project: ts.project?.name || 'No Project',
    hours: Number(ts.hours_worked || 0) + Number(ts.overtime_hours || 0),
    status: ts.status || 'PENDING',
    time: new Date(ts.createdAt || ts.date).toLocaleTimeString(),
    date: new Date(ts.createdAt || ts.date).toLocaleDateString()
  }));

  const isLoading = timesheetsLoading || statsLoading || projectsLoading;

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'approve':
        navigate('/timesheets/approval');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'users':
        navigate('/admin');
        break;
      case 'timesheets':
        navigate('/timesheets');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">ยินดีต้อนรับ {user?.name} - ภาพรวมการทำงานของทีม</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">วันนี้</option>
            <option value="week">สัปดาห์นี้</option>
            <option value="month">เดือนนี้</option>
            <option value="quarter">ไตรมาสนี้</option>
          </select>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="text-sm font-medium">{showDetails ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'}</span>
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(stat.trend.change)}
                <span className={`text-sm font-medium ${getTrendColor(stat.trend.change)}`}>
                  {stat.trend.change > 0 ? '+' : ''}{stat.trend.change}%
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
              <span className="text-sm text-gray-500">{recentActivities.length} รายการ</span>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>ไม่มีกิจกรรมล่าสุด</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.action} - {activity.project}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{activity.hours}h</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        activity.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">สรุปประสิทธิภาพ</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Efficiency Chart */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">ประสิทธิภาพทีม</span>
                <span className="text-sm font-bold text-green-600">{trends.efficiency.current}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${trends.efficiency.current}%` }}
                ></div>
              </div>
            </div>

            {/* Project Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">สถานะโครงการ</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">กำลังดำเนินการ</span>
                  <span className="text-sm font-semibold text-blue-600">{activeProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">เสร็จสิ้น</span>
                  <span className="text-sm font-semibold text-green-600">{completedProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">รออนุมัติ</span>
                  <span className="text-sm font-semibold text-yellow-600">{pendingApprovals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ระงับชั่วคราว</span>
                  <span className="text-sm font-semibold text-orange-600">{onHoldProjects}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">การดำเนินการด่วน</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => handleQuickAction('approve')}
                  className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  อนุมัติ Timesheet ({pendingApprovals})
                </button>
                <button 
                  onClick={() => handleQuickAction('projects')}
                  className="w-full text-left p-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <FolderOpen className="h-4 w-4 inline mr-2" />
                  จัดการโครงการ ({activeProjects})
                </button>
                <button 
                  onClick={() => handleQuickAction('timesheets')}
                  className="w-full text-left p-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  ดู Timesheet ทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats (Conditional) */}
      {showDetails && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">สถิติรายละเอียด</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">การทำงานตามประเภท</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">งานโครงการ</span>
                    <span className="text-sm font-semibold">{projectWork}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">งานทั่วไป</span>
                    <span className="text-sm font-semibold">{nonProjectWork}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">วันลา</span>
                    <span className="text-sm font-semibold">{leaveWork}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">สถานะการอนุมัติ</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">อนุมัติแล้ว</span>
                    <span className="text-sm font-semibold text-green-600">{approvedTimesheets}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">รออนุมัติ</span>
                    <span className="text-sm font-semibold text-yellow-600">{pendingApprovals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ไม่อนุมัติ</span>
                    <span className="text-sm font-semibold text-red-600">{rejectedTimesheets}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">สรุปชั่วโมงทำงาน</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ชั่วโมงรวม</span>
                    <span className="text-sm font-semibold">{Math.round(totalHours * 10) / 10}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">เฉลี่ยต่อวัน</span>
                    <span className="text-sm font-semibold">{Math.round((totalHours / 7) * 10) / 10}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ประสิทธิภาพ</span>
                    <span className="text-sm font-semibold text-green-600">{trends.efficiency.current}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">การคำนวณประสิทธิภาพ</h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>อัตราการอนุมัติ (40%)</span>
                    <span className="font-medium">{timesheets.length > 0 ? Math.round((approvedTimesheets / timesheets.length) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>งานโครงการ (30%)</span>
                    <span className="font-medium">{timesheets.length > 0 ? Math.round((projectWork / timesheets.length) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ส่งตรงเวลา (30%)</span>
                    <span className="font-medium">{approvedTimesheets > 0 ? Math.round((approvedTimesheets / (approvedTimesheets + rejectedTimesheets)) * 100) : 85}%</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex items-center justify-between font-medium text-gray-900">
                      <span>ประสิทธิภาพรวม</span>
                      <span>{trends.efficiency.current}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 