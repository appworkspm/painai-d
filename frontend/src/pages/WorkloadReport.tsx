import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  CalendarDays, 
  Clock, 
  TrendingUp, 
  Download,
  BarChart3, 
  PieChart as PieChartIcon, 
  Building2, 
  UserCheck,
  Users, 
  Target, 
  Activity, 
  Eye, 
  EyeOff, 
  Filter, 
  RefreshCw,
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
  FileText
} from 'lucide-react';
import { reportAPI, userAPI, projectAPI } from '../services/api';
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
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

interface WorkloadReportData {
  totalHours: number;
  totalUsers: number;
  totalProjects: number;
  activeUsers: number;
  activeProjects: number;
  averageHoursPerUser: number;
  averageHoursPerProject: number;
  timeframe: string;
  dateRange: {
    start: string;
    end: string;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    position: string;
    hours: number;
    projects: number;
    timesheetCount: number;
    averageHours: number;
    efficiency: number;
  }>;
  departments: Array<{
    name: string;
    hours: number;
    users: number;
    userList: string[];
    averageHours: number;
    efficiency: number;
  }>;
  workTypes: Array<{
    name: string;
    hours: number;
    percentage: number;
    count: number;
  }>;
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    position: string;
    hours: number;
    projects: number;
    timesheetCount: number;
    averageHours: number;
    efficiency: number;
  }>;
  topProjects: Array<{
    id: string;
    name: string;
    status: string;
    budget: number;
    customer: string;
    hours: number;
    users: number;
    timesheetCount: number;
  }>;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    budget: number;
    customer: string;
    hours: number;
    users: number;
    timesheetCount: number;
  }>;
  summary: {
    totalTimesheets: number;
    averageHoursPerTimesheet: number;
    mostActiveUser: any;
    mostActiveProject: any;
    mostCommonWorkType: any;
  };
  trends?: {
    hours?: { value: number; isPositive: boolean };
    users?: { value: number; isPositive: boolean };
    projects?: { value: number; isPositive: boolean };
  };
  workloadDistribution: Array<{
    user: string;
    hours: number;
    projects: number;
    efficiency: number;
  }>;
  efficiencyTrend: Array<{
    date: string;
    averageEfficiency: number;
    totalHours: number;
    activeUsers: number;
  }>;
}

