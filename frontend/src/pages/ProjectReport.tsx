import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FolderOpen, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Download, 
  Filter, 
  Calendar, 
  Users, 
  RefreshCw, 
  Target,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Activity,
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
  Minus,
  Building2,
  Percent,
  Award
} from 'lucide-react';
import { reportAPI, projectAPI, userAPI } from '../services/api';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

interface ProjectReportData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  totalHours: number;
  averageHoursPerProject: number;
  averageBudgetPerProject: number;
  completionRate: number;
  statusSummary: Array<{
    status: string;
    count: number;
    budget: number;
    hours: number;
    percentage: number;
  }>;
  topProjects: Array<{
    id: string;
    name: string;
    code: string;
    status: string;
    budget: number;
    spent: number;
    hours: number;
    userCount: number;
    progress: number;
    startDate: string;
    endDate: string;
    customer: string;
  }>;
  budgetTrend: Array<{
    date: string;
    budget: number;
    spent: number;
    variance: number;
  }>;
  projectProgress: Array<{
    projectId: string;
    projectName: string;
    progress: number;
    budgetUtilization: number;
    timeUtilization: number;
  }>;
  departmentPerformance: Array<{
    department: string;
    projects: number;
    totalBudget: number;
    totalSpent: number;
    totalHours: number;
    efficiency: number;
  }>;
  projects: Array<{
    id: string;
    name: string;
    code: string;
    status: string;
    budget: number;
    spent: number;
    hours: number;
    userCount: number;
    progress: number;
    startDate: string;
    endDate: string;
    customer: string;
    description: string;
  }>;
  trends?: {
    projects?: { value: number; isPositive: boolean };
    budget?: { value: number; isPositive: boolean };
    hours?: { value: number; isPositive: boolean };
    completion?: { value: number; isPositive: boolean };
  };
  monthOverMonthGrowth?: number;
  efficiencyRate?: number;
  budgetEfficiency?: number;
}

