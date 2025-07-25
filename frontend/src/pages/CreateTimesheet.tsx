import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  DatePicker, 
  Button,
  Space,
  Spin,
  Alert
} from 'antd';
import { Clock, Calendar, FileText, Save, X } from 'lucide-react';
import { timesheetAPI, projectAPI } from '../services/api';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import useTimesheetTypes from '../hooks/useTimesheetTypes';

const { TextArea } = Input;

// Types
type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending';

interface Project {
  id: string;
  name: string;
  code: string;
  billable?: boolean;
}

interface TimesheetFormValues {
  date: Dayjs;
  project_id: string | null;
  work_type: string;
  sub_work_type: string;
  activity: string;
  hours_worked: number;
  description: string;
  status: TimesheetStatus;
}

const CreateTimesheet: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(true);

  // Use timesheet types hook
  const {
    workTypes,
    subWorkTypes,
    activities,
    loading: typesLoading,
    error: typesError,
    fetchSubWorkTypes,
    fetchActivities
  } = useTimesheetTypes();

  // Status options
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'pending', label: 'Pending' }
  ];

  useEffect(() => {
    // Load projects from API
    const fetchProjects = async () => {
      try {
        const response = await projectAPI.getProjects();
        if (response.success && response.data) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        showNotification({
          message: 'Failed to load projects',
          type: 'error'
        });
      }
    };
    fetchProjects();
  }, [showNotification]);

  // Handle work type change
  const handleWorkTypeChange = (workTypeId: string) => {
    form.setFieldsValue({
      sub_work_type: undefined,
      activity: undefined
    });
    fetchSubWorkTypes(workTypeId);
  };

  // Handle sub work type change
  const handleSubWorkTypeChange = (subWorkTypeId: string) => {
    form.setFieldsValue({
      activity: undefined
    });
    fetchActivities(subWorkTypeId);
  };

  const handleSubmit = async (values: TimesheetFormValues) => {
    setLoading(true);
    try {
      const timesheetData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        project_id: values.project_id || null
      };

      const response = await timesheetAPI.createTimesheet(timesheetData);
      if (response.success) {
        showNotification({
          message: 'Timesheet created successfully',
          type: 'success'
        });
        handleCancel();
      }
    } catch (error: any) {
      showNotification({
        message: 'Failed to create timesheet',
        description: error.response?.data?.message || 'An error occurred',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    navigate('/timesheets');
  };

  // Show error if types loading failed
  if (typesError) {
    return (
      <Modal
        title="Error"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Close
          </Button>
        ]}
      >
        <Alert
          message="Failed to load timesheet types"
          description={typesError.message}
          type="error"
          showIcon
        />
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" />
          <span>{t('timesheet.create_modal_title', 'Create New Timesheet')}</span>
        </div>
      }
      open={isModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('timesheet.modal.cancel', 'Cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => {
            form
              .validateFields()
              .then((values) => {
                handleSubmit(values);
              })
              .catch((info) => {
                console.log('Validate Failed:', info);
              });
          }}
        >
          {t('timesheet.modal.create', 'Create Timesheet')}
        </Button>
      ]}
      width={700}
    >
      <Spin spinning={typesLoading.workTypes}>
        <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
                  initialValues={{
            date: dayjs(),
            work_type: undefined,
            sub_work_type: undefined,
            activity: undefined,
            hours_worked: 0,
            status: 'draft'
          }}
      >
        <Form.Item
          name="date"
          label={t('timesheet.form.date_label', 'Date')}
          rules={[{ required: true, message: t('timesheet.form.date_required', 'Please select a date') }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="project_id"
          label={t('timesheet.form.project_label', 'Project')}
        >
          <Select placeholder={t('timesheet.form.select_project', 'Select a project (optional)')}>
            <Select.Option value={null}>{t('timesheet.form.no_project', 'No Project')}</Select.Option>
            {projects.map(project => (
              <Select.Option key={project.id} value={project.id}>
                {project.name} ({project.code})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

                  <Form.Item
            name="work_type"
            label={t('timesheet.form.work_type_label', 'Work Type')}
            rules={[{ required: true, message: t('timesheet.form.work_type_required', 'Please select work type') }]}
          >
            <Select 
              placeholder={t('timesheet.form.select_work_type', 'Select work type')}
              onChange={handleWorkTypeChange}
              loading={typesLoading.workTypes}
            >
              {workTypes.map(workType => (
                <Select.Option key={workType.id} value={workType.id}>
                  {workType.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

                  <Form.Item
            name="sub_work_type"
            label={t('timesheet.form.sub_work_type_label', 'Sub Work Type')}
            rules={[{ required: true, message: t('timesheet.form.sub_work_type_required', 'Please select sub work type') }]}
          >
            <Select 
              placeholder={t('timesheet.form.select_sub_work_type', 'Select sub work type')}
              onChange={handleSubWorkTypeChange}
              loading={typesLoading.subWorkTypes}
              disabled={!form.getFieldValue('work_type')}
            >
              {subWorkTypes.map(subWorkType => (
                <Select.Option key={subWorkType.id} value={subWorkType.id}>
                  {subWorkType.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="activity"
            label={t('timesheet.form.activity_label', 'Activity')}
            rules={[{ required: true, message: t('timesheet.form.activity_required', 'Please select activity') }]}
          >
            <Select 
              placeholder={t('timesheet.form.select_activity', 'Select activity')}
              loading={typesLoading.activities}
              disabled={!form.getFieldValue('sub_work_type')}
            >
              {activities.map(activity => (
                <Select.Option key={activity.id} value={activity.id}>
                  {activity.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

        <Form.Item
          name="hours_worked"
          label={t('timesheet.form.hours_worked_label', 'Hours Worked')}
          rules={[{ required: true, message: t('timesheet.form.hours_worked_required', 'Please enter hours worked') }]}
        >
          <InputNumber 
            min={0}
            max={24} 
            step={0.5} 
            style={{ width: '100%' }} 
            precision={1}
            placeholder={t('timesheet.form.hours_worked_placeholder', 'Enter hours worked')}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('timesheet.form.description_label', 'Description')}
          rules={[{ required: true, message: t('timesheet.form.description_required', 'Please enter description') }]}
        >
          <TextArea 
            rows={3} 
            placeholder={t('timesheet.form.description_placeholder', 'Enter detailed description of work done')} 
          />
        </Form.Item>

        <Form.Item 
          name="status" 
          label={t('timesheet.form.status_label', 'Status')}
        >
          <Select>
            {statusOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTimesheet; 