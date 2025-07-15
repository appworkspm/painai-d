import React, { useState, useEffect } from 'react';
import { Button, Table, Tag, Space, Modal, Form, Input, Select, DatePicker, message, Row, Col, Statistic, Card, List, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import dayjs from 'dayjs';
import { Clock, CheckCircle, XCircle, Hourglass, FileText, User } from 'lucide-react';
import TimesheetForm from '../components/TimesheetForm';

const { TextArea } = Input;
const { Text } = Typography;


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
  
  // เพิ่ม state สำหรับสถิติการทำงาน
  const [workStats, setWorkStats] = useState({
    totalWorkingDays: 0,
    recordedDays: 0,
    leaveDays: 0,
    actualWorkDays: 0,
    missingDays: 0,
    missingDates: [] as string[]
  });

  // เพิ่ม state สำหรับ modal รายละเอียดวันที่
  const [dateDetailModalVisible, setDateDetailModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDateInfo, setSelectedDateInfo] = useState<any>(null);

  // Work type options - ใช้จาก TimesheetForm แทน
  const workTypeOptions = [
    { label: 'งานโครงการ', value: 'PROJECT' },
    { label: 'ไม่ใช่งานโครงการ', value: 'NON_PROJECT' },
    { label: 'ลางาน', value: 'LEAVE' }
  ];

  useEffect(() => {
    fetchTimesheets();
    fetchProjects();
  }, []);

  // เพิ่มฟังก์ชันคำนวณวันทำงานในเดือน
  const calculateWorkingDays = (year: number, month: number) => {
    const startDate = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`);
    const endDate = startDate.endOf('month');
    const workingDays = [];
    
    let currentDate = startDate;
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      // นับเฉพาะวันจันทร์-ศุกร์ (1-5)
      if (currentDate.day() >= 1 && currentDate.day() <= 5) {
        workingDays.push(currentDate.format('YYYY-MM-DD'));
      }
      currentDate = currentDate.add(1, 'day');
    }
    
    return workingDays;
  };

  // เพิ่มฟังก์ชันตรวจสอบวันหยุด
  const isHoliday = (date: string) => {
    const dateObj = dayjs(date);
    const dayOfWeek = dateObj.day();
    
    // วันเสาร์-อาทิตย์
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true;
    }
    
    // วันหยุดนักขัตฤกษ์ (ตัวอย่าง - สามารถเพิ่มวันหยุดอื่นๆ ได้)
    const holidays = [
      '01-01', // วันขึ้นปีใหม่
      '13-04', // วันสงกรานต์
      '14-04', // วันสงกรานต์
      '15-04', // วันสงกรานต์
      '16-04', // วันสงกรานต์
      '01-05', // วันแรงงาน
      '05-05', // วันฉัตรมงคล
      '12-08', // วันแม่
      '23-10', // วันปิยมหาราช
      '05-12', // วันพ่อ
      '10-12', // วันรัฐธรรมนูญ
      '31-12', // วันสิ้นปี
    ];
    
    const dateString = dateObj.format('DD-MM');
    return holidays.includes(dateString);
  };

  // เพิ่มฟังก์ชันแสดงชื่อวันในภาษาไทย
  const getThaiDayName = (date: string) => {
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const dateObj = dayjs(date);
    return dayNames[dateObj.day()];
  };

  // เพิ่มฟังก์ชันแสดงรายละเอียดวันที่
  const showDateDetail = (date: string) => {
    const dateObj = dayjs(date);
    const isHolidayDate = isHoliday(date);
    const dayName = getThaiDayName(date);
    
    // หา timesheet ที่มีอยู่สำหรับวันที่นี้
    const existingTimesheet = timesheets.find(ts => 
      dayjs(ts.date).format('YYYY-MM-DD') === date
    );
    
    setSelectedDate(date);
    setSelectedDateInfo({
      date: date,
      dayName: dayName,
      isHoliday: isHolidayDate,
      existingTimesheet: existingTimesheet,
      formattedDate: dateObj.format('DD/MM/YYYY')
    });
    setDateDetailModalVisible(true);
  };

  // เพิ่มฟังก์ชันคำนวณสถิติการทำงาน
  const calculateWorkStats = (timesheets: Timesheet[]) => {
    const now = dayjs();
    const currentYear = now.year();
    const currentMonth = now.month() + 1; // dayjs month เริ่มจาก 0
    
    // คำนวณวันทำงานทั้งหมดในเดือนนี้
    const workingDays = calculateWorkingDays(currentYear, currentMonth);
    
    // หาวันที่มีการบันทึก timesheet แล้ว (รวมวันลา)
    const recordedDates = timesheets
      .filter(ts => {
        const tsDate = dayjs(ts.date);
        return tsDate.year() === currentYear && tsDate.month() + 1 === currentMonth;
      })
      .map(ts => dayjs(ts.date).format('YYYY-MM-DD'));
    
    // หาวันลาที่มีการบันทึก
    const leaveDates = timesheets
      .filter(ts => {
        const tsDate = dayjs(ts.date);
        return tsDate.year() === currentYear && 
               tsDate.month() + 1 === currentMonth && 
               ts.work_type === 'LEAVE';
      })
      .map(ts => dayjs(ts.date).format('YYYY-MM-DD'));
    
    // หาวันทำงานที่ยังไม่ได้บันทึก (ไม่รวมวันลา)
    const missingDates = workingDays.filter(date => !recordedDates.includes(date));
    
    // คำนวณวันทำงานจริง (ไม่รวมวันลา)
    const actualWorkDays = recordedDates.filter(date => !leaveDates.includes(date));
    
    setWorkStats({
      totalWorkingDays: workingDays.length,
      recordedDays: recordedDates.length,
      leaveDays: leaveDates.length,
      actualWorkDays: actualWorkDays.length,
      missingDays: missingDates.length,
      missingDates: missingDates
    });
  };

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/timesheets/my');
      if (response.data.success) {
        const timesheetsData = response.data.data || [];
        setTimesheets(timesheetsData);
        
        // Calculate stats
        const stats = timesheetsData.reduce((acc: any, timesheet: Timesheet) => {
          acc.total++;
          acc[timesheet.status]++;
          acc.totalHours += timesheet.hours_worked + (timesheet.overtime_hours || 0);
          return acc;
        }, { total: 0, draft: 0, submitted: 0, approved: 0, rejected: 0, totalHours: 0 });
        
        setStats(stats);
        
        // คำนวณสถิติการทำงาน
        calculateWorkStats(timesheetsData);
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
        billable: values.work_type === 'PROJECT', // งานโครงการจะ billable เสมอ
        project_id: values.work_type === 'NON_PROJECT' ? null : values.project_id
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
        const response = await api.post('/api/timesheets', data);
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
      const response = await api.delete(`/api/timesheets/${id}`);
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
      const response = await api.patch(`/api/timesheets/${id}/submit`);
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

  // ฟังก์ชันสำหรับการแสดงชื่อประเภทงานย่อย
  const getSubWorkTypeLabel = (workType: string, subWorkType: string) => {
    const subWorkTypeOptions = {
      PROJECT: {
        SOFTWARE: 'ซอฟต์แวร์',
        HARDWARE: 'ฮาร์ดแวร์',
        MEETING: 'การประชุม',
        TESTING: 'การทดสอบ',
        DOCUMENTATION: 'เอกสาร',
        DESIGN: 'การออกแบบ',
        DEPLOYMENT: 'การติดตั้ง'
      },
      NON_PROJECT: {
        MEETING: 'การประชุม',
        TRAINING: 'การฝึกอบรม',
        ADMINISTRATION: 'การบริหาร',
        MAINTENANCE: 'การบำรุงรักษา',
        SUPPORT: 'การสนับสนุน',
        OTHER: 'อื่นๆ'
      }
    };
    return subWorkTypeOptions[workType as keyof typeof subWorkTypeOptions]?.[subWorkType as any] || subWorkType;
  };

  // ฟังก์ชันสำหรับการแสดงชื่อกิจกรรม
  const getActivityLabel = (activity: string) => {
    const activityLabels: Record<string, string> = {
      // งานโครงการ - ซอฟต์แวร์
      CODE_DEVELOPMENT: 'การพัฒนาโค้ด',
      SYSTEM_DESIGN: 'การออกแบบระบบ',
      BUG_FIX: 'การแก้ไขบั๊ก',
      CODE_TESTING: 'การทดสอบโค้ด',
      CODE_REVIEW: 'การรีวิวโค้ด',
      PERFORMANCE_OPTIMIZATION: 'การปรับปรุงประสิทธิภาพ',
      
      // งานโครงการ - ฮาร์ดแวร์
      EQUIPMENT_INSTALLATION: 'การติดตั้งอุปกรณ์',
      HARDWARE_MAINTENANCE: 'การบำรุงรักษา',
      HARDWARE_REPAIR: 'การแก้ไขอุปกรณ์',
      HARDWARE_UPGRADE: 'การอัปเกรด',
      HARDWARE_INSPECTION: 'การตรวจสอบ',
      
      // งานโครงการ - การประชุม
      PROJECT_TEAM_MEETING: 'การประชุมทีมโครงการ',
      CLIENT_MEETING: 'การประชุมลูกค้า',
      PLANNING_MEETING: 'การประชุมวางแผน',
      PROGRESS_MEETING: 'การประชุมติดตาม',
      REVIEW_MEETING: 'การประชุมสรุป',
      
      // งานโครงการ - การทดสอบ
      SYSTEM_TESTING: 'การทดสอบระบบ',
      UNIT_TESTING: 'การทดสอบหน่วยงาน',
      USER_ACCEPTANCE_TESTING: 'การทดสอบการใช้งาน',
      PERFORMANCE_TESTING: 'การทดสอบประสิทธิภาพ',
      SECURITY_TESTING: 'การทดสอบความปลอดภัย',
      
      // งานโครงการ - เอกสาร
      TECHNICAL_DOCUMENTATION: 'การเขียนเอกสารเทคนิค',
      USER_MANUAL: 'การเขียนคู่มือผู้ใช้',
      PROJECT_DOCUMENTATION: 'การเขียนเอกสารโครงการ',
      REPORT_WRITING: 'การเขียนรายงาน',
      
      // งานโครงการ - การออกแบบ
      UI_UX_DESIGN: 'การออกแบบ UI/UX',
      DATABASE_DESIGN: 'การออกแบบฐานข้อมูล',
      ARCHITECTURE_DESIGN: 'การออกแบบสถาปัตยกรรม',
      WORKFLOW_DESIGN: 'การออกแบบเวิร์กโฟลว์',
      
      // งานโครงการ - การติดตั้ง
      SYSTEM_DEPLOYMENT: 'การติดตั้งระบบ',
      SYSTEM_CONFIGURATION: 'การปรับแต่งระบบ',
      DATA_MIGRATION: 'การย้ายข้อมูล',
      DEPLOYMENT_TESTING: 'การทดสอบการติดตั้ง',
      
      // งานไม่เกี่ยวกับโครงการ - การประชุม
      ORGANIZATION_MEETING: 'การประชุมองค์กร',
      DEPARTMENT_MEETING: 'การประชุมแผนก',
      COMMITTEE_MEETING: 'การประชุมคณะกรรมการ',
      TRAINING_MEETING: 'การประชุมฝึกอบรม',
      
      // งานไม่เกี่ยวกับโครงการ - การฝึกอบรม
      INTERNAL_TRAINING: 'การฝึกอบรมภายใน',
      EXTERNAL_TRAINING: 'การฝึกอบรมภายนอก',
      ONLINE_TRAINING: 'การฝึกอบรมออนไลน์',
      TRAINING_PREPARATION: 'การเตรียมการฝึกอบรม',
      
      // งานไม่เกี่ยวกับโครงการ - การบริหาร
      PLANNING: 'การวางแผน',
      PROCUREMENT: 'การจัดซื้อ',
      BUDGET_MANAGEMENT: 'การจัดการงบประมาณ',
      REPORTING: 'การรายงาน',
      COORDINATION: 'การประสานงาน',
      
      // งานไม่เกี่ยวกับโครงการ - การบำรุงรักษา
      SYSTEM_MAINTENANCE: 'การบำรุงรักษาระบบ',
      BACKUP: 'การสำรองข้อมูล',
      SYSTEM_UPDATE: 'การอัปเดตระบบ',
      SYSTEM_MONITORING: 'การตรวจสอบระบบ',
      
      // งานไม่เกี่ยวกับโครงการ - การสนับสนุน
      USER_SUPPORT: 'การสนับสนุนผู้ใช้',
      TROUBLESHOOTING: 'การแก้ไขปัญหา',
      CONSULTATION: 'การให้คำปรึกษา',
      USER_TRAINING: 'การฝึกอบรมผู้ใช้',
      
      // งานไม่เกี่ยวกับโครงการ - อื่นๆ
      GENERAL_WORK: 'งานทั่วไป',
      RESEARCH: 'การวิจัย',
      PUBLIC_RELATIONS: 'การประชาสัมพันธ์',
      
      // การลางาน
      SICK_LEAVE: 'ลาป่วย',
      PERSONAL_LEAVE: 'ลากิจ',
      ANNUAL_LEAVE: 'ลาพักร้อน',
      MATERNITY_LEAVE: 'ลาคลอด',
      ORDINATION_LEAVE: 'ลาบวช',
      STUDY_LEAVE: 'ลาศึกษาต่อ',
      MONK_LEAVE: 'ลาอุปสมบท',
      SPECIAL_LEAVE: 'ลากิจพิเศษ',
      REST_LEAVE: 'ลาพักผ่อน',
      OTHER_LEAVE: 'ลาอื่นๆ'
    };
    return activityLabels[activity] || activity;
  };

  const handleCreateForDate = (date: string) => {
    setEditingTimesheet(null);
    form.resetFields();
    // Set the date immediately and ensure it's not overridden
    setTimeout(() => {
      form.setFieldsValue({ 
        date: dayjs(date),
        work_type: 'PROJECT',
        sub_work_type: 'SOFTWARE',
        activity: 'CODE_DEVELOPMENT',
        hours_worked: 8,
        overtime_hours: 0,
        billable: true
      });
    }, 0);
    setModalVisible(true);
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
      title: 'ประเภทงานย่อย',
      dataIndex: 'sub_work_type',
      key: 'sub_work_type',
      render: (subWorkType: string, record: Timesheet) => getSubWorkTypeLabel(record.work_type, subWorkType)
    },
    {
      title: 'โครงการ',
      dataIndex: 'project',
      key: 'project',
      render: (project: any, record: Timesheet) => {
        if (record.work_type === 'NON_PROJECT') {
          return <Tag color="orange">Non-Project</Tag>;
        }
        if (record.work_type === 'LEAVE') {
          return <Tag color="red">Leave</Tag>;
        }
        return project ? `${project.name} (${project.code})` : '-';
      }
    },
    {
      title: 'กิจกรรม',
      dataIndex: 'activity',
      key: 'activity',
      render: (activity: string) => getActivityLabel(activity)
    },
    {
      title: 'ชั่วโมงทำงาน',
      dataIndex: 'hours_worked',
      key: 'hours_worked',
      render: (hours: number, record: Timesheet) => {
        const totalHours = hours + (record.overtime_hours || 0);
        return (
          <div>
            <div>{hours}h</div>
            {record.overtime_hours > 0 && (
              <div className="text-xs text-orange-600">+{record.overtime_hours}h OT</div>
            )}
            <div className="text-xs text-gray-500">รวม: {totalHours}h</div>
          </div>
        );
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
            title="แก้ไข"
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            loading={deleting === record.id}
            disabled={record.status === 'approved' || record.status === 'rejected'}
            title="ลบ"
          />
          {record.status === 'draft' && (
            <Button 
              type="text" 
              icon={<SendOutlined />} 
              onClick={() => handleSubmitTimesheet(record.id)}
              loading={submitting}
              title="ส่งเพื่ออนุมัติ"
            />
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Timesheets</h1>
            <p className="text-sm text-gray-600">จัดการ timesheet ของตนเอง</p>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          สร้าง Timesheet
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col span={4}>
          <Card>
            <Statistic
              title="รวมทั้งหมด"
              value={stats.total}
              prefix={<Clock className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="ร่าง"
              value={stats.draft}
              valueStyle={{ color: '#8c8c8c' }}
              prefix={<FileText className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="ส่งแล้ว"
              value={stats.submitted}
              valueStyle={{ color: '#faad14' }}
              prefix={<Hourglass className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="อนุมัติแล้ว"
              value={stats.approved}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircle className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="ไม่อนุมัติ"
              value={stats.rejected}
              valueStyle={{ color: '#cf1322' }}
              prefix={<XCircle className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="ชั่วโมงรวม"
              value={stats.totalHours}
              suffix="ชั่วโมง"
              precision={1}
              prefix={<Clock className="h-4 w-4" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Work Statistics for Current Month */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <CalendarOutlined />
            <span>สถิติการทำงานเดือน {dayjs().format('MMMM YYYY')}</span>
          </div>
        }
        className="mb-6"
      >
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="วันทำงานทั้งหมด" value={workStats.totalWorkingDays} />
          </Col>
          <Col span={6}>
            <Statistic title="วันที่บันทึกแล้ว" value={workStats.recordedDays} valueStyle={{ color: '#3f8600' }} />
          </Col>
          <Col span={6}>
            <Statistic title="วันลา" value={workStats.leaveDays} valueStyle={{ color: '#1890ff' }} />
          </Col>
          <Col span={6}>
            <Statistic title="วันทำงานจริง" value={workStats.actualWorkDays} valueStyle={{ color: '#52c41a' }} />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col span={12}>
            <Statistic title="วันที่ยังไม่ได้บันทึก" value={workStats.missingDays} valueStyle={{ color: '#cf1322' }} />
          </Col>
          <Col span={12}>
            <Statistic 
              title="อัตราการทำงาน" 
              value={workStats.totalWorkingDays > 0 ? Math.round((workStats.actualWorkDays / workStats.totalWorkingDays) * 100) : 0} 
              suffix="%" 
              valueStyle={{ color: '#722ed1' }} 
            />
          </Col>
        </Row>
        {workStats.missingDates.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-sm text-gray-600">วันที่ยังไม่ได้บันทึก:</div>
            <div className="flex flex-wrap gap-2">
              {workStats.missingDates.map(date => (
                <Button
                  key={date}
                  size="small"
                  type="dashed"
                  onClick={() => handleCreateForDate(date)}
                >
                  {dayjs(date).format('DD/MM/YYYY')}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Timesheet Table */}
      <Card title="รายการ Timesheet ของฉัน">
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
      </Card>

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
        width={1000}
        confirmLoading={submitting}
        style={{ top: 20 }}
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