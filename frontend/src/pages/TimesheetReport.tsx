import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Clock, 
  BarChart3, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Filter, 
  Calendar, 
  TrendingUp, 
  RefreshCw, 
  FileText,
  Users,
  Target,
  Activity,
  Eye,
  EyeOff,
  CalendarDays,
  PieChart as PieChartIcon,
  BarChart,
  LineChart,
  Download as DownloadIcon,
  Share2,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { reportAPI, timesheetAPI, projectAPI, userAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import { format, parseISO, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';
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
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart,
  Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

interface TimesheetReportData {
  totalTimesheets: number;
  totalHours: number;
  activeUsers: number;
  activeProjects: number;
  averageHoursPerDay: number;
  averageHoursPerUser: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  statusSummary: Array<{
    status: string;
    count: number;
    hours: number;
    percentage: number;
  }>;
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    hours: number;
    timesheetCount: number;
    averageHours: number;
  }>;
  topProjects: Array<{
    id: string;
    name: string;
    hours: number;
    timesheetCount: number;
    userCount: number;
  }>;
  hourlyTrend: Array<{
    date: string;
    hours: number;
    count: number;
  }>;
  dailyTrend: Array<{
    date: string;
    hours: number;
    count: number;
  }>;
  workTypeDistribution: Array<{
    workType: string;
    hours: number;
    count: number;
    percentage: number;
  }>;
  timesheets: Array<{
    id: string;
    date: string;
    user: { name: string; email: string };
    project: { name: string; code: string };
    description: string;
    duration: number;
    status: string;
    workType: string;
    subWorkType: string;
  }>;
  trends?: {
    timesheets?: { value: number; isPositive: boolean };
    hours?: { value: number; isPositive: boolean };
    users?: { value: number; isPositive: boolean };
    projects?: { value: number; isPositive: boolean };
  };
  monthOverMonthGrowth?: number;
  efficiencyRate?: number;
}

const TimesheetReport: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<TimesheetReportData | null>(null);
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
    status: 'all',
    project: 'all',
    workType: 'all',
    subWorkType: 'all',
    activity: 'all',
    user: 'all'
  });

  // Fetch options for filters
  const [filterOptions, setFilterOptions] = useState({
    status: [],
    projects: [],
    workTypes: [],
    activities: [],
    users: []
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadTimesheetReport();
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        projectAPI.getProjects(),
        userAPI.getUsers()
      ]);

      setFilterOptions({
        status: [
          { value: 'APPROVED', label: 'อนุมัติแล้ว' },
          { value: 'PENDING', label: 'รออนุมัติ' },
          { value: 'REJECTED', label: 'ไม่อนุมัติ' }
        ],
        projects: projectsRes.data?.data?.map((p: any) => ({
          value: p.id,
          label: p.name
        })) || [],
        workTypes: [
          { value: 'DEVELOPMENT', label: 'การพัฒนา' },
          { value: 'TESTING', label: 'การทดสอบ' },
          { value: 'DESIGN', label: 'การออกแบบ' },
          { value: 'MEETING', label: 'การประชุม' },
          { value: 'DOCUMENTATION', label: 'เอกสาร' },
          { value: 'OTHER', label: 'อื่นๆ' }
        ],
        activities: [
          { value: 'CODING', label: 'เขียนโค้ด' },
          { value: 'DEBUGGING', label: 'แก้ไขบั๊ก' },
          { value: 'REVIEW', label: 'ตรวจสอบ' },
          { value: 'PLANNING', label: 'วางแผน' },
          { value: 'RESEARCH', label: 'วิจัย' }
        ],
        users: usersRes.data?.data?.map((u: any) => ({
          value: u.id,
          label: u.name
        })) || []
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
      showNotification('error', 'ไม่สามารถโหลดตัวเลือกตัวกรองได้');
    }
  };

  const loadTimesheetReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.dateRange.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : undefined,
        endDate: filters.dateRange.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        projectId: filters.project !== 'all' ? filters.project : undefined,
        workType: filters.workType !== 'all' ? filters.workType : undefined,
        userId: filters.user !== 'all' ? filters.user : undefined
      };

      const response = await reportAPI.getTimesheetReport(params);
      setReportData(response.data);
    } catch (error) {
      console.error('Error loading timesheet report:', error);
      showNotification('error', 'ไม่สามารถโหลดรายงานได้');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setFilters({
      dateRange: { start: thirtyDaysAgo, end: today },
      status: 'all',
      project: 'all',
      workType: 'all',
      subWorkType: 'all',
      activity: 'all',
      user: 'all'
    });
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' | 'print' | 'share' | 'copy') => {
    setExporting(true);
    try {
      const params = {
        startDate: filters.dateRange.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : undefined,
        endDate: filters.dateRange.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        projectId: filters.project !== 'all' ? filters.project : undefined,
        workType: filters.workType !== 'all' ? filters.workType : undefined,
        userId: filters.user !== 'all' ? filters.user : undefined
      };

      switch (format) {
        case 'csv':
          await reportAPI.exportTimesheetCSV(params);
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
          const summary = `รายงาน Timesheet\nช่วงวันที่: ${filters.dateRange.start ? format(filters.dateRange.start, 'dd/MM/yyyy') : ''} - ${filters.dateRange.end ? format(filters.dateRange.end, 'dd/MM/yyyy') : ''}\nTimesheet ทั้งหมด: ${reportData?.totalTimesheets || 0}\nชั่วโมงรวม: ${formatHours(reportData?.totalHours || 0)}`;
          navigator.clipboard.writeText(summary);
          showNotification('success', 'คัดลอกข้อมูลแล้ว');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      showNotification('error', 'ไม่สามารถส่งออกรายงานได้');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'REJECTED': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'อนุมัติแล้ว';
      case 'PENDING': return 'รออนุมัติ';
      case 'REJECTED': return 'ไม่อนุมัติ';
      default: return status;
    }
  };

  const getTrendIcon = (trend?: { value: number; isPositive: boolean }) => {
    if (!trend) return <Minus className="h-4 w-4" />;
    return trend.isPositive ? 
      <ArrowUpRight className="h-4 w-4" /> : 
      <ArrowDownRight className="h-4 w-4" />;
  };

  const tableColumns = [
    {
      key: 'date',
      label: 'วันที่',
      sortable: true,
      render: (value: string) => format(parseISO(value), 'dd/MM/yyyy', { locale: th })
    },
    {
      key: 'user.name',
      label: 'ผู้ใช้',
      sortable: true,
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium">{row.user?.name}</div>
          <div className="text-sm text-gray-500">{row.user?.email}</div>
        </div>
      )
    },
    {
      key: 'project.name',
      label: 'โครงการ',
      sortable: true,
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium">{row.project?.name || '-'}</div>
          <div className="text-sm text-gray-500">{row.project?.code || ''}</div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'รายละเอียด',
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'duration',
      label: 'ชั่วโมง',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => formatHours(value / 60)
    },
    {
      key: 'workType',
      label: 'ประเภทงาน',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'สถานะ',
      sortable: true,
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {getStatusText(value)}
        </Badge>
      )
    }
  ];

  if (!reportData && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">รายงาน Timesheet</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">วิเคราะห์และติดตามข้อมูลการทำงาน</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">รายงาน Timesheet</h1>
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
            fileName={`timesheet-report-${format(new Date(), 'yyyy-MM-dd')}`}
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
          showStatus={true}
          showProject={true}
          showUser={true}
          showWorkType={true}
          showActivity={true}
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
              title="Timesheet ทั้งหมด"
              value={formatNumber(reportData.totalTimesheets)}
              subtitle={`${reportData.averageHoursPerDay.toFixed(1)} ชั่วโมง/วัน`}
              icon={<FileText className="h-5 w-5" />}
              trend={reportData.trends?.timesheets}
              status="info"
              size="lg"
            />
            <ReportCard
              title="ชั่วโมงรวม"
              value={formatHours(reportData.totalHours)}
              subtitle={`${reportData.averageHoursPerUser.toFixed(1)} ชั่วโมง/คน`}
              icon={<Clock className="h-5 w-5" />}
              trend={reportData.trends?.hours}
              status="success"
              size="lg"
            />
            <ReportCard
              title="ผู้ใช้ที่ใช้งาน"
              value={formatNumber(reportData.activeUsers)}
              subtitle={`${formatPercentage(reportData.activeUsers, reportData.topUsers?.length || 1)} ของทั้งหมด`}
              icon={<Users className="h-5 w-5" />}
              trend={reportData.trends?.users}
              status="warning"
              size="lg"
            />
            <ReportCard
              title="โครงการที่ใช้งาน"
              value={formatNumber(reportData.activeProjects)}
              subtitle={`${reportData.topProjects?.length || 0} โครงการหลัก`}
              icon={<Target className="h-5 w-5" />}
              trend={reportData.trends?.projects}
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
                <PieChartIcon className="h-4 w-4" />
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
              {/* Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    สรุปสถานะ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reportData.statusSummary?.map((status) => (
                      <div key={status.status} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(status.status)}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{getStatusText(status.status)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{status.count} รายการ</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className={getStatusColor(status.status)}>
                            {formatPercentage(status.count, reportData.totalTimesheets)}
                          </Badge>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatHours(status.hours)}
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
                      <Users className="h-5 w-5" />
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
                              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatHours(user.hours)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.timesheetCount} รายการ</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">เฉลี่ย {formatHours(user.averageHours)}/รายการ</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top Projects */}
              {reportData.topProjects && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      โครงการที่มีกิจกรรมสูงสุด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.topProjects.slice(0, 5).map((project, index) => (
                        <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{project.userCount} ผู้ใช้</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatHours(project.hours)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{project.timesheetCount} รายการ</p>
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
                  {/* Status Distribution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5" />
                        การกระจายตามสถานะ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={reportData.statusSummary}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${getStatusText(name)} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="hours"
                          >
                            {reportData.statusSummary?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any, name: any) => [
                              formatHours(value), 
                              getStatusText(name)
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Hours Trend Chart */}
                  {reportData.hourlyTrend && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LineChart className="h-5 w-5" />
                          แนวโน้มชั่วโมงรายวัน
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <ComposedChart data={reportData.hourlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => format(parseISO(value), 'dd/MM')}
                            />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(value) => format(parseISO(value), 'dd/MM/yyyy')}
                              formatter={(value: any, name: any) => [
                                name === 'hours' ? formatHours(value) : value,
                                name === 'hours' ? 'ชั่วโมง' : 'รายการ'
                              ]}
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="hours" 
                              stroke="#3B82F6" 
                              fill="#3B82F6" 
                              fillOpacity={0.3}
                              name="ชั่วโมง"
                            />
                            <Bar 
                              dataKey="count" 
                              fill="#10B981" 
                              opacity={0.7}
                              name="จำนวนรายการ"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Work Type Distribution */}
                  {reportData.workTypeDistribution && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart className="h-5 w-5" />
                          การกระจายตามประเภทงาน
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsBarChart data={reportData.workTypeDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="workType" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: any) => [formatHours(value), 'ชั่วโมง']}
                            />
                            <Bar dataKey="hours" fill="#8B5CF6" />
                          </RechartsBarChart>
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
                    รายละเอียด Timesheet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedTable
                    columns={tableColumns}
                    data={reportData.timesheets || []}
                    loading={loading}
                    pagination={true}
                    pageSize={15}
                    variant="bordered"
                    striped={true}
                    hoverable={true}
                    emptyMessage="ไม่พบข้อมูล Timesheet"
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
                          <span className="text-gray-600 dark:text-gray-400">ชั่วโมงเฉลี่ยต่อวัน:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatHours(reportData.averageHoursPerDay)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">ชั่วโมงเฉลี่ยต่อผู้ใช้:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatHours(reportData.averageHoursPerUser)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">อัตราการอนุมัติ:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatPercentage(reportData.approvedCount, reportData.totalTimesheets)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">อัตราการรออนุมัติ:</span>
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                            {formatPercentage(reportData.pendingCount, reportData.totalTimesheets)}
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
                          <span className="text-gray-600 dark:text-gray-400">ประสิทธิภาพเฉลี่ย:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatPercentage(reportData.efficiencyRate || 0, 100)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">อัตราการใช้งาน:</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {formatPercentage(reportData.activeUsers, reportData.topUsers?.length || 1)}
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

export default TimesheetReport; 