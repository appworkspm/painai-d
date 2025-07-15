import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Button, Space, Card, Typography } from 'antd';
import { Project } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface TimesheetFormProps {
  mode: 'create' | 'edit';
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  projects: Project[];
}

// ประเภทงานหลัก
const workTypeOptions = [
  { label: 'งานโครงการ', value: 'PROJECT' },
  { label: 'ไม่ใช่งานโครงการ', value: 'NON_PROJECT' },
  { label: 'ลางาน', value: 'LEAVE' }
];

// ประเภทงานย่อยที่สัมพันธ์กับประเภทงานหลัก
const subWorkTypeOptions: Record<string, { label: string; value: string; description: string }[]> = {
  PROJECT: [
    { label: 'ซอฟต์แวร์', value: 'SOFTWARE', description: 'งานพัฒนาซอฟต์แวร์และการเขียนโปรแกรม' },
    { label: 'ฮาร์ดแวร์', value: 'HARDWARE', description: 'งานติดตั้งและบำรุงรักษาฮาร์ดแวร์' },
    { label: 'การประชุม', value: 'MEETING', description: 'การประชุมที่เกี่ยวข้องกับโครงการ' },
    { label: 'การทดสอบ', value: 'TESTING', description: 'การทดสอบระบบและคุณภาพ' },
    { label: 'เอกสาร', value: 'DOCUMENTATION', description: 'การเขียนเอกสารโครงการ' },
    { label: 'การออกแบบ', value: 'DESIGN', description: 'การออกแบบระบบและ UI/UX' },
    { label: 'การติดตั้ง', value: 'DEPLOYMENT', description: 'การติดตั้งและปรับแต่งระบบ' }
  ],
  NON_PROJECT: [
    { label: 'การประชุม', value: 'MEETING', description: 'การประชุมทั่วไปขององค์กร' },
    { label: 'การฝึกอบรม', value: 'TRAINING', description: 'การฝึกอบรมและพัฒนาทักษะ' },
    { label: 'การบริหาร', value: 'ADMINISTRATION', description: 'งานบริหารและจัดการทั่วไป' },
    { label: 'การบำรุงรักษา', value: 'MAINTENANCE', description: 'การบำรุงรักษาระบบทั่วไป' },
    { label: 'การสนับสนุน', value: 'SUPPORT', description: 'การให้บริการสนับสนุนผู้ใช้' },
    { label: 'อื่นๆ', value: 'OTHER', description: 'งานอื่นๆ ที่ไม่เกี่ยวข้องกับโครงการ' }
  ],
  LEAVE: [
    { label: 'ลางาน', value: 'LEAVE', description: 'การลางานประเภทต่างๆ' }
  ]
};

