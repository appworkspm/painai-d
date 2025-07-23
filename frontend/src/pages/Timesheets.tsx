import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, 
  Modal, 
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Space,
  Tag,
  Button
} from 'antd';
import type { 
  TablePaginationConfig, 
  ColumnsType
} from 'antd/es/table';
import type { SorterResult } from 'antd/lib/table/interface';
import type { FilterValue } from 'antd/es/table/interface';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

// Types
type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending';
type WorkType = 'development' | 'design' | 'meeting' | 'research' | 'documentation' | 'testing' | 'deployment' | 'other';

interface Project {
  id: string;
  name: string;
  code: string;
  billable?: boolean;
}

interface Timesheet extends BaseTimesheet {
  id: string;
  date: string;
  project_id: string | null;
  work_type: WorkType;
  sub_work_type?: string;
  activity: string;
  hours_worked: number;
  description: string;
  status: TimesheetStatus;
  created_at: string;
  updated_at: string;
  project?: Pick<Project, 'id' | 'name' | 'code'>;
}

interface BaseTimesheet {
  date: string;
  project_id: string | null;
  work_type: WorkType;
  sub_work_type?: string;
  activity: string;
  hours_worked: number;
  description: string;
  status: TimesheetStatus;
}

interface TimesheetTableData extends Omit<Timesheet, 'date'> {
  key: string;
  project_name: string;
  project_code: string;
  date: Dayjs;
}

interface TimesheetsState {
  // Data
  timesheets: TimesheetTableData[];
  projects: Project[];
  
  // UI State
  loading: boolean;
  submitting: boolean;
  deletingId: string | null;
  isModalVisible: boolean;
  editingTimesheet: TimesheetTableData | null;
  
  // Stats
  stats: {
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    totalEarnings: number;
    projects: Array<{ id: string; name: string; hours: number }>;
    thisWeekHours?: number;
    pending?: number;
    approved?: number;
  };
  
  // Filters
  filters: {
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
    projectId?: string;
    workType?: string;
    billable?: boolean;
    status?: string;
    search?: string;
  };
  
  // Pagination
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  
  // Sorting
  sorter?: SorterResult<TimesheetTableData>;
}


