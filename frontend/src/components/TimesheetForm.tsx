import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Button, Space } from 'antd';
import { Project } from '../types';

const { TextArea } = Input;

interface TimesheetFormProps {
  mode: 'create' | 'edit';
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  projects: Project[];
}

const workTypeOptions = [
  { label: 'งานโครงการ', value: 'PROJECT' },
  { label: 'งานไม่เกี่ยวกับโครงการ', value: 'NON_PROJECT' }
];

const subWorkTypeOptions: Record<string, { label: string; value: string }[]> = {
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

const activityOptions: Record<string, { label: string; value: string }[]> = {
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
  ],
  TRAINING: [],
  ADMINISTRATION: [],
  DOCUMENTATION: [],
  TESTING: [],
  OTHER: []
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

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.setFieldsValue({
        work_type: 'PROJECT',
        sub_work_type: 'SOFTWARE',
        activity: 'DEVELOPMENT',
        hours_worked: 8,
        overtime_hours: 0,
        billable: true
      });
    }
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
    >
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
              onChange={(value: string) => {
                form.setFieldsValue({
                  sub_work_type: subWorkTypeOptions[value][0]?.value,
                  project_id: value === 'NON_PROJECT' ? null : undefined
                });
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="project_id"
        label="โครงการ"
        rules={[{ required: true, message: 'กรุณาเลือกโครงการ' }]}
      >
        <Select
          placeholder="เลือกโครงการ"
          showSearch
          optionFilterProp="children"
          disabled={form.getFieldValue('work_type') === 'NON_PROJECT'}
          options={projects.map(project => ({
            key: project.id,
            value: project.id,
            label: `${project.name} (${project.code || ''})`
          }))}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="sub_work_type"
            label="ประเภทงานย่อย"
            rules={[{ required: true, message: 'กรุณาเลือกประเภทงานย่อย' }]}
          >
            <Select
              options={subWorkTypeOptions[form.getFieldValue('work_type') as keyof typeof subWorkTypeOptions] || []}
              onChange={(value: string) => {
                const activities = activityOptions[value as keyof typeof activityOptions];
                if (activities && activities.length > 0) {
                  form.setFieldsValue({ activity: activities[0].value });
                }
              }}
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
              options={activityOptions[form.getFieldValue('sub_work_type') as keyof typeof activityOptions] || []}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="hours_worked"
            label="ชั่วโมงทำงาน"
            rules={[{ required: true, message: 'กรุณาระบุชั่วโมงทำงาน' }]}
          >
            <Input type="number" min={0} max={24} step={0.5} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="overtime_hours"
            label="ชั่วโมงโอที"
          >
            <Input type="number" min={0} max={24} step={0.5} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="รายละเอียด"
        rules={[{ required: true, message: 'กรุณาระบุรายละเอียด' }]}
      >
        <TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === 'edit' ? 'อัปเดต' : 'สร้าง'}
          </Button>
          <Button onClick={onCancel}>
            ยกเลิก
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TimesheetForm; 