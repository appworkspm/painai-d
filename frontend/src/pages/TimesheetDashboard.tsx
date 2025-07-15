import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Button, DatePicker, Select, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { timesheetAPI } from '../services/api';
import { Clock, CheckCircle, XCircle, Hourglass, Users, User } from 'lucide-react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface TimesheetStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  totalHours: number;
}

const TimesheetDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TimesheetStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalHours: 0
  });
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Check user role for permissions
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isUser = user?.role === 'USER';
  const canViewAll = isAdmin || isManager;

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters based on user role
      const params: any = {};
      if (dateRange) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // Different API calls based on role
      let response;
      if (canViewAll) {
        // Admin/Manager can see all timesheets
        response = await timesheetAPI.getTimesheets(params);
      } else {
        // Regular user can only see their own timesheets
        response = await timesheetAPI.getMyTimesheets(params);
      }
      
      if (response.success && response.data) {
        const data = response.data;
        const timesheetsList = data.timesheets || data.data || [];
        
        // Calculate stats from actual timesheet data
        const calculatedStats = timesheetsList.reduce((acc: TimesheetStats, timesheet: any) => {
          acc.total++;
          acc[timesheet.status]++;
          acc.totalHours += (timesheet.hours_worked || 0) + (timesheet.overtime_hours || 0);
          return acc;
        }, { total: 0, approved: 0, pending: 0, rejected: 0, totalHours: 0 });
        
        setStats(calculatedStats);
        setTimesheets(timesheetsList);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'submitted': return 'processing';
      case 'rejected': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'อนุมัติแล้ว';
      case 'submitted': return 'ส่งแล้ว';
      case 'rejected': return 'ไม่อนุมัติ';
      case 'draft': return 'ร่าง';
      default: return status;
    }
  };

  // Dynamic columns based on user role
  const getColumns = () => {
    const baseColumns = [
      {
        title: 'วันที่',
        dataIndex: 'date',
        key: 'date',
        render: (date: string) => dayjs(date).format('DD/MM/YYYY')
      },
      {
        title: 'โครงการ',
        dataIndex: 'project',
        key: 'project',
        render: (project: any) => project?.name || 'ไม่ผูกกับโครงการ'
      },
      {
        title: 'กิจกรรม',
        dataIndex: 'activity',
        key: 'activity'
      },
      {
        title: 'ชั่วโมง',
        dataIndex: 'hours_worked',
        key: 'hours_worked',
        render: (hours: number, record: any) => {
          const totalHours = (hours || 0) + (record.overtime_hours || 0);
          return `${totalHours}h`;
        }
      },
      {
        title: 'สถานะ',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
        )
      }
    ];

    // Add user column for Admin/Manager
    if (canViewAll) {
      baseColumns.splice(1, 0, {
        title: 'ผู้ใช้',
        dataIndex: 'user',
        key: 'user',
        render: (user: any) => user?.name || user?.first_name || 'ไม่ระบุ'
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {canViewAll ? (
            <Users className="h-8 w-8 text-primary-600" />
          ) : (
            <User className="h-8 w-8 text-primary-600" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getDashboardTitle()}</h1>
            <p className="text-sm text-gray-600">{getDashboardDescription()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={16}>
          <Col span={12}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['วันที่เริ่มต้น', 'วันที่สิ้นสุด']}
              onChange={(dates) => setDateRange(dates)}
            />
          </Col>
          <Col span={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="กรองตามสถานะ"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'ทั้งหมด', value: 'all' },
                { label: 'ร่าง', value: 'draft' },
                { label: 'ส่งแล้ว', value: 'submitted' },
                { label: 'อนุมัติแล้ว', value: 'approved' },
                { label: 'ไม่อนุมัติ', value: 'rejected' }
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="รวมทั้งหมด"
              value={stats.total}
              prefix={<Clock className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="อนุมัติแล้ว"
              value={stats.approved}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircle className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="รอการอนุมัติ"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<Hourglass className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="ไม่อนุมัติ"
              value={stats.rejected}
              valueStyle={{ color: '#cf1322' }}
              prefix={<XCircle className="h-4 w-4" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Total Hours */}
      <Card>
        <Statistic
          title="ชั่วโมงทำงานรวม"
          value={stats.totalHours}
          suffix="ชั่วโมง"
          precision={1}
        />
      </Card>

      {/* Timesheet Table */}
      <Card title={`รายการ Timesheet ${canViewAll ? 'ทั้งหมด' : 'ของฉัน'}`}>
        <Table
          columns={getColumns()}
          dataSource={timesheets}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`
          }}
        />
      </Card>
    </div>
  );
};

export default TimesheetDashboard; 