// กิจกรรมที่สัมพันธ์กับประเภทงานย่อย
const activityOptions: Record<string, { label: string; value: string; description: string }[]> = {
  // งานโครงการ - ซอฟต์แวร์
  SOFTWARE: [
    { label: 'การพัฒนาโค้ด', value: 'CODE_DEVELOPMENT', description: 'การเขียนโค้ดและพัฒนาโปรแกรม' },
    { label: 'การออกแบบระบบ', value: 'SYSTEM_DESIGN', description: 'การออกแบบสถาปัตยกรรมระบบ' },
    { label: 'การแก้ไขบั๊ก', value: 'BUG_FIX', description: 'การแก้ไขข้อผิดพลาดในระบบ' },
    { label: 'การทดสอบโค้ด', value: 'CODE_TESTING', description: 'การทดสอบโค้ดและหน่วยงาน' },
    { label: 'การรีวิวโค้ด', value: 'CODE_REVIEW', description: 'การตรวจสอบและรีวิวโค้ด' },
    { label: 'การปรับปรุงประสิทธิภาพ', value: 'PERFORMANCE_OPTIMIZATION', description: 'การปรับปรุงประสิทธิภาพระบบ' }
  ],
  // งานโครงการ - ฮาร์ดแวร์
  HARDWARE: [
    { label: 'การติดตั้งอุปกรณ์', value: 'EQUIPMENT_INSTALLATION', description: 'การติดตั้งอุปกรณ์ฮาร์ดแวร์' },
    { label: 'การบำรุงรักษา', value: 'HARDWARE_MAINTENANCE', description: 'การบำรุงรักษาอุปกรณ์' },
    { label: 'การแก้ไขอุปกรณ์', value: 'HARDWARE_REPAIR', description: 'การแก้ไขและซ่อมแซมอุปกรณ์' },
    { label: 'การอัปเกรด', value: 'HARDWARE_UPGRADE', description: 'การอัปเกรดอุปกรณ์' },
    { label: 'การตรวจสอบ', value: 'HARDWARE_INSPECTION', description: 'การตรวจสอบและทดสอบอุปกรณ์' }
  ],
  // งานโครงการ - การประชุม
  MEETING: [
    { label: 'การประชุมทีมโครงการ', value: 'PROJECT_TEAM_MEETING', description: 'การประชุมทีมงานโครงการ' },
    { label: 'การประชุมลูกค้า', value: 'CLIENT_MEETING', description: 'การประชุมกับลูกค้า' },
    { label: 'การประชุมวางแผน', value: 'PLANNING_MEETING', description: 'การประชุมวางแผนโครงการ' },
    { label: 'การประชุมติดตาม', value: 'PROGRESS_MEETING', description: 'การประชุมติดตามความคืบหน้า' },
    { label: 'การประชุมสรุป', value: 'REVIEW_MEETING', description: 'การประชุมสรุปและประเมินผล' }
  ],
  // งานโครงการ - การทดสอบ
  TESTING: [
    { label: 'การทดสอบระบบ', value: 'SYSTEM_TESTING', description: 'การทดสอบระบบรวม' },
    { label: 'การทดสอบหน่วยงาน', value: 'UNIT_TESTING', description: 'การทดสอบหน่วยงานย่อย' },
    { label: 'การทดสอบการใช้งาน', value: 'USER_ACCEPTANCE_TESTING', description: 'การทดสอบการใช้งานจริง' },
    { label: 'การทดสอบประสิทธิภาพ', value: 'PERFORMANCE_TESTING', description: 'การทดสอบประสิทธิภาพระบบ' },
    { label: 'การทดสอบความปลอดภัย', value: 'SECURITY_TESTING', description: 'การทดสอบความปลอดภัย' }
  ],
  // งานโครงการ - เอกสาร
  DOCUMENTATION: [
    { label: 'การเขียนเอกสารเทคนิค', value: 'TECHNICAL_DOCUMENTATION', description: 'การเขียนเอกสารเทคนิค' },
    { label: 'การเขียนคู่มือผู้ใช้', value: 'USER_MANUAL', description: 'การเขียนคู่มือการใช้งาน' },
    { label: 'การเขียนเอกสารโครงการ', value: 'PROJECT_DOCUMENTATION', description: 'การเขียนเอกสารโครงการ' },
    { label: 'การเขียนรายงาน', value: 'REPORT_WRITING', description: 'การเขียนรายงานต่างๆ' }
  ],
  // งานโครงการ - การออกแบบ
  DESIGN: [
    { label: 'การออกแบบ UI/UX', value: 'UI_UX_DESIGN', description: 'การออกแบบส่วนติดต่อผู้ใช้' },
    { label: 'การออกแบบฐานข้อมูล', value: 'DATABASE_DESIGN', description: 'การออกแบบโครงสร้างฐานข้อมูล' },
    { label: 'การออกแบบสถาปัตยกรรม', value: 'ARCHITECTURE_DESIGN', description: 'การออกแบบสถาปัตยกรรมระบบ' },
    { label: 'การออกแบบเวิร์กโฟลว์', value: 'WORKFLOW_DESIGN', description: 'การออกแบบกระบวนการทำงาน' }
  ],
  // งานโครงการ - การติดตั้ง
  DEPLOYMENT: [
    { label: 'การติดตั้งระบบ', value: 'SYSTEM_DEPLOYMENT', description: 'การติดตั้งระบบในเซิร์ฟเวอร์' },
    { label: 'การปรับแต่งระบบ', value: 'SYSTEM_CONFIGURATION', description: 'การปรับแต่งการตั้งค่าระบบ' },
    { label: 'การย้ายข้อมูล', value: 'DATA_MIGRATION', description: 'การย้ายและแปลงข้อมูล' },
    { label: 'การทดสอบการติดตั้ง', value: 'DEPLOYMENT_TESTING', description: 'การทดสอบหลังการติดตั้ง' }
  ],
  // งานไม่เกี่ยวกับโครงการ - การประชุม
  NON_PROJECT_MEETING: [
    { label: 'การประชุมองค์กร', value: 'ORGANIZATION_MEETING', description: 'การประชุมทั่วไปขององค์กร' },
    { label: 'การประชุมแผนก', value: 'DEPARTMENT_MEETING', description: 'การประชุมแผนก' },
    { label: 'การประชุมคณะกรรมการ', value: 'COMMITTEE_MEETING', description: 'การประชุมคณะกรรมการ' },
    { label: 'การประชุมฝึกอบรม', value: 'TRAINING_MEETING', description: 'การประชุมเพื่อการฝึกอบรม' }
  ],
  // งานไม่เกี่ยวกับโครงการ - การฝึกอบรม
  TRAINING: [
    { label: 'การฝึกอบรมภายใน', value: 'INTERNAL_TRAINING', description: 'การฝึกอบรมภายในองค์กร' },
    { label: 'การฝึกอบรมภายนอก', value: 'EXTERNAL_TRAINING', description: 'การฝึกอบรมภายนอกองค์กร' },
    { label: 'การฝึกอบรมออนไลน์', value: 'ONLINE_TRAINING', description: 'การฝึกอบรมผ่านระบบออนไลน์' },
    { label: 'การเตรียมการฝึกอบรม', value: 'TRAINING_PREPARATION', description: 'การเตรียมการฝึกอบรม' }
  ],
  // งานไม่เกี่ยวกับโครงการ - การบริหาร
  ADMINISTRATION: [
    { label: 'การวางแผน', value: 'PLANNING', description: 'การวางแผนงานและโครงการ' },
    { label: 'การจัดซื้อ', value: 'PROCUREMENT', description: 'การจัดซื้อจัดจ้าง' },
    { label: 'การจัดการงบประมาณ', value: 'BUDGET_MANAGEMENT', description: 'การจัดการงบประมาณ' },
    { label: 'การรายงาน', value: 'REPORTING', description: 'การจัดทำรายงานต่างๆ' },
    { label: 'การประสานงาน', value: 'COORDINATION', description: 'การประสานงานกับหน่วยงานอื่น' }
  ],
  // งานไม่เกี่ยวกับโครงการ - การบำรุงรักษา
  MAINTENANCE: [
    { label: 'การบำรุงรักษาระบบ', value: 'SYSTEM_MAINTENANCE', description: 'การบำรุงรักษาระบบทั่วไป' },
    { label: 'การสำรองข้อมูล', value: 'BACKUP', description: 'การสำรองและกู้คืนข้อมูล' },
    { label: 'การอัปเดตระบบ', value: 'SYSTEM_UPDATE', description: 'การอัปเดตและแพทช์ระบบ' },
    { label: 'การตรวจสอบระบบ', value: 'SYSTEM_MONITORING', description: 'การตรวจสอบและติดตามระบบ' }
  ],
  // งานไม่เกี่ยวกับโครงการ - การสนับสนุน
  SUPPORT: [
    { label: 'การสนับสนุนผู้ใช้', value: 'USER_SUPPORT', description: 'การให้บริการสนับสนุนผู้ใช้' },
    { label: 'การแก้ไขปัญหา', value: 'TROUBLESHOOTING', description: 'การแก้ไขปัญหาทางเทคนิค' },
    { label: 'การให้คำปรึกษา', value: 'CONSULTATION', description: 'การให้คำปรึกษาและแนะนำ' },
    { label: 'การฝึกอบรมผู้ใช้', value: 'USER_TRAINING', description: 'การฝึกอบรมผู้ใช้งานระบบ' }
  ],
  // งานไม่เกี่ยวกับโครงการ - อื่นๆ
  OTHER: [
    { label: 'งานทั่วไป', value: 'GENERAL_WORK', description: 'งานทั่วไปที่ไม่จัดอยู่ในหมวดอื่น' },
    { label: 'การวิจัย', value: 'RESEARCH', description: 'การวิจัยและพัฒนา' },
    { label: 'การประชาสัมพันธ์', value: 'PUBLIC_RELATIONS', description: 'การประชาสัมพันธ์และสื่อสาร' }
  ],
  // การลางาน
  LEAVE: [
    { label: 'ลาป่วย', value: 'SICK_LEAVE', description: 'การลาป่วย' },
    { label: 'ลากิจ', value: 'PERSONAL_LEAVE', description: 'การลากิจส่วนตัว' },
    { label: 'ลาพักร้อน', value: 'ANNUAL_LEAVE', description: 'การลาพักร้อนประจำปี' },
    { label: 'ลาคลอด', value: 'MATERNITY_LEAVE', description: 'การลาคลอดบุตร' },
    { label: 'ลาบวช', value: 'ORDINATION_LEAVE', description: 'การลาบวช' },
    { label: 'ลาศึกษาต่อ', value: 'STUDY_LEAVE', description: 'การลาศึกษาต่อ' },
    { label: 'ลาอุปสมบท', value: 'MONK_LEAVE', description: 'การลาอุปสมบท' },
    { label: 'ลากิจพิเศษ', value: 'SPECIAL_LEAVE', description: 'การลากิจพิเศษ' },
    { label: 'ลาพักผ่อน', value: 'REST_LEAVE', description: 'การลาพักผ่อน' },
    { label: 'ลาอื่นๆ', value: 'OTHER_LEAVE', description: 'การลาอื่นๆ' }
  ]
};