const ProjectReport: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<ProjectReportData | null>(null);
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
    workType: 'all',
    subWorkType: 'all',
    activity: 'all',
    user: 'all'
  });

  // Fetch options for filters
  const [filterOptions, setFilterOptions] = useState({
    status: [],
    workTypes: [],
    activities: [],
    users: []
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadProjectReport();
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const usersRes = await userAPI.getUsers();

      setFilterOptions({
        status: [
          { value: 'ACTIVE', label: 'กำลังดำเนินการ' },
          { value: 'COMPLETED', label: 'เสร็จสิ้น' },
          { value: 'ON_HOLD', label: 'ระงับชั่วคราว' },
          { value: 'CANCELLED', label: 'ยกเลิก' }
        ],
        workTypes: [
          { value: 'DEVELOPMENT', label: 'การพัฒนา' },
          { value: 'CONSULTING', label: 'ให้คำปรึกษา' },
          { value: 'MAINTENANCE', label: 'บำรุงรักษา' },
          { value: 'TRAINING', label: 'การฝึกอบรม' },
          { value: 'RESEARCH', label: 'วิจัย' }
        ],
        activities: [
          { value: 'PLANNING', label: 'วางแผน' },
          { value: 'DEVELOPMENT', label: 'พัฒนา' },
          { value: 'TESTING', label: 'ทดสอบ' },
          { value: 'DEPLOYMENT', label: 'ติดตั้ง' },
          { value: 'DOCUMENTATION', label: 'เอกสาร' }
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

  const loadProjectReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.dateRange.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : undefined,
        endDate: filters.dateRange.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        workType: filters.workType !== 'all' ? filters.workType : undefined,
        userId: filters.user !== 'all' ? filters.user : undefined
      };

      const response = await reportAPI.getProjectReport(params);
      setReportData(response.data);
    } catch (error) {
      console.error('Error loading project report:', error);
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
        workType: filters.workType !== 'all' ? filters.workType : undefined,
        userId: filters.user !== 'all' ? filters.user : undefined
      };

      switch (format) {
        case 'csv':
          await reportAPI.exportProjectCSV(params);
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
          const summary = `รายงานโครงการ\nช่วงวันที่: ${filters.dateRange.start ? format(filters.dateRange.start, 'dd/MM/yyyy') : ''} - ${filters.dateRange.end ? format(filters.dateRange.end, 'dd/MM/yyyy') : ''}\nโครงการทั้งหมด: ${reportData?.totalProjects || 0}\nงบประมาณรวม: ${formatCurrency(reportData?.totalBudget || 0)}`;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
      case 'ACTIVE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Activity className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'ON_HOLD': return <Clock className="h-4 w-4" />;
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />;
      default: return <FolderOpen className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'กำลังดำเนินการ';
      case 'COMPLETED': return 'เสร็จสิ้น';
      case 'ON_HOLD': return 'ระงับชั่วคราว';
      case 'CANCELLED': return 'ยกเลิก';
      default: return status;
    }
  };

  const getTrendIcon = (trend?: { value: number; isPositive: boolean }) => {
    if (!trend) return <Minus className="h-4 w-4" />;
    return trend.isPositive ? 
      <ArrowUpRight className="h-4 w-4" /> : 
      <ArrowDownRight className="h-4 w-4" />;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600 dark:text-green-400';
    if (progress >= 60) return 'text-blue-600 dark:text-blue-400';
    if (progress >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const tableColumns = [
    {
      key: 'name',
      label: 'โครงการ',
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">{row.code}</div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'ลูกค้า',
      sortable: true,
      render: (value: string) => value || '-'
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
    },
    {
      key: 'budget',
      label: 'งบประมาณ',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'spent',
      label: 'ใช้จ่ายแล้ว',
      sortable: true,
      align: 'right' as const,
      render: (value: number, row: any) => (
        <div className="text-right">
          <div>{formatCurrency(value)}</div>
          <div className="text-xs text-gray-500">
            {formatPercentage(value, row.budget)}
          </div>
        </div>
      )
    },
    {
      key: 'hours',
      label: 'ชั่วโมง',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => formatHours(value)
    },
    {
      key: 'progress',
      label: 'ความคืบหน้า',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <div className="text-right">
          <div className={`font-medium ${getProgressColor(value)}`}>
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
    },
    {
      key: 'userCount',
      label: 'ทีม',
      sortable: true,
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-center">
          <Users className="h-4 w-4 mx-auto mb-1" />
          <span className="text-sm">{value}</span>
        </div>
      )
    }
  ];

  if (!reportData && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">รายงานโครงการ</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">ติดตามและวิเคราะห์ประสิทธิภาพโครงการ</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">รายงานโครงการ</h1>
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
            fileName={`project-report-${format(new Date(), 'yyyy-MM-dd')}`}
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
          showWorkType={true}
          showActivity={true}
          showUser={true}
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
              title="โครงการทั้งหมด"
              value={formatNumber(reportData.totalProjects)}
              subtitle={`${reportData.activeProjects} กำลังดำเนินการ`}
              icon={<FolderOpen className="h-5 w-5" />}
              trend={reportData.trends?.projects}
              status="info"
              size="lg"
            />
            <ReportCard
              title="งบประมาณรวม"
              value={formatCurrency(reportData.totalBudget)}
              subtitle={`ใช้จ่ายแล้ว ${formatCurrency(reportData.totalSpent)}`}
              icon={<DollarSign className="h-5 w-5" />}
              trend={reportData.trends?.budget}
              status="success"
              size="lg"
            />
            <ReportCard
              title="ชั่วโมงรวม"
              value={formatHours(reportData.totalHours)}
              subtitle={`เฉลี่ย ${formatHours(reportData.averageHoursPerProject)}/โครงการ`}
              icon={<Clock className="h-5 w-5" />}
              trend={reportData.trends?.hours}
              status="warning"
              size="lg"
            />
            <ReportCard
              title="อัตราการเสร็จสิ้น"
              value={formatPercentage(reportData.completedProjects, reportData.totalProjects)}
              subtitle={`${reportData.completedProjects} โครงการเสร็จสิ้น`}
              icon={<Award className="h-5 w-5" />}
              trend={reportData.trends?.completion}
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
                <FolderOpen className="h-4 w-4" />
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
                    สรุปสถานะโครงการ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportData.statusSummary?.map((status) => (
                      <div key={status.status} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(status.status)}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{getStatusText(status.status)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{status.count} โครงการ</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className={getStatusColor(status.status)}>
                            {formatPercentage(status.count, reportData.totalProjects)}
                          </Badge>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatCurrency(status.budget)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Projects */}
              {reportData.topProjects && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      โครงการที่มีประสิทธิภาพสูงสุด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.topProjects.slice(0, 5).map((project, index) => (
                        <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{project.customer}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(project.budget)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatHours(project.hours)}</p>
                              </div>
                              <div className="text-center">
                                <div className={`font-medium ${getProgressColor(project.progress)}`}>
                                  {project.progress.toFixed(1)}%
                                </div>
                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Department Performance */}
              {reportData.departmentPerformance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      ประสิทธิภาพตามแผนก
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.departmentPerformance.map((dept, index) => (
                        <div key={dept.department} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{dept.department}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{dept.projects} โครงการ</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(dept.totalBudget)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatHours(dept.totalHours)}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">ประสิทธิภาพ {dept.efficiency.toFixed(1)}%</p>
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
                            dataKey="budget"
                          >
                            {reportData.statusSummary?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any, name: any) => [
                              formatCurrency(value), 
                              getStatusText(name)
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Budget Trend Chart */}
                  {reportData.budgetTrend && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LineChart className="h-5 w-5" />
                          แนวโน้มงบประมาณ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <ComposedChart data={reportData.budgetTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => format(parseISO(value), 'dd/MM')}
                            />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(value) => format(parseISO(value), 'dd/MM/yyyy')}
                              formatter={(value: any, name: any) => [
                                formatCurrency(value),
                                name === 'budget' ? 'งบประมาณ' : name === 'spent' ? 'ใช้จ่ายแล้ว' : 'ส่วนต่าง'
                              ]}
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="budget" 
                              stroke="#3B82F6" 
                              fill="#3B82F6" 
                              fillOpacity={0.3}
                              name="งบประมาณ"
                            />
                            <Bar 
                              dataKey="spent" 
                              fill="#10B981" 
                              opacity={0.7}
                              name="ใช้จ่ายแล้ว"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Project Progress Radar Chart */}
                  {reportData.projectProgress && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart className="h-5 w-5" />
                          ความคืบหน้าโครงการ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={reportData.projectProgress.slice(0, 5)}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="projectName" />
                            <PolarRadiusAxis />
                            <Radar 
                              name="ความคืบหน้า" 
                              dataKey="progress" 
                              stroke="#3B82F6" 
                              fill="#3B82F6" 
                              fillOpacity={0.3} 
                            />
                            <Tooltip 
                              formatter={(value: any) => [`${value.toFixed(1)}%`, 'ความคืบหน้า']}
                            />
                          </RadarChart>
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
                    <FolderOpen className="h-5 w-5" />
                    รายละเอียดโครงการ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedTable
                    columns={tableColumns}
                    data={reportData.projects || []}
                    loading={loading}
                    pagination={true}
                    pageSize={15}
                    variant="bordered"
                    striped={true}
                    hoverable={true}
                    emptyMessage="ไม่พบข้อมูลโครงการ"
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
                          <span className="text-gray-600 dark:text-gray-400">งบประมาณเฉลี่ยต่อโครงการ:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(reportData.averageBudgetPerProject)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">ชั่วโมงเฉลี่ยต่อโครงการ:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatHours(reportData.averageHoursPerProject)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">อัตราการเสร็จสิ้น:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatPercentage(reportData.completedProjects, reportData.totalProjects)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">ประสิทธิภาพงบประมาณ:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatPercentage(reportData.budgetEfficiency || 0, 100)}
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
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {formatPercentage(reportData.efficiencyRate || 0, 100)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-600 dark:text-gray-400">อัตราการใช้งานงบประมาณ:</span>
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            {formatPercentage(reportData.totalSpent, reportData.totalBudget)}
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

export default ProjectReport; 