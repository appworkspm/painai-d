import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col,
  Table, 
  Button, 
  Select, 
  DatePicker, 
  Tabs, 
  Badge, 
  Tooltip, 
  Dropdown, 
  Menu, 
  message, 
  Empty,
  Space
} from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  DownloadOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleFilled, 
  HourglassOutlined, 
  QuestionCircleOutlined,
  LineChartOutlined,
  TableOutlined,
  CheckCircleFilled,
  ClockCircleFilled
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import { useAuth } from '../contexts/AuthContext';
import { timesheetAPI, reportAPI } from '../services/api';
import type { User, Timesheet } from '../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// Types for timesheet data
interface Project {
  id: string;
  name: string;
  description?: string;
  status?: string;
  managerId?: string;
}

type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending';

// API Response types
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Use the Timesheet type from the types file

interface DashboardUser extends User {
  // Extending User type from auth context
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

interface DashboardTimesheet extends Omit<Timesheet, 'project'> {
  projectId: string;
  status: TimesheetStatus;
  hours_worked: number;
  overtime_hours: number;
  date: string;
  user?: DashboardUser;
  project?: {
    id: string;
    name: string;
    code?: string;
    status?: string;
    managerId?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// S-Curve data point interface
interface SCurveDataPoint {
  date: string;
  plannedValue: number;
  actualValue: number;
  plannedCumulative: number;
  actualCumulative: number;
}

// Project progress interface
interface ProjectProgress {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  progress: number;
  sCurveData: SCurveDataPoint[];
}

interface TimesheetStats {
  total: number;
  draft: number;
  submitted: number;
  pending: number;
  approved: number;
  rejected: number;
  totalHours: number;
  overtimeHours: number;
  [key: string]: number; // Index signature to allow dynamic property access
}

interface TimesheetColumn {
  title: string;
  dataIndex: string;
  key: string;
  render?: (text: any, record: DashboardTimesheet) => React.ReactNode;
}

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

const TimesheetDashboard: React.FC = () => {
  const { user } = useAuth() as { user: DashboardUser | null };
  const [stats, setStats] = useState<TimesheetStats>({
    total: 0,
    draft: 0,
    submitted: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalHours: 0,
    overtimeHours: 0,
  });
  const [timesheets, setTimesheets] = useState<DashboardTimesheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('timesheets');
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  // User role flags
  const canViewAll = isAdmin || isManager;

  // Format user display name (using only properties that exist on User type)
  const formatUserName = (user: User) => {
    return user.name || user.email;
  };

  // Handle user name display safely
  const getUserDisplayName = (user?: User) => {
    if (!user) return 'N/A';
    return user.name || user.email;
  };

  useEffect(() => {
    // Set default dateRange to first and last day of current month
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');
    setDateRange([startOfMonth, endOfMonth]);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters based on user role
      const params: {
        start_date?: string;
        end_date?: string;
        status?: TimesheetStatus;
        user_id?: string;
      } = {};
      if (dateRange) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // Different API calls based on role
      let response: ApiResponse<PaginatedResponse<Timesheet>>;
      if (canViewAll) {
        // Admin/Manager can see all timesheets
        response = await timesheetAPI.getTimesheets(params);
      } else {
        // Regular user can only see their own timesheets
        response = await timesheetAPI.getMyTimesheets(params);
      }
      
      if (response.success && response.data) {
        // Map API response to DashboardTimesheet type
        const timesheetsList: DashboardTimesheet[] = (response.data?.data || []).map((timesheet: any) => {
          // Determine status with type safety
          const status = (['draft', 'submitted', 'approved', 'rejected'].includes(timesheet.status as string)
            ? timesheet.status
            : 'draft') as DashboardTimesheet['status'];
            
          return {
            ...timesheet,
            status,
            date: timesheet.startTime ? dayjs(timesheet.startTime).format('YYYY-MM-DD') : '',
            activity: timesheet.activityType || 'Other',
            hours_worked: timesheet.duration ? Number((timesheet.duration / 60).toFixed(2)) : 0,
            overtime_hours: 0 // Default value, adjust based on your business logic
          };
        });
        
        setTimesheets(timesheetsList);
        
        // Update stats
        setStats(calculateStats(timesheetsList));
      } else {
        message.error(response.message || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Generate S-Curve data for a project
  const generateSCurveData = (startDate: string, endDate: string): SCurveDataPoint[] => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const days = end.diff(start, 'days') + 1;
    
    return Array.from({ length: days }, (_, i) => {
      const date = start.add(i, 'day');
      const progress = i / (days - 1);
      
      // Simple S-curve calculation (sigmoid-like function)
      const sCurve = 1 / (1 + Math.exp(-10 * (progress - 0.5)));
      
      // Add some randomness to actual progress
      const actualProgress = Math.min(1, Math.max(0, sCurve + (Math.random() * 0.1 - 0.05)));
      
      return {
        date: date.format('YYYY-MM-DD'),
        plannedValue: sCurve * 100,
        actualValue: actualProgress * 100,
        plannedCumulative: sCurve * 100,
        actualCumulative: actualProgress * 100,
      };
    });
  };

  // Calculate stats from timesheets
  const calculateStats = (timesheets: DashboardTimesheet[]): TimesheetStats => {
    // Initialize with all possible statuses to ensure they exist in the accumulator
    const initialStats: TimesheetStats = {
      total: 0,
      draft: 0,
      submitted: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalHours: 0,
      overtimeHours: 0
    };

    return timesheets.reduce<TimesheetStats>(
      (acc, timesheet) => {
        // Map 'submitted' to 'pending' for backward compatibility
        const status = timesheet.status === 'submitted' ? 'pending' : (timesheet.status || 'draft');
        
        return {
          ...acc,
          total: acc.total + 1,
          [status]: (acc[status] || 0) + 1,
          totalHours: acc.totalHours + (timesheet.hours_worked || 0),
          overtimeHours: acc.overtimeHours + (timesheet.overtime_hours || 0),
        };
      },
      { ...initialStats }
    );
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for export
      const params: {
        start?: string;
        end?: string;
        status?: TimesheetStatus;
      } = {};
      
      if (dateRange) {
        params.start = dateRange[0].format('YYYY-MM-DD');
        params.end = dateRange[1].format('YYYY-MM-DD');
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // Call the export API
      await reportAPI.exportTimesheetCSV(params);
      message.success('ส่งออกข้อมูลสำเร็จ');
    } catch (error) {
      console.error('Error exporting data:', error);
      message.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Status badge component with icons - used in the columns definition
  const getStatusBadge = (status: TimesheetStatus) => {
    const statusMap = {
      draft: { text: 'แบบร่าง', color: 'default' as const },
      submitted: { text: 'ส่งแล้ว', color: 'processing' as const },
      pending: { text: 'รออนุมัติ', color: 'warning' as const },
      approved: { text: 'อนุมัติแล้ว', color: 'success' as const },
      rejected: { text: 'ปฏิเสธ', color: 'error' as const },
    };
    
    const statusInfo = statusMap[status] || { text: status, color: 'default' as const };
    return <Badge status={statusInfo.color} text={statusInfo.text} />;
  };

  // Dynamic columns based on user role
  const getColumns = (): TimesheetColumn[] => {
    const baseColumns: TimesheetColumn[] = [
      {
        title: 'พนักงาน',
        dataIndex: ['user', 'name'],
        key: 'user',
        render: (_, record) => getUserDisplayName(record.user),
      },
      {
        title: 'วันที่',
        dataIndex: 'date',
        key: 'date',
        render: (date) => dayjs(date).format('DD/MM/YYYY'),
      },
      {
        title: 'โครงการ',
        dataIndex: 'project',
        key: 'project',
        render: (project: Project | null) => project?.name || 'ไม่ผูกกับโครงการ',
      },
      {
        title: 'กิจกรรม',
        dataIndex: 'activity',
        key: 'activity',
        render: (activity: string) => activity || 'ไม่ระบุ',
      },
      {
        title: 'ชั่วโมงทำงาน',
        dataIndex: 'hours_worked',
        key: 'hours_worked',
        render: (hours: number | string) => {
          const hoursNum = typeof hours === 'string' ? parseFloat(hours) : hours || 0;
          return `${hoursNum.toFixed(2)} ชม.`;
        },
      },
      {
        title: 'ล่วงเวลา',
        dataIndex: 'overtime_hours',
        key: 'overtime_hours',
        render: (hours: number | string) => {
          const hoursNum = typeof hours === 'string' ? parseFloat(hours) : hours || 0;
          return hoursNum > 0 ? `${hoursNum.toFixed(2)} ชม.` : '-';
        },
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        render: (status: TimesheetStatus) => getStatusBadge(status),
      },
    ];
    // Return columns based on user role
    if (isAdmin || isManager) {
      return [
        ...baseColumns,
        {
          title: 'การดำเนินการ',
          key: 'action',
          render: (_, record) => (
            <Space size="middle">
              <Button type="link" onClick={() => handleViewDetails(record)}>
                ดูรายละเอียด
              </Button>
              {record.status === 'submitted' && (
                <>
                  <Button 
                    type="link" 
                    onClick={() => handleApprove(record.id)}
                    className="text-green-600"
                  >
                    อนุมัติ
                  </Button>
                  <Button 
                    type="link" 
                    danger
                    onClick={() => handleReject(record.id)}
                  >
                    ปฏิเสธ
                  </Button>
                </>
              )}
            </Space>
          ),
        },
      ];
    }

    return baseColumns;
        }
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        render: (status: TimesheetStatus) => {
          const statusInfo = getStatusInfo(status);
          return (
            <Tag 
              color={statusInfo.color}
              icon={statusInfo.icon}
              className="flex items-center gap-1"
            >
              {statusInfo.text}
            </Tag>
          );
        },
      },
    ];

    // Add user column for Admin/Manager
    if (canViewAll) {
      baseColumns.splice(1, 0, {
        title: 'ผู้ใช้',
        dataIndex: 'user',
        key: 'user',
        render: (user: User) => user.name || user.first_name || user.last_name || 'ไม่ระบุ'
      });
    }

    return baseColumns;
  };

  const getDashboardTitle = () => {
    if (isAdmin) return 'Timesheet Dashboard (ทั้งหมด)';
    if (isManager) return 'Timesheet Dashboard (ทีม)';
    return 'Timesheet Dashboard (ของฉัน)';
  };

  const getDashboardDescription = () => {
    if (isAdmin) return 'ดู timesheet ทั้งหมดในระบบ';
    if (isManager) return 'ดู timesheet ของทีมในโครงการที่จัดการ';
    return 'ดู timesheet ของตนเอง';
  };

  // S-Curve chart configuration
  const sCurveConfig = {
    data: projectProgress.length > 0 ? projectProgress[0].sCurveData : [],
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    xAxis: {
      type: 'time',
      label: {
        formatter: (v: string) => dayjs(v).format('DD/MM'),
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${v}%`,
      },
    },
    legend: {
      position: 'top',
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  // Process timesheet data for S-Curve
  useEffect(() => {
    if (timesheets.length > 0) {
      // Group timesheets by project
      const projects = timesheets.reduce((acc, timesheet) => {
        if (timesheet.project) {
          const projectId = timesheet.project.id;
          if (!acc[projectId]) {
            acc[projectId] = {
              projectId,
              projectName: timesheet.project.name,
              startDate: timesheet.date,
              endDate: timesheet.date,
              progress: 0,
              sCurveData: []
            };
          }
          // Update project date range
          if (new Date(timesheet.date) < new Date(acc[projectId].startDate)) {
            acc[projectId].startDate = timesheet.date;
          }
          if (new Date(timesheet.date) > new Date(acc[projectId].endDate)) {
            acc[projectId].endDate = timesheet.date;
          }
        }
        return acc;
      }, {} as Record<string, ProjectProgress>);

      // Generate S-Curve data for each project
      const projectList = Object.values(projects);
      projectList.forEach(project => {
        project.sCurveData = generateSCurveData(
          project.startDate,
          project.endDate
        );
      });

      setProjectProgress(projectList);
    }
  }, [timesheets]);

  // Tab items for the dashboard
  const tabItems: { key: string; label: React.ReactNode; children: React.ReactNode }[] = [
    {
      key: 'timesheets',
      label: (
        <span>
          <TableOutlined />
          <span className="ml-2">รายการ Timesheet</span>
        </span>
      ),
      children: (
        <Table
          columns={getColumns()}
          dataSource={timesheets}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          scroll={{ x: true }}
        />
      ),
    },
    {
      key: 's-curve',
      label: (
        <span>
          <LineChartOutlined />
          <span className="ml-2">กราฟ S-Curve</span>
        </span>
      ),
      children: (
        <div className="space-y-6">
          {projectProgress.map((project) => (
            <Card key={project.projectId} title={project.projectName}>
              <Line
                data={project.sCurveData.flatMap(point => [
                  { date: point.date, type: 'แผน', value: point.plannedValue },
                  { date: point.date, type: 'จริง', value: point.actualValue },
                ])}
                xField="date"
                yField="value"
                seriesField="type"
                xAxis={{
                  title: {
                    text: 'วันที่',
                  },
                }}
                yAxis={{
                  title: {
                    text: 'ความก้าวหน้า (%)',
                  },
                  min: 0,
                  max: 100,
                }}
                legend={{
                  position: 'top',
                }}
                smooth
                animation
              />
            </Card>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {canViewAll ? (
            <TeamOutlined className="h-8 w-8 text-blue-600" />
          ) : (
            <UserOutlined className="h-8 w-8 text-blue-600" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{getDashboardTitle()}</h1>
            <p className="text-sm text-gray-600">{getDashboardDescription()}</p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined className="h-4 w-4" />}
          onClick={handleExport}
          loading={exporting}
        >
          ส่งออก Excel
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-medium">
              {activeTab === 'timesheets' ? 'รายการ Timesheet' : 'กราฟ S-Curve'}
            </h2>
            <p className="text-sm text-gray-500">
              {activeTab === 'timesheets' 
                ? `แสดงรายการทั้งหมด ${timesheets.length} รายการ`
                : 'แสดงความก้าวหน้าของโครงการ'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full sm:w-auto"
              format="DD/MM/YYYY"
              placeholder={['วันที่เริ่มต้น', 'วันที่สิ้นสุด']}
            />
            {activeTab === 'timesheets' && (
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full sm:w-40"
                placeholder="สถานะ"
              >
                <Select.Option value="all">ทั้งหมด</Select.Option>
                <Select.Option value="draft">แบบร่าง</Select.Option>
                <Select.Option value="submitted">ส่งแล้ว</Select.Option>
                <Select.Option value="approved">อนุมัติแล้ว</Select.Option>
                <Select.Option value="rejected">ปฏิเสธ</Select.Option>
              </Select>
            )}
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key: string) => setActiveTab(key)}
          items={tabItems}
          className="w-full"
        />
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">อนุมัติแล้ว</div>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              </div>
              <CheckCircleFilled className="h-6 w-6 text-green-500" />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">รอการอนุมัติ</div>
                <div className="text-2xl font-bold text-yellow-500">{stats.submitted}</div>
              </div>
              <HourglassOutlined className="h-6 w-6 text-yellow-500" />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">ไม่อนุมัติ</div>
                <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
              </div>
              <CloseCircleFilled className="h-6 w-6 text-red-500" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Total Hours */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-sm">ชั่วโมงทำงานรวม</div>
            <div className="text-2xl font-bold">
              {stats.totalHours.toFixed(1)} <span className="text-gray-500 text-base">ชั่วโมง</span>
            </div>
          </div>
          <ClockCircleFilled className="h-6 w-6 text-blue-500" />
        </div>
      </Card>
    </div>
  );
};

export default TimesheetDashboard;