const TimesheetForm: React.FC<TimesheetFormProps> = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading,
  projects
}) => {
  const [form] = Form.useForm();
  const [selectedWorkType, setSelectedWorkType] = useState<string>('PROJECT');
  const [selectedSubWorkType, setSelectedSubWorkType] = useState<string>('SOFTWARE');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setSelectedWorkType(initialValues.work_type || 'PROJECT');
      setSelectedSubWorkType(initialValues.sub_work_type || 'SOFTWARE');
    } else {
      // Set default values including today's date
      const today = dayjs();
      form.setFieldsValue({
        date: today,
        work_type: 'PROJECT',
        sub_work_type: 'SOFTWARE',
        activity: 'CODE_DEVELOPMENT',
        hours_worked: 8,
        overtime_hours: 0,
        billable: true
      });
    }
  }, [initialValues, form]);

  // ฟังก์ชันสำหรับการจัดการการเปลี่ยนแปลงประเภทงาน
  const handleWorkTypeChange = (value: string) => {
    setSelectedWorkType(value);
    const defaultSubWorkType = subWorkTypeOptions[value]?.[0]?.value || '';
    setSelectedSubWorkType(defaultSubWorkType);
    
    form.setFieldsValue({
      sub_work_type: defaultSubWorkType,
      activity: '',
      project_id: value === 'NON_PROJECT' ? 'NON_PROJECT' : 
                  value === 'LEAVE' ? 'LEAVE' : undefined
    });
  };

  // ฟังก์ชันสำหรับการจัดการการเปลี่ยนแปลงประเภทงานย่อย
  const handleSubWorkTypeChange = (value: string) => {
    setSelectedSubWorkType(value);
    let activityKey = value;
    if (selectedWorkType === 'NON_PROJECT') {
      activityKey = `NON_PROJECT_${value}`;
    } else if (selectedWorkType === 'LEAVE') {
      activityKey = 'LEAVE';
    }
    const defaultActivity = activityOptions[activityKey]?.[0]?.value || '';
    
    form.setFieldsValue({
      activity: defaultActivity
    });
  };

  // ฟังก์ชันสำหรับการจัดการการเปลี่ยนแปลงกิจกรรม
  const handleActivityChange = (value: string) => {
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

  // ฟังก์ชันสำหรับการคำนวณชั่วโมงรวม
  const calculateTotalHours = () => {
    const hoursWorked = form.getFieldValue('hours_worked') || 0;
    const overtimeHours = form.getFieldValue('overtime_hours') || 0;
    return Number(hoursWorked) + Number(overtimeHours);
  };

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
              name="work_type"
              label="ประเภทงาน"
              rules={[{ required: true, message: 'กรุณาเลือกประเภทงาน' }]}
            >
              <Select
                options={workTypeOptions}
                onChange={handleWorkTypeChange}
                placeholder="เลือกประเภทงาน"
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
                options={subWorkTypeOptions[selectedWorkType] || []}
                onChange={handleSubWorkTypeChange}
                placeholder="เลือกประเภทงานย่อย"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="activity"
              label="กิจกรรม"
              rules={[{ required: true, message: 'กรุณาเลือกกิจกรรม' }]}
            >
              <Select
                options={(() => {
                  let activityKey = selectedSubWorkType;
                  if (selectedWorkType === 'NON_PROJECT') {
                    activityKey = `NON_PROJECT_${selectedSubWorkType}`;
                  } else if (selectedWorkType === 'LEAVE') {
                    activityKey = 'LEAVE';
                  }
                  return activityOptions[activityKey] || [];
                })()}
                onChange={handleActivityChange}
                placeholder={
                  selectedSubWorkType === 'OTHER' ? 'ระบุรายละเอียดในการทำงาน' :
                  selectedWorkType === 'LEAVE' ? 'เลือกประเภทการลา' :
                  'เลือกกิจกรรม'
                }
              />
            </Form.Item>
          </Col>
        </Row>

        {/* คำอธิบายประเภทงานย่อยและกิจกรรม */}
        {selectedSubWorkType && (
          <Card size="small" className="bg-gray-50">
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>ประเภทงานย่อย:</Text>
                <br />
                <Text type="secondary">
                  {subWorkTypeOptions[selectedWorkType]?.find(option => option.value === selectedSubWorkType)?.description || ''}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>กิจกรรม:</Text>
                <br />
                <Text type="secondary">
                  {selectedSubWorkType === 'OTHER' 
                    ? 'กรุณาระบุรายละเอียดการทำงานที่ชัดเจน' 
                    : (() => {
                        let activityKey = selectedSubWorkType;
                        if (selectedWorkType === 'NON_PROJECT') {
                          activityKey = `NON_PROJECT_${selectedSubWorkType}`;
                        } else if (selectedWorkType === 'LEAVE') {
                          activityKey = 'LEAVE';
                        }
                        const activity = form.getFieldValue('activity');
                        return activityOptions[activityKey]?.find(option => option.value === activity)?.description || '';
                      })()
                  }
                </Text>
              </Col>
            </Row>
          </Card>
        )}

        {/* ชั่วโมงทำงาน */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="hours_worked"
              label="ชั่วโมงทำงานปกติ"
              rules={[{ required: true, message: 'กรุณาระบุชั่วโมงทำงาน' }]}
            >
              <Input 
                type="number" 
                min={0} 
                max={24} 
                step={0.5} 
                onChange={() => form.setFieldsValue({ total_hours: calculateTotalHours() })}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="overtime_hours"
              label="ชั่วโมงโอที"
            >
              <Input 
                type="number" 
                min={0} 
                max={24} 
                step={0.5}
                onChange={() => form.setFieldsValue({ total_hours: calculateTotalHours() })}
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
                className="bg-gray-100"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* รายละเอียด */}
        <Form.Item
          name="description"
          label="รายละเอียดการทำงาน"
          rules={[{ required: true, message: 'กรุณาระบุรายละเอียดการทำงาน' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="อธิบายรายละเอียดการทำงานที่ทำในวันนี้..."
          />
        </Form.Item>

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
        <Form.Item className="text-center">
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              {mode === 'edit' ? 'อัปเดต Timesheet' : 'สร้าง Timesheet'}
            </Button>
            <Button onClick={onCancel} size="large">
              ยกเลิก
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TimesheetForm; 