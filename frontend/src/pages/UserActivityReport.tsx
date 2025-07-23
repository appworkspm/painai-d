import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Download, 
  Calendar, 
  BarChart3, 
  Filter, 
  RefreshCw, 
  UserCheck,
  Eye,
  EyeOff,
  Clock,
  Target,
  FileText,
  Download as DownloadIcon,
  Share2,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Award,
  Percent,
  Zap,
  Building2,
  CalendarDays
} from 'lucide-react';
import { reportAPI, userAPI, projectAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ReportCard } from '../components/ui/ReportCard';
import { ReportFilters } from '../components/ui/ReportFilters';
import { ReportExport } from '../components/ui/ReportExport';
import { EnhancedTable } from '../components/ui/EnhancedTable';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart,
  Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

interface UserActivityReportData {
  totalActivities: number;
  totalUsers: number;
  activeUsers: number;
  totalHours: number;
  activeProjects: number;
  averageActivitiesPerDay: number;
  averageActivitiesPerUser: number;
  actionSummary: Array<{
    action: string;
    count: number;
    percentage: number;
    hours: number;
  }>;
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    position: string;
    activityCount: number;
    hours: number;
    efficiency: number;
  }>;
  recentActivities: Array<{
    id: string;
    user: { name: string; email: string };
    action: string;
    description: string;
    workType: string;
    createdAt: string;
  }>;
  activityTrend: Array<{
    date: string;
    count: number;
    users: number;
    hours: number;
  }>;
  userActivity: Array<{
    name: string;
    activityCount: number;
    hours: number;
    efficiency: number;
  }>;
  activities: Array<{
    id: string;
    user: { name: string; email: string };
    action: string;
    description: string;
    workType: string;
    createdAt: string;
  }>;
  trends?: {
    activities?: { value: number; isPositive: boolean };
    users?: { value: number; isPositive: boolean };
    hours?: { value: number; isPositive: boolean };
  };
  monthOverMonthGrowth?: number;
  mostCommonAction?: string;
}

