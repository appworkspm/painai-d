import React, { useEffect, useState, useCallback } from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Button, Space, Card, Typography, Spin, Alert } from 'antd';
import { Project } from '../types';
import dayjs from 'dayjs';
import useTimesheetTypes from '../hooks/useTimesheetTypes';

const { TextArea } = Input;
const { Text } = Typography;

// Default activity description for 'OTHER' sub work type
const DEFAULT_OTHER_ACTIVITY = 'ระบุรายละเอียดกิจกรรมเพิ่มเติม';

interface TimesheetFormProps {
  mode: 'create' | 'edit';
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  projects: Project[];
}

// Helper function to convert work types to select options
const mapToSelectOptions = (items: Array<{ id: string; name: string; description?: string }>) => {
  if (!items) return [];
  return items.map(item => ({
    label: item.name,
    value: item.id,
    description: item.description || ''
  }));
};

// All work types are now fetched from the backend via the useTimesheetTypes hook
const TimesheetForm: React.FC<TimesheetFormProps> = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading: formLoading,
  projects
}) => {
  const [form] = Form.useForm();
  const [selectedWorkType, setSelectedWorkType] = useState<string>('');
  const [selectedSubWorkType, setSelectedSubWorkType] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  // State for tracking hours (commented out as they're not currently used)
  // const [totalHours, setTotalHours] = useState<number>(0);
  // const [overtimeHours, setOvertimeHours] = useState<number>(0);

  // Fetch timesheet types from the backend
  const {
    workTypes: fetchedWorkTypes,
    subWorkTypes,
    activities,
    loading,
    error,
    fetchSubWorkTypes,
    fetchActivities,
    getSubWorkTypeById
  } = useTimesheetTypes();

  // Map work types to select options
  const workTypeOptions = mapToSelectOptions(fetchedWorkTypes);

  // Map sub work types to select options
  const subWorkTypeSelectOptions = mapToSelectOptions(subWorkTypes);

  // Map activities to select options
  const activitySelectOptions = mapToSelectOptions(activities);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setSelectedWorkType(initialValues.work_type || 'PROJECT');
      setSelectedSubWorkType(initialValues.sub_work_type || 'SOFTWARE');

      // Set initial times if they exist, otherwise use default
      if (initialValues.start_time && initialValues.end_time) {
        setStartTime(initialValues.start_time);
        setEndTime(initialValues.end_time);
      }
    } else {
      // Set default values including today's date
      const today = dayjs();
      const defaultStartTime = '09:00';
      const defaultEndTime = '18:00';
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);

      form.setFieldsValue({
        date: today,
        work_type: 'PROJECT',
        sub_work_type: 'SOFTWARE',
        activity: 'CODE_DEVELOPMENT',
        hours_worked: 0,
        overtime_hours: 0,
        total_hours: 0,
        billable: true,
        start_time: defaultStartTime,
        end_time: defaultEndTime
      });
    }
  }, [initialValues, form]);

  // ฟังก์ชันสำหรับการจัดการการเปลี่ยนแปลงประเภทงาน
  const handleWorkTypeChange = useCallback((value: string) => {
    setSelectedWorkType(value);
    setSelectedSubWorkType('');
    setSelectedActivity('');
    setDescription('');

    // Fetch sub work types for the selected work type
    fetchSubWorkTypes(value);

    // Reset form fields
    form.setFieldsValue({
      sub_work_type: undefined,
      activity: undefined,
      description: ''
    });
  }, [fetchSubWorkTypes, form]);

  // ฟังก์ชันสำหรับการจัดการการเปลี่ยนแปลงประเภทงานย่อย
  const handleSubWorkTypeChange = useCallback((value: string) => {
    setSelectedSubWorkType(value);
    setSelectedActivity('');

    // Fetch activities for the selected sub work type
    fetchActivities(value);

    // Get sub work type details
    const subWorkType = getSubWorkTypeById(value);

    // If sub work type is 'OTHER', set default activity description
    if (subWorkType?.name.toUpperCase() === 'OTHER' || subWorkType?.name === 'อื่นๆ') {
      setDescription(DEFAULT_OTHER_ACTIVITY);
      form.setFieldsValue({
        activity: undefined,
        description: DEFAULT_OTHER_ACTIVITY
      });
    } else {
      setDescription('');
      form.setFieldsValue({
        activity: undefined,
        description: ''
      });
    }
  }, [fetchActivities, getSubWorkTypeById, form]);

  // ฟังก์ชันสำหรับการจัดการการเปลี่ยนแปลงกิจกรรม
  const handleActivityChange = (value: string) => {
    setSelectedActivity(value);
    form.setFieldsValue({
      activity: value
    });
  };

  // ฟังก์ชันสำหรับการจัดการการเปลี่ยนแปลงโครงการ
  const handleProjectChange = (value: string) => {
    form.setFieldsValue({
      project_id: value
    });
  };

  // ฟังก์ชันสำหรับการจัดการการส่งฟอร์ม
  const handleSubmit = (values: any) => {
    // ตรวจสอบและปรับแต่งข้อมูลก่อนส่ง
    const submitData = {
      ...values,
      project_id: values.work_type === 'NON_PROJECT' || values.work_type === 'LEAVE' ? null : values.project_id,
      billable: values.work_type === 'PROJECT' // งานโครงการจะ billable เสมอ
    };
    onSubmit(submitData);
  };

  // ฟังก์ชันสำหรับการคำนวณชั่วโมงทำงานปกติและโอที
  const calculateWorkingHours = (start: string, end: string) => {
    if (!start || !end) return { normalHours: 0, overtimeHours: 0 };

    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    // Convert to minutes for easier calculation
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    // If end time is on the next day
    const totalMinutes = endTotal > startTotal ? endTotal - startTotal : (24 * 60 - startTotal) + endTotal;

    // Regular working hours end at 17:30 (1050 minutes)
    const regularEnd = 17 * 60 + 30; // 17:30
    // Overtime can only start after 1 hour break from regular end time (18:30)
    const overtimeStart = regularEnd + 60; // 18:30

    let normalMinutes = 0;
    let overtimeMinutes = 0;

    // Calculate normal and overtime minutes with break requirement
    for (let i = 0; i < totalMinutes; i++) {
      const currentMinute = (startTotal + i) % (24 * 60);
      // Normal hours are before regular end time (before 17:30)
      if (currentMinute < regularEnd) {
        normalMinutes++;
      } 
      // Overtime hours are only counted after 1 hour break (after 18:30)
      else if (currentMinute >= overtimeStart) {
        overtimeMinutes++;
      }
      // Time between 17:30-18:30 is considered break time (not counted as work time)
    }

    // Convert back to hours (with 2 decimal places)
    const normalHours = parseFloat((normalMinutes / 60).toFixed(2));
    const overtimeHours = parseFloat((overtimeMinutes / 60).toFixed(2));

    return { normalHours, overtimeHours };
  };

  // ฟังก์ชันสำหรับการคำนวณชั่วโมงรวม
  const calculateTotalHours = () => {
    const hoursWorked = form.getFieldValue('hours_worked') || 0;
    const overtimeHours = form.getFieldValue('overtime_hours') || 0;
    return parseFloat((Number(hoursWorked) + Number(overtimeHours)).toFixed(2));
  };

  // ฟังก์ชันสำหรับการอัพเดทชั่วโมงทำงานเมื่อเวลาเปลี่ยน
  const updateWorkingHours = (newStartTime: string, newEndTime: string) => {
    setStartTime(newStartTime);
    setEndTime(newEndTime);

    const { normalHours, overtimeHours: calculatedOvertime } = calculateWorkingHours(newStartTime, newEndTime);

    form.setFieldsValue({
      hours_worked: normalHours,
      overtime_hours: calculatedOvertime,
      total_hours: normalHours + calculatedOvertime
    });
  };

  // Show loading state
  if (loading.workTypes && fetchedWorkTypes.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert
        message="Error"
        description={`Failed to load timesheet types: ${error.message}`}
        type="error"
        showIcon
        action={
          <Button type="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {mode === 'edit' ? 'แก้ไข Timesheet' : 'สร้าง Timesheet ใหม่'}
        </h2>
        <Text type="secondary">
          กรุณากรอกข้อมูลการทำงานให้ครบถ้วน
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-4"
      >
        {/* วันที่และประเภทงาน */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date"
              label="วันที่"
              rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="ประเภทงานหลัก"
              name="workType"
              rules={[{ required: true, message: 'กรุณาเลือกประเภทงานหลัก' }]}
            >
              <Select
                placeholder={loading.workTypes ? 'กำลังโหลดประเภทงาน...' : 'เลือกประเภทงานหลัก'}
                onChange={handleWorkTypeChange}
                options={workTypeOptions}
                disabled={mode === 'edit' || loading.workTypes}
                loading={loading.workTypes}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* โครงการ */}
        <Form.Item
          name="project_id"
          label="โครงการ"
          rules={[
            { 
              required: true, 
              message: 'กรุณาเลือกโครงการ',
              validator: (_, value) => {
                if (selectedWorkType === 'NON_PROJECT' || selectedWorkType === 'LEAVE') {
                  return Promise.resolve();
                }
                if (!value) {
                  return Promise.reject(new Error('กรุณาเลือกโครงการ'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Select
            placeholder={
              selectedWorkType === 'NON_PROJECT' ? 'Non-Project (อัตโนมัติ)' :
              selectedWorkType === 'LEAVE' ? 'Leave (อัตโนมัติ)' :
              'เลือกโครงการ'
            }
            showSearch
            optionFilterProp="children"
            disabled={selectedWorkType === 'NON_PROJECT' || selectedWorkType === 'LEAVE'}
            onChange={handleProjectChange}
            options={
              selectedWorkType === 'NON_PROJECT' ? [
                { key: 'NON_PROJECT', value: 'NON_PROJECT', label: 'Non-Project' }
              ] : selectedWorkType === 'LEAVE' ? [
                { key: 'LEAVE', value: 'LEAVE', label: 'Leave' }
              ] : projects.map(project => ({
                key: project.id,
                value: project.id,
                label: `${project.name} (${project.jobCode || project.id || ''})`
              }))
            }
          />
        </Form.Item>

        {/* ประเภทงานย่อยและกิจกรรม */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="sub_work_type"
              label="ประเภทงานย่อย"
              rules={[{ required: true, message: 'กรุณาเลือกประเภทงานย่อย' }]}
            >
              <Select
                options={subWorkTypeSelectOptions}
                onChange={handleSubWorkTypeChange}
                placeholder="เลือกประเภทงานย่อย"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="activity"
              label="กิจกรรม"
              rules={[
                { 
                  required: true, 
                  message: 'กรุณาเลือกกิจกรรม',
                  validator: (_, value) => {
                    if (!value && !description) {
                      return Promise.reject(new Error('กรุณาเลือกกิจกรรมหรือระบุรายละเอียด'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Select
                placeholder={loading.activities ? 'กำลังโหลดกิจกรรม...' : 'เลือกกิจกรรม'}
                onChange={handleActivityChange}
                disabled={!selectedSubWorkType || mode === 'edit' || loading.activities}
                options={activitySelectOptions}
                loading={loading.activities}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => 
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        {/* รายละเอียด */}
        <Form.Item
          label="รายละเอียดเพิ่มเติม"
          name="description"
          rules={[
            { 
              required: true, 
              message: 'กรุณากรอกรายละเอียด',
              validator: (_, value) => {
                if (!value && !selectedActivity) {
                  return Promise.reject(new Error('กรุณากรอกรายละเอียดหรือเลือกกิจกรรม'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="อธิบายรายละเอียดงานที่ทำ"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={mode === 'edit'}
          />
        </Form.Item>

        {/* เวลาเริ่มต้นและสิ้นสุดการทำงาน */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="เวลาเริ่มงาน"
              required
            >
              <Input 
                type="time"
                value={startTime}
                onChange={(e) => {
                  updateWorkingHours(e.target.value, endTime);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="เวลาเลิกงาน"
              required
            >
              <Input 
                type="time"
                value={endTime}
                onChange={(e) => {
                  updateWorkingHours(startTime, e.target.value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* ชั่วโมงทำงาน */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="hours_worked"
              label="ชั่วโมงทำงานปกติ"
<<<<<<< HEAD
              rules={[ 
                { required: true, message: 'กรุณาระบุชั่วโมงทำงาน' },
                { type: 'number', min: 0, max: 24, message: 'กรุณากรอกชั่วโมงระหว่าง 0 ถึง 24' }
              ]}
=======
>>>>>>> feature/integrate-timesheet-types
            >
              <Input 
                type="number" 
                min={0} 
                max={24} 
                step={0.01}
                readOnly
                className="bg-gray-100"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="overtime_hours"
<<<<<<< HEAD
              label="ชั่วโมงโอที"
              rules={[
                { type: 'number', min: 0, max: 24, message: 'กรุณากรอกโอทีระหว่าง 0 ถึง 24' }
              ]}
=======
              label="ชั่วโมงโอที (หลัง 18:00 น.)"
>>>>>>> feature/integrate-timesheet-types
            >
              <Input 
                type="number" 
                min={0} 
                max={24} 
                step={0.01}
                readOnly
                className="bg-gray-100"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="total_hours"
              label="ชั่วโมงรวม"
            >
              <Input 
                type="number" 
                value={calculateTotalHours()}
                disabled
                className="bg-gray-100 font-semibold"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* สรุปข้อมูล */}
        <Card size="small" className="bg-blue-50 border-blue-200">
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>ประเภทงาน:</Text>
              <br />
              <Text type="secondary">
                {workTypeOptions.find(option => option.value === selectedWorkType)?.label || ''}
              </Text>
            </Col>
            <Col span={8}>
              <Text strong>โครงการ:</Text>
              <br />
              <Text type="secondary">
                {selectedWorkType === 'NON_PROJECT' 
                  ? 'Non-Project' 
                  : projects.find(p => p.id === form.getFieldValue('project_id'))?.name || 'ยังไม่ได้เลือก'
                }
              </Text>
            </Col>
            <Col span={8}>
              <Text strong>ชั่วโมงรวม:</Text>
              <br />
              <Text type="secondary">
                {calculateTotalHours()} ชั่วโมง
              </Text>
            </Col>
          </Row>
        </Card>

        {/* ปุ่มดำเนินการ */}
        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={formLoading || loading.workTypes || loading.subWorkTypes || loading.activities}
              disabled={!selectedWorkType || !selectedSubWorkType || (!selectedActivity && !description)}
            >
              {mode === 'create' ? 'บันทึก' : 'อัปเดต'}
            </Button>
            <Button 
              htmlType="button" 
              onClick={onCancel}
              disabled={formLoading}
            >
              ยกเลิก
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TimesheetForm;