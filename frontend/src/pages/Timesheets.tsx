import React, { useState, useEffect } from 'react';
import { Button, Table, Tag, Space, Modal, Form, Input, Select, DatePicker, message, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import dayjs from 'dayjs';
import { Clock } from 'lucide-react';
import TimesheetForm from '../components/TimesheetForm';

const { TextArea } = Input;


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
    first_name: string;
    last_name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    code: string;
  };
  approver?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface Project {
  id: string;
  name: string;
  code: string;
}

const Timesheets: React.FC = () => {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    totalHours: 0
  });

  // Work type options
  const workTypeOptions = [
    { label: 'งานโครงการ', value: 'PROJECT' },
    { label: 'งานไม่เกี่ยวกับโครงการ', value: 'NON_PROJECT' }
  ];

  const subWorkTypeOptions = {
    PROJECT: [
      { label: 'ซอฟต์แวร์', value: 'SOFTWARE' },
      { label: 'ฮาร์ดแวร์', value: 'HARDWARE' },
      { label: 'การประชุม', value: 'MEETING' },
      { label: 'การทดสอบ', value: 'TESTING' },
      { label: 'เอกสาร', value: 'DOCUMENTATION' }
    ],
    NON_PROJECT: [
      { label: 'การประชุม', value: 'MEETING' },
      { label: 'การฝึกอบรม', value: 'TRAINING' },
      { label: 'การบริหาร', value: 'ADMINISTRATION' },
      { label: 'อื่นๆ', value: 'OTHER' }
    ]
  };

  const activityOptions = {
    SOFTWARE: [
      { label: 'การพัฒนา', value: 'DEVELOPMENT' },
      { label: 'การออกแบบ', value: 'DESIGN' },
      { label: 'การแก้ไขบั๊ก', value: 'BUG_FIX' },
      { label: 'การทดสอบ', value: 'TESTING' }
    ],
    HARDWARE: [
      { label: 'การติดตั้ง', value: 'INSTALLATION' },
      { label: 'การบำรุงรักษา', value: 'MAINTENANCE' },
      { label: 'การแก้ไข', value: 'REPAIR' }
    ],
    MEETING: [
      { label: 'การประชุมทีม', value: 'TEAM_MEETING' },
      { label: 'การประชุมลูกค้า', value: 'CLIENT_MEETING' },
      { label: 'การประชุมโครงการ', value: 'PROJECT_MEETING' }
    ]
  };

  useEffect(() => {
    fetchTimesheets();
    fetchProjects();
  }, []);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/timesheets/my');
      if (response.data.success) {
        setTimesheets(response.data.data || []);
        
        // Calculate stats
        const stats = response.data.data.reduce((acc: any, timesheet: Timesheet) => {
          acc.total++;
          acc[timesheet.status]++;
          acc.totalHours += timesheet.hours_worked + (timesheet.overtime_hours || 0);
          return acc;
        }, { total: 0, draft: 0, submitted: 0, approved: 0, rejected: 0, totalHours: 0 });
        
        setStats(stats);
      } else {
        message.error(response.data.message || 'ไม่สามารถโหลดข้อมูล timesheet ได้');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูล timesheet ได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      if (response.data.success) {
        setProjects(response.data.data || []);
      } else {
        message.error(response.data.message || 'ไม่สามารถโหลดข้อมูลโครงการได้');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลโครงการได้');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      const data = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        hours_worked: parseFloat(values.hours_worked),
        overtime_hours: parseFloat(values.overtime_hours || 0),
        billable: values.billable ?? true
      };

      if (editingTimesheet) {
        const response = await api.put(`/timesheets/${editingTimesheet.id}`, data);
        if (response.data.success) {
          message.success('อัปเดต timesheet สำเร็จ');
        } else {
          message.error(response.data.message || 'เกิดข้อผิดพลาดในการอัปเดต');
          return;
        }
      } else {
        const response = await api.post('/timesheets', data);
        if (response.data.success) {
          message.success('สร้าง timesheet สำเร็จ');
        } else {
          message.error(response.data.message || 'เกิดข้อผิดพลาดในการสร้าง');
          return;
        }
      }

      setModalVisible(false);
      setEditingTimesheet(null);
      form.resetFields();
      fetchTimesheets();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (timesheet: Timesheet) => {
    setEditingTimesheet(timesheet);
    form.setFieldsValue({
      ...timesheet,
      date: dayjs(timesheet.date),
      project_id: timesheet.project_id,
      work_type: timesheet.work_type,
      sub_work_type: timesheet.sub_work_type,
      activity: timesheet.activity,
      hours_worked: timesheet.hours_worked,
      overtime_hours: timesheet.overtime_hours,
      description: timesheet.description,
      billable: timesheet.billable
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      const response = await api.delete(`/timesheets/${id}`);
      if (response.data.success) {
        message.success('ลบ timesheet สำเร็จ');
        fetchTimesheets();
      } else {
        message.error(response.data.message || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmitTimesheet = async (id: string) => {
    try {
      setSubmitting(true);
      const response = await api.patch(`/timesheets/${id}/submit`);
      if (response.data.success) {
        message.success('ส่ง timesheet สำเร็จ');
        fetchTimesheets();
      } else {
        message.error(response.data.message || 'เกิดข้อผิดพลาดในการส่ง');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'submitted': return 'processing';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'ร่าง';
      case 'submitted': return 'ส่งแล้ว';
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ไม่อนุมัติ';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'วันที่',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'ประเภทงาน',
      dataIndex: 'work_type',
      key: 'work_type',
      render: (workType: string) => workTypeOptions.find(opt => opt.value === workType)?.label || workType
    },
    {
      title: 'โครงการ',
      dataIndex: 'project',
      key: 'project',
      render: (project: any) => project ? `${project.name} (${project.code})` : '-'
    },
    {
      title: 'กิจกรรม',
      dataIndex: 'activity',
      key: 'activity'
    },
    {
      title: 'ชั่วโมงทำงาน',
      dataIndex: 'hours_worked',
      key: 'hours_worked',
      render: (hours: number, record: Timesheet) => `${hours}h${record.overtime_hours ? ` + ${record.overtime_hours}h OT` : ''}`
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
      title: 'การดำเนินการ',
      key: 'actions',
      render: (record: Timesheet) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            disabled={record.status === 'approved' || record.status === 'rejected'}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            loading={deleting === record.id}
            disabled={record.status === 'approved' || record.status === 'rejected'}
          />
          {record.status === 'draft' && (
            <Button 
              type="text" 
              icon={<SendOutlined />} 
              onClick={() => handleSubmitTimesheet(record.id)}
              loading={submitting}
            />
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Timesheets</h1>
        </div>
        {/* Removed Create Timesheet button */}
      </div>

      <div className="mb-6">
        
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
              <Statistic title="ไม่อนุมัติ" value={stats.rejected} />
            </div>
          </Col>
          <Col span={4}>
            <div className="bg-white p-4 rounded-lg shadow">
              <Statistic title="ชั่วโมงรวม" value={stats.totalHours} suffix="h" />
            </div>
          </Col>
        </Row>

        
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={timesheets}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} จาก ${total} รายการ`
          }}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTimesheet ? 'แก้ไข Timesheet' : 'สร้าง Timesheet ใหม่'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTimesheet(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
        confirmLoading={submitting}
      >
        <TimesheetForm
          mode={editingTimesheet ? 'edit' : 'create'}
          initialValues={editingTimesheet ? {
            ...editingTimesheet,
            date: editingTimesheet.date ? dayjs(editingTimesheet.date) : undefined,
            project_id: editingTimesheet.project_id,
            work_type: editingTimesheet.work_type,
            sub_work_type: editingTimesheet.sub_work_type,
            activity: editingTimesheet.activity,
            hours_worked: editingTimesheet.hours_worked,
            overtime_hours: editingTimesheet.overtime_hours,
            description: editingTimesheet.description,
            billable: editingTimesheet.billable
          } : undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalVisible(false);
            setEditingTimesheet(null);
            form.resetFields();
          }}
          loading={submitting}
          projects={projects}
        />
      </Modal>
    </div>
  );
};

export default Timesheets; 