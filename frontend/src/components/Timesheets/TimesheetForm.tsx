import React, { useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Modal, Button, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { TimesheetFormValues, Project } from './types';
import { formatDate } from './utils';
import dayjs from 'dayjs';
import './TimesheetForm.css';

const { Option } = Select;
const { TextArea } = Input;

interface TimesheetFormProps {
  visible: boolean;
  initialValues?: Partial<TimesheetFormValues>;
  projects: Project[];
  loading: boolean;
  onSubmit: (values: TimesheetFormValues) => Promise<void>;
  onCancel: () => void;
}

const TimesheetForm: React.FC<TimesheetFormProps> = ({
  visible,
  initialValues,
  projects,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [form] = useForm<TimesheetFormValues>();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          date: initialValues.date || dayjs(),
        });
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      });
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={initialValues?.id ? 'Edit Timesheet' : 'Add New Timesheet'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSubmit}
        >
          {initialValues?.id ? 'Update' : 'Create'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: dayjs(),
          hours_worked: 1,
          ...initialValues,
        }}
        className="timesheet-form"
      >
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>

        <div className="form-row">
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select a date' }]}
            className="form-item-date"
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                // Can not select future dates
                return current && current > dayjs().endOf('day');
              }}
            />
          </Form.Item>

          <Form.Item
            name="hours_worked"
            label="Hours Worked"
            rules={[
              { required: true, message: 'Please enter hours worked' },
              { type: 'number', min: 0.25, max: 24, message: 'Hours must be between 0.25 and 24' },
            ]}
            className="form-item-hours"
          >
            <InputNumber 
              min={0.25} 
              max={24} 
              step={0.25} 
              style={{ width: '100%' }} 
              precision={2}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="project_id"
          label="Project"
          rules={[{ required: true, message: 'Please select a project' }]}
        >
          <Select
            showSearch
            placeholder="เลือกโครงการ"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as string).toLowerCase().includes(input.toLowerCase())
            }
            loading={loading}
          >
            {projects.map((project) => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="task"
          label="Task Description"
          rules={[
            { required: true, message: 'Please enter task description' },
            { max: 255, message: 'Task description cannot exceed 255 characters' },
          ]}
        >
          <Input placeholder="อธิบายงานที่ทำ" maxLength={255} />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes (Optional)"
          rules={[{ max: 1000, message: 'Notes cannot exceed 1000 characters' }]}
        >
          <TextArea
            rows={3}
            placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TimesheetForm;
