import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Select, Input, Row, Col, Statistic } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { timesheetAPI } from '../services/api';
import dayjs from 'dayjs';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Timesheet {
  id: string;
  user_id: string;
  project_id?: string;
  work_type: string;
  sub_work_type: string;
  activity: string;
  date: string;
  hours_worked: number;
  overtime_hours: number;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  billable: boolean;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  approver?: {
    id: string;
    name: string;
  };
}

const TimesheetHistory: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    totalHours: 0
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchTimesheets();
  }, [selectedMonth, selectedYear, pagination.current, pagination.pageSize]);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        month: selectedMonth,
        year: selectedYear,
        status: filter !== 'all' ? filter : undefined
      };

      const response = await timesheetAPI.getUserTimesheetHistory(params);
      if (response.success) {
        setTimesheets(response.data.data || []);
        setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
        
        // Calculate stats
        const stats = response.data.data.reduce((acc: any, timesheet: Timesheet) => {
          const status = (timesheet.status || '').toLowerCase();
          acc.total++;
          acc[status]++;
          acc.totalHours += timesheet.hours_worked + (timesheet.overtime_hours || 0);
          return acc;
        }, { total: 0, draft: 0, submitted: 0, approved: 0, rejected: 0, totalHours: 0 });
        
        setStats(stats);
      } else {
        showNotification({
          message: response.message || 'ไม่สามารถโหลดข้อมูล timesheet ได้',
          type: 'error'
        });
      }
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'ไม่สามารถโหลดข้อมูล timesheet ได้',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'draft':
        return 'default';
      case 'submitted':
        return 'processing';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'draft':
        return 'ร่าง';
      case 'submitted':
        return 'ส่งแล้ว';
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'rejected':
        return 'ปฏิเสธ';
      default:
        return status;
    }
  };

  const filteredTimesheets = timesheets.filter(timesheet => {
    const matchesSearch = 
      timesheet.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timesheet.activity?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const columns = [
    {
      title: 'วันที่',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'โครงการ',
      key: 'project',
      render: (record: Timesheet) => record.project?.name || '-'
    },
    {
      title: 'กิจกรรม',
      dataIndex: 'activity',
      key: 'activity'
    },
    {
      title: 'ชั่วโมงทำงาน',
      key: 'hours',
      render: (record: Timesheet) => `${record.hours_worked}h${record.overtime_hours ? ` + ${record.overtime_hours}h OT` : ''}`
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
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <div className="max-w-xs truncate" title={description}>
          {description}
        </div>
      )
    }
  ];

  const monthOptions = [
    { value: 1, label: 'มกราคม' },
    { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' },
    { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' },
    { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' },
    { value: 12, label: 'ธันวาคม' }
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year, label: year.toString() };
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ประวัติ Timesheet</h1>
        <p className="text-gray-600">ประวัติการบันทึก timesheet ของคุณ</p>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={4}>
          <div className="bg-white p-4 rounded-lg shadow">
            <Statistic title="ทั้งหมด" value={stats.total} />
          </div>
        </Col>
        <Col span={4}>
          <div className="bg-white p-4 rounded-lg shadow">
            <Statistic title="ร่าง" value={stats.draft} />
          </div>
        </Col>
        <Col span={4}>
          <div className="bg-white p-4 rounded-lg shadow">
            <Statistic title="ส่งแล้ว" value={stats.submitted} />
          </div>
        </Col>
        <Col span={4}>
          <div className="bg-white p-4 rounded-lg shadow">
            <Statistic title="อนุมัติแล้ว" value={stats.approved} />
          </div>
        </Col>
        <Col span={4}>
          <div className="bg-white p-4 rounded-lg shadow">
            <Statistic title="ปฏิเสธ" value={stats.rejected} />
          </div>
        </Col>
        <Col span={4}>
          <div className="bg-white p-4 rounded-lg shadow">
            <Statistic title="ชั่วโมงรวม" value={stats.totalHours} suffix="h" />
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FilterOutlined className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">กรอง:</span>
          </div>
          
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: 120 }}
            placeholder="เดือน"
          >
            {monthOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>

          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 100 }}
            placeholder="ปี"
          >
            {yearOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>

          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: 120 }}
            placeholder="สถานะ"
          >
            <Select.Option value="all">ทั้งหมด</Select.Option>
            <Select.Option value="draft">ร่าง</Select.Option>
            <Select.Option value="submitted">ส่งแล้ว</Select.Option>
            <Select.Option value="approved">อนุมัติแล้ว</Select.Option>
            <Select.Option value="rejected">ปฏิเสธ</Select.Option>
          </Select>

          <Input
            placeholder="ค้นหาโครงการหรือกิจกรรม..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={filteredTimesheets}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`
          }}
        />
      </div>
    </div>
  );
};

export default TimesheetHistory; 