// Main Timesheets component
const Timesheets: React.FC = () => {
  const { t } = useTranslation();
  // Create a form type that matches our form values (with Dayjs for dates)
  type TimesheetFormValues = Omit<Timesheet, 'date' | 'created_at' | 'updated_at'> & {
    date: Dayjs;
  };
  
  const [form] = Form.useForm<TimesheetFormValues>();
  const [state, setState] = useState<TimesheetsState>({
    timesheets: [],
    projects: [],
    loading: true,
    submitting: false,
    deletingId: null,
    isModalVisible: false,
    editingTimesheet: null,
    stats: {
      totalHours: 0,
      billableHours: 0,
      nonBillableHours: 0,
      totalEarnings: 0,
      projects: [],
      thisWeekHours: 0,
      pending: 0,
      approved: 0,
    },
    filters: {},
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
  });

  // Destructure state with proper typing
  const {
    timesheets,
    loading,
    isModalVisible,
    editingTimesheet,
    filters,
    pagination,
  } = state;

  // Mock API service with access to translation
  const timesheetAPI = useMemo(() => ({
    create: async (data: Omit<Timesheet, 'id' | 'created_at' | 'updated_at' | 'project'>): Promise<{ data: Timesheet }> => {
      console.log('Creating timesheet:', data);
      const project = data.project_id ? {
        id: data.project_id,
        name: `${t('timesheet.mock.project_prefix')} ${data.project_id}`,
        code: `PJ-${data.project_id}`
      } : undefined;
      
      const newTimesheet: Timesheet = {
        ...data,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project
      };
      
      return { data: newTimesheet };
    },
    update: async (id: string, data: Partial<Omit<Timesheet, 'id' | 'created_at' | 'updated_at' | 'project'>>): Promise<{ data: Timesheet }> => {
      console.log(`Updating timesheet ${id}:`, data);
      const project = data.project_id ? {
        id: data.project_id,
        name: `${t('timesheet.mock.project_prefix')} ${data.project_id}`,
        code: `PJ-${data.project_id}`
      } : undefined;
      
      return { 
        data: { 
          ...data,
          id,
          project,
          updated_at: new Date().toISOString()
        } as Timesheet
      };
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      console.log(`Deleting timesheet ${id}`);
      return { success: true };
    },
    getStats: async (): Promise<{ data: TimesheetsState['stats'] }> => ({
      data: {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        totalEarnings: 0,
        thisWeekHours: 0,
        pending: 0,
        approved: 0,
        projects: []
      }
    }),
    getProjects: async (): Promise<{ data: Project[] }> => ({
      data: [
        { 
          id: '1', 
          name: `${t('timesheet.mock.project_prefix')} A`, 
          code: 'PJ-A',
          billable: true
        },
        { 
          id: '2', 
          name: `${t('timesheet.mock.project_prefix')} B`, 
          code: 'PJ-B',
          billable: false
        },
      ]
    }),
    getTimesheets: async (): Promise<{ data: Timesheet[]; total: number }> => ({
      data: [],
      total: 0
    })
  }), [t]);

  // Fetch timesheets data
  const fetchTimesheets = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await timesheetAPI.getTimesheets();
      setState(prev => ({
        ...prev,
        timesheets: response.data.map((item: Timesheet) => ({
          ...item,
          key: item.id,
          date: dayjs(item.date),
          project_name: item.project?.name || 'N/A',
          project_code: item.project?.code || 'N/A',
        })),
        pagination: {
          ...prev.pagination,
          total: response.total || 0
        },
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [timesheetAPI]);

  // Fetch projects data
  const fetchProjects = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await timesheetAPI.getProjects();
      setState(prev => ({
        ...prev,
        projects: response.data || [],
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [timesheetAPI]);

  // Initial data fetch
  useEffect(() => {
    fetchTimesheets();
    fetchProjects();
  }, [fetchTimesheets, fetchProjects]);

  // Fetch timesheets when filters or pagination change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const response = await timesheetAPI.getTimesheets();
        setState(prev => ({
          ...prev,
          timesheets: response.data.map((item: Timesheet) => ({
            ...item,
            key: item.id,
            date: dayjs(item.date),
            project_name: item.project?.name || 'N/A',
            project_code: item.project?.code || 'N/A',
          })),
          pagination: {
            ...prev.pagination,
            total: response.total || 0
          },
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching timesheets:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [filters, pagination, timesheetAPI]);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await timesheetAPI.getProjects();
        setState(prev => ({
          ...prev,
          projects: response.data,
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [timesheetAPI]);

  // Handle table changes (pagination, sorting, etc.)
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<TimesheetTableData> | SorterResult<TimesheetTableData>[],
  ) => {
    // Convert sorter to any to avoid TypeScript errors with the sorter type
    const tableSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: pagination.current || 1,
        pageSize: pagination.pageSize || 10,
      },
      filters: {
        ...prev.filters,
        ...filters,
      },
      sorter: tableSorter as any, // Type assertion to avoid type complexity
    }));
  };

  // Handle form submission
  const handleSubmit = async (values: TimesheetFormValues) => {
    try {
      setState(prev => ({ ...prev, submitting: true }));
      
      // Convert form values to Timesheet format for the API
      const timesheetData: Omit<Timesheet, 'id' | 'created_at' | 'updated_at' | 'project'> = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        project_id: values.project_id || null,
      };
      
      if (state.editingTimesheet) {
        await timesheetAPI.update(state.editingTimesheet.id, timesheetData);
      } else {
        await timesheetAPI.create(timesheetData);
      }
      
      await fetchTimesheets();
      setState(prev => ({
        ...prev,
        isModalVisible: false,
        editingTimesheet: null,
        submitting: false
      }));
      
      form.resetFields();
    } catch (error) {
      console.error('Error saving timesheet:', error);
      setState(prev => ({ ...prev, submitting: false }));
    }
  };

  // Handle edit action
  const handleEdit = useCallback((record: TimesheetTableData) => {
    // Set form values directly from TimesheetTableData
    form.setFieldsValue({
      ...record,
      date: record.date, // Keep as Dayjs for the form
      project_id: record.project_id || undefined, // Use undefined for form fields
    });
    
    setState(prev => ({
      ...prev,
      isModalVisible: true,
      editingTimesheet: record
    }));
  }, [form]);

  // Handle delete confirmation
  const handleDelete = useCallback((id: string) => {
    Modal.confirm({
      title: t('timesheet.delete_modal.title'),
      content: t('timesheet.delete_modal.content'),
      okText: t('timesheet.delete_modal.ok_text'),
      okType: 'danger',
      cancelText: t('timesheet.modal.cancel'),
      onOk: async () => {
        try {
          setState(prev => ({ ...prev, deletingId: id }));
          await timesheetAPI.delete(id);
          await fetchTimesheets();
        } catch (error) {
          console.error('Error deleting timesheet:', error);
        } finally {
          setState(prev => ({ ...prev, deletingId: null }));
        }
      },
      onCancel: () => {
        setState(prev => ({ ...prev, deletingId: null }));
      },
    });
  }, [fetchTimesheets]);

  // Table columns with proper typing
  const columns: ColumnsType<TimesheetTableData> = [
    {
      title: t('timesheet.table.date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: Dayjs) => date?.isValid() ? date.format('YYYY-MM-DD') : t('timesheet.table.na'),
      sorter: (a, b) => (a.date?.isValid() ? a.date.unix() : 0) - (b.date?.isValid() ? b.date.unix() : 0),
      width: 120,
    },
    {
      title: t('timesheet.table.project'),
      dataIndex: 'project_name',
      key: 'project',
      render: (text: string, record: TimesheetTableData) => (
        <div>
          <div>{text || t('timesheet.table.na')}</div>
          {record.project_code && (
            <div className="text-xs text-gray-500">{record.project_code}</div>
          )}
        </div>
      ),
    },
    {
      title: t('timesheet.table.hours'),
      dataIndex: 'hours_worked',
      key: 'hours',
      align: 'right' as const,
      render: (hours: number) => (hours || 0).toFixed(2),
      sorter: (a, b) => (a.hours_worked || 0) - (b.hours_worked || 0),
      width: 100,
    },
    {
      title: t('timesheet.table.work_type'),
      dataIndex: 'work_type',
      key: 'work_type',
      render: (text: string) => t(`timesheet.work_type.${text}`) || t('timesheet.table.na'),
      filters: [
        { text: t('timesheet.work_type.development'), value: 'development' },
        { text: t('timesheet.work_type.design'), value: 'design' },
        { text: t('timesheet.work_type.meeting'), value: 'meeting' },
        { text: t('timesheet.work_type.research'), value: 'research' },
        { text: t('timesheet.work_type.documentation'), value: 'documentation' },
        { text: t('timesheet.work_type.testing'), value: 'testing' },
        { text: t('timesheet.work_type.deployment'), value: 'deployment' },
        { text: t('timesheet.work_type.other'), value: 'other' }
      ],
      onFilter: (value, record) => record.work_type === value,
    },
    {
      title: t('timesheet.table.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || t('timesheet.table.na'),
    },
    {
      title: t('timesheet.table.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: TimesheetStatus) => {
        const statusMap: Record<TimesheetStatus, { color: string; text: string }> = {
          draft: { color: 'default', text: t('timesheet.status.draft') },
          submitted: { color: 'processing', text: t('timesheet.status.submitted') },
          approved: { color: 'success', text: t('timesheet.status.approved') },
          rejected: { color: 'error', text: t('timesheet.status.rejected') },
          pending: { color: 'warning', text: t('timesheet.status.pending') },
        };
        const statusInfo = statusMap[status] || { color: 'default', text: String(status) };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      filters: [
        { text: t('timesheet.status.draft'), value: 'draft' },
        { text: t('timesheet.status.submitted'), value: 'submitted' },
        { text: t('timesheet.status.approved'), value: 'approved' },
        { text: t('timesheet.status.rejected'), value: 'rejected' },
        { text: t('timesheet.status.pending'), value: 'pending' }
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('timesheet.table.actions'),
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_, record: TimesheetTableData) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={state.deletingId === record.id}
            aria-label={t('timesheet.action.edit')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            loading={state.deletingId === record.id}
            aria-label={t('timesheet.action.delete')}
          />
        </Space>
      ),
    },
  ];

  // Work type options for the form
  const workTypeOptions = [
    { label: t('timesheet.work_type.development'), value: 'development' },
    { label: t('timesheet.work_type.design'), value: 'design' },
    { label: t('timesheet.work_type.meeting'), value: 'meeting' },
    { label: t('timesheet.work_type.research'), value: 'research' },
    { label: t('timesheet.work_type.documentation'), value: 'documentation' },
    { label: t('timesheet.work_type.testing'), value: 'testing' },
    { label: t('timesheet.work_type.deployment'), value: 'deployment' },
    { label: t('timesheet.work_type.other'), value: 'other' }
  ];

  // Status options for the form
  const statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Pending', value: 'pending' }
  ] as const;

  // Render the modal form
  const renderTimesheetModal = () => (
    <Modal
      title={editingTimesheet ? t('timesheet.edit_modal_title') : t('timesheet.add_modal_title')}
      open={isModalVisible}
      onCancel={() => setState(prev => ({ ...prev, isModalVisible: false }))}
      footer={[
        <Button key="cancel" onClick={() => setState(prev => ({ ...prev, isModalVisible: false }))}>
          {t('timesheet.modal.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
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
          {editingTimesheet ? t('timesheet.modal.update') : t('timesheet.modal.create')}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: dayjs(),
          work_type: 'development',
          hours_worked: 0,
          status: 'draft'
        }}
      >
        <Form.Item
          name="date"
          label={t('timesheet.form.date_label')}
          rules={[{ required: true, message: t('timesheet.form.date_required') }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="work_type"
          label={t('timesheet.form.work_type_label')}
          rules={[{ required: true, message: t('timesheet.form.work_type_required') }]}
        >
          <Select placeholder={t('timesheet.form.select_work_type')}>
            {workTypeOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="hours_worked"
          label={t('timesheet.form.hours_worked_label')}
          rules={[{ required: true, message: t('timesheet.form.hours_worked_required') }]}
        >
          <InputNumber 
            min={0}
            max={24} 
            step={0.5} 
            style={{ width: '100%' }} 
            precision={1}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('timesheet.form.description_label')}
          rules={[{ required: true, message: t('timesheet.form.description_required') }]}
        >
          <Input.TextArea rows={3} placeholder={t('timesheet.form.description_placeholder')} />
        </Form.Item>

        <Form.Item name="status" label={t('timesheet.form.status_label')}>
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

  // Render the component
  return (
    <div className="timesheets-container">
      {/* Main content goes here */}
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>Timesheets</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setState(prev => ({
                ...prev,
                isModalVisible: true,
                editingTimesheet: null
              }));
            }}
          >
            Add Timesheet
          </Button>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Hours"
                value={state.stats.totalHours || 0}
                precision={2}
                suffix="hrs"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Billable Hours"
                value={state.stats.billableHours || 0}
                precision={2}
                suffix="hrs"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Non-Billable Hours"
                value={state.stats.nonBillableHours || 0}
                precision={2}
                suffix="hrs"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Earnings"
                value={state.stats.totalEarnings || 0}
                precision={2}
                prefix="$"
              />
            </Card>
          </Col>
        </Row>

        {/* Timesheets Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={timesheets}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </div>

      {/* Timesheet Modal */}
      {renderTimesheetModal()}
    </div>
  );
};

export default Timesheets;