const WorkloadReport: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [data, setData] = useState<WorkloadReportData | null>(null);
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
    project: 'all',
    workType: 'all',
    department: 'all'
  });

  // Fetch options for filters
  const [filterOptions, setFilterOptions] = useState({
    users: [],
    projects: [],
    workTypes: [],
    departments: []
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    fetchWorkloadData();
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        userAPI.getUsers(),
        projectAPI.getProjects()
      ]);

      setFilterOptions({
        users: usersRes.data?.data?.map((u: any) => ({
          value: u.id,
          label: u.name
        })) || [],
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
        departments: [
          { value: 'DEVELOPMENT', label: 'แผนกพัฒนา' },
          { value: 'DESIGN', label: 'แผนกออกแบบ' },
          { value: 'TESTING', label: 'แผนกทดสอบ' },
          { value: 'MANAGEMENT', label: 'แผนกบริหาร' }
        ]
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
      showNotification('error', 'ไม่สามารถโหลดตัวเลือกตัวกรองได้');
    }
  };

  const fetchWorkloadData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.dateRange.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : undefined,
        endDate: filters.dateRange.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : undefined,
        userId: filters.user !== 'all' ? filters.user : undefined,
        projectId: filters.project !== 'all' ? filters.project : undefined,
        workType: filters.workType !== 'all' ? filters.workType : undefined,
        department: filters.department !== 'all' ? filters.department : undefined
      };

      const response = await reportAPI.getWorkloadReport(params);
      setData(response.data);
    } catch (error) {
      console.error('Error loading workload report:', error);
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
      user: 'all',
      project: 'all',
      workType: 'all',
      department: 'all'
    });
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' | 'print' | 'share' | 'copy') => {
    setExporting(true);
    try {
      const params = {
        startDate: filters.dateRange.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : undefined,
        endDate: filters.dateRange.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : undefined,
        userId: filters.user !== 'all' ? filters.user : undefined,
        projectId: filters.project !== 'all' ? filters.project : undefined,
        workType: filters.workType !== 'all' ? filters.workType : undefined,
        department: filters.department !== 'all' ? filters.department : undefined
      };

      switch (format) {
        case 'csv':
          await reportAPI.exportWorkloadCSV(params);
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
          const summary = `รายงานภาระงาน\nช่วงวันที่: ${filters.dateRange.start ? format(filters.dateRange.start, 'dd/MM/yyyy') : ''} - ${filters.dateRange.end ? format(filters.dateRange.end, 'dd/MM/yyyy') : ''}\nชั่วโมงรวม: ${formatHours(data?.totalHours || 0)}\nผู้ใช้ที่ใช้งาน: ${data?.activeUsers || 0}`;
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

  const getTimeframeText = (tf: string) => {
    switch (tf) {
      case 'daily': return 'รายวัน';
      case 'weekly': return 'รายสัปดาห์';
      case 'monthly': return 'รายเดือน';
      default: return tf;
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
      key: 'name',
      label: 'ผู้ใช้',
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'ตำแหน่ง',
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{row.position}</div>
          <div className="text-sm text-gray-500">{row.role}</div>
        </div>
      )
    },
    {
      key: 'hours',
      label: 'ชั่วโมง',
      sortable: true,
      align: 'right' as const,
      render: (value: number, row: any) => (
        <div className="text-right">
          <div className="font-medium">{formatHours(value)}</div>
          <div className="text-sm text-gray-500">เฉลี่ย {formatHours(row.averageHours)}</div>
        </div>
      )
    },
    {
      key: 'projects',
      label: 'โครงการ',
      sortable: true,
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-center">
          <Target className="h-4 w-4 mx-auto mb-1" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'timesheetCount',
      label: 'Timesheet',
      sortable: true,
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-center">
          <FileText className="h-4 w-4 mx-auto mb-1" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'efficiency',
      label: 'ประสิทธิภาพ',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <div className="text-right">
          <div className={`font-medium ${getEfficiencyColor(value)}`}>
            {value.toFixed(1)}%
          </div>
          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      )
    }
  ];

  if (!data && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">รายงานภาระงาน</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">วิเคราะห์และติดตามภาระงานของทีม</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">รายงานภาระงาน</h1>
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
            disabled={!data}
            fileName={`workload-report-${format(new Date(), 'yyyy-MM-dd')}`}
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
          showUser={true}
          showProject={true}
          showWorkType={true}
          showCategory={false}
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
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ReportCard
              title="ชั่วโมงรวม"
              value={formatHours(data.totalHours)}
              subtitle={`เฉลี่ย ${formatHours(data.averageHoursPerUser)}/คน`}
              icon={<Clock className="h-5 w-5" />}
              trend={data.trends?.hours}
              status="success"
              size="lg"
            />
            <ReportCard
              title="ผู้ใช้ที่ใช้งาน"
              value={formatNumber(data.activeUsers)}
              subtitle={`${formatPercentage(data.activeUsers, data.totalUsers)} ของทั้งหมด`}
              icon={<Users className="h-5 w-5" />}
              trend={data.trends?.users}
              status="info"
              size="lg"
            />
            <ReportCard
              title="โครงการที่ใช้งาน"
              value={formatNumber(data.activeProjects)}
              subtitle={`เฉลี่ย ${formatHours(data.averageHoursPerProject)}/โครงการ`}
              icon={<Target className="h-5 w-5" />}
              trend={data.trends?.projects}
              status="warning"
              size="lg"
            />
            <ReportCard
              title="ประสิทธิภาพเฉลี่ย"
              value={data.users.length > 0 ? `${(data.users.reduce((sum, u) => sum + u.efficiency, 0) / data.users.length).toFixed(1)}%` : '0%'}
              subtitle={`${data.summary.totalTimesheets} Timesheet`}
              icon={<Zap className="h-5 w-5" />}
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
                <Users className="h-4 w-4" />
                รายละเอียด
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                วิเคราะห์
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              {/* Top Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    ผู้ใช้ที่มีภาระงานสูงสุด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topUsers.slice(0, 5).map((user, index) => (
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
                          <p className="font-medium text-gray-900 dark:text-gray-100">{formatHours(user.hours)}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.projects} โครงการ</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">ประสิทธิภาพ {user.efficiency.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Department Performance */}
              {data.departments && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      ประสิทธิภาพตามแผนก
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.departments.map((dept, index) => (
                        <div key={dept.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{dept.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{dept.users} ผู้ใช้</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatHours(dept.hours)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">เฉลี่ย {formatHours(dept.averageHours)}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">ประสิทธิภาพ {dept.efficiency.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Work Type Distribution */}
              {data.workTypes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      การกระจายตามประเภทงาน
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.workTypes.map((workType, index) => (
                        <div key={workType.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{workType.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{workType.count} รายการ</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatHours(workType.hours)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{workType.percentage.toFixed(1)}%</p>
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
                  {/* Work Type Distribution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5" />
                        การกระจายตามประเภทงาน
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.workTypes}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="hours"
                          >
                            {data.workTypes?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any, name: any) => [
                              formatHours(value), 
                              name
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Workload Distribution Chart */}
                  {data.workloadDistribution && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          การกระจายภาระงาน
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <ComposedChart data={data.workloadDistribution.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="user" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: any, name: any) => [
                                name === 'hours' ? formatHours(value) : value,
                                name === 'hours' ? 'ชั่วโมง' : name === 'projects' ? 'โครงการ' : 'ประสิทธิภาพ'
                              ]}
                            />
                            <Legend />
                            <Bar 
                              dataKey="hours" 
                              fill="#3B82F6" 
                              name="ชั่วโมง"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="efficiency" 
                              stroke="#10B981" 
                              name="ประสิทธิภาพ"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Efficiency Trend Chart */}
                  {data.efficiencyTrend && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          แนวโน้มประสิทธิภาพ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={data.efficiencyTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => format(parseISO(value), 'dd/MM')}
                            />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(value) => format(parseISO(value), 'dd/MM/yyyy')}
                              formatter={(value: any, name: any) => [
                                name === 'averageEfficiency' ? `${value.toFixed(1)}%` : 
                                name === 'totalHours' ? formatHours(value) : value,
                                name === 'averageEfficiency' ? 'ประสิทธิภาพ' : 
                                name === 'totalHours' ? 'ชั่วโมง' : 'ผู้ใช้'
                              ]}
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="averageEfficiency" 
                              stroke="#3B82F6" 
                              fill="#3B82F6" 
                              fillOpacity={0.3}
                              name="ประสิทธิภาพเฉลี่ย"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="activeUsers" 
                              stroke="#10B981" 
                              name="ผู้ใช้ที่ใช้งาน"
                            />
                          </AreaChart>
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
                    <Users className="h-5 w-5" />
                    รายละเอียดภาระงาน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedTable
                    columns={tableColumns}
                    data={data.users || []}
                    loading={loading}
                    pagination={true}
                    pageSize={15}
                    variant="bordered"
                    striped={true}
                    hoverable={true}
                    emptyMessage="ไม่พบข้อมูลภาระงาน"
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
                          <span className="text-gray-600 dark:text-gray-400">ชั่วโมงเฉลี่ยต่อผู้ใช้:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatHours(data.averageHoursPerUser)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">ชั่วโมงเฉลี่ยต่อโครงการ:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatHours(data.averageHoursPerProject)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">อัตราการใช้งาน:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatPercentage(data.activeUsers, data.totalUsers)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">ประสิทธิภาพเฉลี่ย:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {data.users.length > 0 ? `${(data.users.reduce((sum, u) => sum + u.efficiency, 0) / data.users.length).toFixed(1)}%` : '0%'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">การเปรียบเทียบ</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">ผู้ใช้ที่มีประสิทธิภาพสูงสุด:</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {data.topUsers[0]?.name || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">โครงการที่มีภาระงานสูงสุด:</span>
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            {data.topProjects[0]?.name || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">ประเภทงานที่ใช้เวลามากที่สุด:</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {data.workTypes[0]?.name || '-'}
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

export default WorkloadReport; 