const UserActivityReport: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<UserActivityReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [exporting, setExporting] = useState(false);
  
  // Default filters - 30 days from today
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [filters, setFilters] = useState({
    dateRange: { 
      start: thirtyDaysAgo, 
      end: today 
    },
    user: 'all',
    action: 'all',
    workType: 'all',
    subWorkType: 'all',
    activity: 'all'
  });

  // Fetch options for filters
  const [filterOptions, setFilterOptions] = useState({
    users: [],
    actions: [],
    workTypes: [],
    activities: []
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadUserActivityReport();
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const usersRes = await userAPI.getUsers();

      setFilterOptions({
        users: usersRes.data?.data?.map((u: any) => ({
          value: u.id,
          label: u.name
        })) || [],
        actions: [
          { value: 'CREATE', label: 'สร้าง' },
          { value: 'UPDATE', label: 'แก้ไข' },
          { value: 'DELETE', label: 'ลบ' },
          { value: 'APPROVE', label: 'อนุมัติ' },
          { value: 'REJECT', label: 'ไม่อนุมัติ' },
          { value: 'LOGIN', label: 'เข้าสู่ระบบ' },
          { value: 'LOGOUT', label: 'ออกจากระบบ' }
        ],
        workTypes: [
          { value: 'PROJECT', label: 'โครงการ' },
          { value: 'NON_PROJECT', label: 'งานทั่วไป' },
          { value: 'LEAVE', label: 'ลาพัก' }
        ],
        activities: [
          { value: 'DEVELOPMENT', label: 'พัฒนา' },
          { value: 'TESTING', label: 'ทดสอบ' },
          { value: 'MEETING', label: 'ประชุม' },
          { value: 'DOCUMENTATION', label: 'เอกสาร' }
        ]
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
      showNotification('error', 'ไม่สามารถโหลดตัวเลือกตัวกรองได้');
    }
  };

  const loadUserActivityReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.dateRange.start && filters.dateRange.end) {
        params.start = format(filters.dateRange.start, 'yyyy-MM-dd');
        params.end = format(filters.dateRange.end, 'yyyy-MM-dd');
      }
      if (filters.user && filters.user !== 'all') {
        params.user_id = filters.user;
      }
      if (filters.action && filters.action !== 'all') {
        params.action = filters.action;
      }
      if (filters.workType && filters.workType !== 'all') {
        params.workType = filters.workType;
      }
      if (filters.subWorkType && filters.subWorkType !== 'all') {
        params.subWorkType = filters.subWorkType;
      }
      if (filters.activity && filters.activity !== 'all') {
        params.activity = filters.activity;
      }

      const response = await reportAPI.getUserActivityReport(params);
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setReportData(null);
        showNotification('error', response.data.message || 'ไม่สามารถโหลดรายงานได้');
      }
    } catch (error) {
      setReportData(null);
      showNotification('error', 'ไม่สามารถโหลดรายงานได้');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: { 
        start: thirtyDaysAgo, 
        end: today 
      },
      user: 'all',
      action: 'all',
      workType: 'all',
      subWorkType: 'all',
      activity: 'all'
    });
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' | 'print' | 'share' | 'copy') => {
    setExporting(true);
    try {
      const params = {
        start: filters.dateRange.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : undefined,
        end: filters.dateRange.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : undefined,
        user_id: filters.user !== 'all' ? filters.user : undefined,
        action: filters.action !== 'all' ? filters.action : undefined,
        workType: filters.workType !== 'all' ? filters.workType : undefined,
        subWorkType: filters.subWorkType !== 'all' ? filters.subWorkType : undefined,
        activity: filters.activity !== 'all' ? filters.activity : undefined,
        format
      };

      switch (format) {
        case 'csv':
          await reportAPI.exportUserActivityCSV(params);
          break;
        case 'excel':
          // TODO: Implement Excel export
          showNotification('info', 'การส่งออก Excel กำลังพัฒนา');
          break;
        case 'pdf':
          // TODO: Implement PDF export
          showNotification('info', 'การส่งออก PDF กำลังพัฒนา');
          break;
        case 'print':
          window.print();
          break;
        case 'share':
          // TODO: Implement share functionality
          showNotification('info', 'ฟีเจอร์แชร์กำลังพัฒนา');
          break;
        case 'copy':
          // Copy report summary to clipboard
          const summary = `รายงานกิจกรรมผู้ใช้\nช่วงวันที่: ${filters.dateRange.start ? format(filters.dateRange.start, 'dd/MM/yyyy') : ''} - ${filters.dateRange.end ? format(filters.dateRange.end, 'dd/MM/yyyy') : ''}\nกิจกรรมทั้งหมด: ${reportData?.totalActivities || 0}\nผู้ใช้ที่ใช้งาน: ${reportData?.activeUsers || 0}`;
          navigator.clipboard.writeText(summary);
          showNotification('success', 'คัดลอกข้อมูลแล้ว');
          break;
      }
    } catch (error: any) {
      showNotification('error', error.response?.data?.message || 'ไม่สามารถ Export ได้');
    } finally {
      setExporting(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'APPROVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECT': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'LOGIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <FileText className="h-4 w-4" />;
      case 'UPDATE': return <RefreshCw className="h-4 w-4" />;
      case 'DELETE': return <FileText className="h-4 w-4" />;
      case 'APPROVE': return <UserCheck className="h-4 w-4" />;
      case 'REJECT': return <FileText className="h-4 w-4" />;
      case 'LOGIN': return <Activity className="h-4 w-4" />;
      case 'LOGOUT': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'CREATE': return 'สร้าง';
      case 'UPDATE': return 'แก้ไข';
      case 'DELETE': return 'ลบ';
      case 'APPROVE': return 'อนุมัติ';
      case 'REJECT': return 'ไม่อนุมัติ';
      case 'LOGIN': return 'เข้าสู่ระบบ';
      case 'LOGOUT': return 'ออกจากระบบ';
      default: return action;
    }
  };

  const getTrendIcon = (trend?: { value: number; isPositive: boolean }) => {
    if (!trend) return <Minus className="h-4 w-4" />;
    return trend.isPositive ? 
      <ArrowUpRight className="h-4 w-4" /> : 
      <ArrowDownRight className="h-4 w-4" />;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600 dark:text-green-400';
    if (efficiency >= 60) return 'text-blue-600 dark:text-blue-400';
    if (efficiency >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const tableColumns = [
    {
      key: 'createdAt',
      label: 'วันที่',
      sortable: true,
      render: (value: string) => format(parseISO(value), 'dd/MM/yyyy')
    },
    {
      key: 'user',
      label: 'ผู้ใช้',
      sortable: true,
      render: (value: any) => (
        <div>
          <div className="font-medium">{value?.name}</div>
          <div className="text-sm text-gray-500">{value?.email}</div>
        </div>
      )
    },
    {
      key: 'action',
      label: 'กิจกรรม',
      sortable: true,
      render: (value: string) => (
        <Badge className={getActionColor(value)}>
          {getActionText(value)}
        </Badge>
      )
    },
    {
      key: 'description',
      label: 'รายละเอียด',
      sortable: true,
      render: (value: string) => value || '-'
    },
    {
      key: 'workType',
      label: 'ประเภท',
      sortable: true,
      render: (value: string) => value || '-'
    },
    {
      key: 'createdAt',
      label: 'เวลา',
      sortable: true,
      render: (value: string) => format(parseISO(value), 'HH:mm')
    }
  ];

  if (!reportData && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">รายงานกิจกรรมผู้ใช้</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">ติดตามและวิเคราะห์กิจกรรมของผู้ใช้ในระบบ</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">ไม่มีข้อมูล</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">ไม่พบข้อมูลรายงานในช่วงเวลาที่เลือก</p>
              <Button onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                รีเซ็ตตัวกรอง
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">รายงานกิจกรรมผู้ใช้</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            ข้อมูลระหว่าง {filters.dateRange.start ? format(filters.dateRange.start, 'dd/MM/yyyy', { locale: th }) : ''} - {filters.dateRange.end ? format(filters.dateRange.end, 'dd/MM/yyyy', { locale: th }) : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-2"
          >
            {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showCharts ? 'ซ่อนกราฟ' : 'แสดงกราฟ'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            ตัวกรอง
          </Button>
          <ReportExport
            onExport={handleExport}
            loading={loading || exporting}
            disabled={!reportData}
            fileName={`user-activity-report-${format(new Date(), 'yyyy-MM-dd')}`}
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <ReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          options={filterOptions}
          showDateRange={true}
          showStatus={false}
          showProject={false}
          showUser={true}
          showWorkType={true}
          showCategory={false}
          showAction={true}
          variant="expanded"
        />
      )}

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</span>
            </div>
          </CardContent>
        </Card>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ReportCard
              title="กิจกรรมทั้งหมด"
              value={formatNumber(reportData.totalActivities || 0)}
              subtitle={`เฉลี่ย ${formatNumber(reportData.averageActivitiesPerDay || 0)}/วัน`}
              icon={<Activity className="h-5 w-5" />}
              trend={reportData.trends?.activities}
              status="success"
              size="lg"
            />
            <ReportCard
              title="ผู้ใช้ที่ใช้งาน"
              value={formatNumber(reportData.activeUsers || 0)}
              subtitle={`${formatPercentage(reportData.activeUsers || 0, reportData.totalUsers || 1)} ของทั้งหมด`}
              icon={<Users className="h-5 w-5" />}
              trend={reportData.trends?.users}
              status="info"
              size="lg"
            />
            <ReportCard
              title="ชั่วโมงรวม"
              value={formatHours(reportData.totalHours || 0)}
              subtitle={`เฉลี่ย ${formatNumber(reportData.averageActivitiesPerUser || 0)}/คน`}
              icon={<Clock className="h-5 w-5" />}
              trend={reportData.trends?.hours}
              status="warning"
              size="lg"
            />
            <ReportCard
              title="โครงการที่ใช้งาน"
              value={formatNumber(reportData.activeProjects || 0)}
              subtitle={`${reportData.mostCommonAction || '-'} พบบ่อยที่สุด`}
              icon={<Target className="h-5 w-5" />}
              status="neutral"
              size="lg"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                สรุป
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                กราฟ
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                รายละเอียด
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                วิเคราะห์
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              {/* Action Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    สรุปประเภทกิจกรรม
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportData.actionSummary?.map((action) => (
                      <div key={action.action} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getActionIcon(action.action)}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{getActionText(action.action)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{action.count} รายการ</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className={getActionColor(action.action)}>
                            {formatPercentage(action.count, reportData.totalActivities)}
                          </Badge>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatHours(action.hours)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Users */}
              {reportData.topUsers && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      ผู้ใช้ที่มีกิจกรรมสูงสุด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.topUsers.slice(0, 5).map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{user.position}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.activityCount} กิจกรรม</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatHours(user.hours)}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">ประสิทธิภาพ {user.efficiency.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activities */}
              {reportData.recentActivities && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      กิจกรรมล่าสุด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.recentActivities.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-center gap-4">
                            {getActionIcon(activity.action)}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{activity.user?.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getActionColor(activity.action)}>
                              {getActionText(activity.action)}
                            </Badge>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {format(parseISO(activity.createdAt), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              {showCharts && (
                <>
                  {/* Action Distribution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        การกระจายประเภทกิจกรรม
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={reportData.actionSummary}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${getActionText(name)} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {reportData.actionSummary?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any, name: any) => [
                              value, 
                              getActionText(name)
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Activity Trend Chart */}
                  {reportData.activityTrend && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          แนวโน้มกิจกรรมรายวัน
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <ComposedChart data={reportData.activityTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => format(parseISO(value), 'dd/MM')}
                            />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(value) => format(parseISO(value), 'dd/MM/yyyy')}
                              formatter={(value: any, name: any) => [
                                name === 'count' ? value : name === 'users' ? value : formatHours(value),
                                name === 'count' ? 'กิจกรรม' : name === 'users' ? 'ผู้ใช้' : 'ชั่วโมง'
                              ]}
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="count" 
                              stroke="#3B82F6" 
                              fill="#3B82F6" 
                              fillOpacity={0.3}
                              name="กิจกรรม"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="users" 
                              stroke="#10B981" 
                              name="ผู้ใช้"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* User Activity Chart */}
                  {reportData.userActivity && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          กิจกรรมตามผู้ใช้
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={reportData.userActivity.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: any, name: any) => [
                                name === 'activityCount' ? value : name === 'hours' ? formatHours(value) : `${value.toFixed(1)}%`,
                                name === 'activityCount' ? 'กิจกรรม' : name === 'hours' ? 'ชั่วโมง' : 'ประสิทธิภาพ'
                              ]}
                            />
                            <Legend />
                            <Bar dataKey="activityCount" fill="#3B82F6" name="กิจกรรม" />
                            <Line type="monotone" dataKey="efficiency" stroke="#10B981" name="ประสิทธิภาพ" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Detailed Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    รายละเอียดกิจกรรม
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedTable
                    columns={tableColumns}
                    data={reportData.activities || []}
                    loading={loading}
                    pagination={true}
                    pageSize={15}
                    variant="bordered"
                    striped={true}
                    hoverable={true}
                    emptyMessage="ไม่พบข้อมูลกิจกรรม"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {/* Performance Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    การวิเคราะห์ประสิทธิภาพ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">สถิติสำคัญ</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">กิจกรรมเฉลี่ยต่อวัน:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatNumber(reportData.averageActivitiesPerDay || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">กิจกรรมเฉลี่ยต่อผู้ใช้:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatNumber(reportData.averageActivitiesPerUser || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">อัตราการใช้งาน:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatPercentage(reportData.activeUsers || 0, reportData.totalUsers || 1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">กิจกรรมที่พบบ่อยที่สุด:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {reportData.mostCommonAction || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">การเปรียบเทียบ</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">เทียบกับเดือนที่แล้ว:</span>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(reportData.monthOverMonthGrowth ? {
                              value: Math.abs(reportData.monthOverMonthGrowth),
                              isPositive: reportData.monthOverMonthGrowth >= 0
                            } : undefined)}
                            <span className={`font-semibold ${(reportData.monthOverMonthGrowth || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {(reportData.monthOverMonthGrowth || 0) >= 0 ? '+' : ''}{(reportData.monthOverMonthGrowth || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">ผู้ใช้ที่มีกิจกรรมสูงสุด:</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {reportData.topUsers[0]?.name || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">ประเภทกิจกรรมที่พบบ่อย:</span>
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            {reportData.actionSummary[0] ? getActionText(reportData.actionSummary[0].action) : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
};

export default UserActivityReport; 