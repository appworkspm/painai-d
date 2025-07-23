import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FolderOpen, Users, Calendar, Clock, CheckCircle, AlertCircle, BarChart3, Edit, Plus, Circle, X, Save, Trash2, Search, Filter, Download, LineChart } from 'lucide-react';
import { LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { projectAPI, projectTeamAPI, projectTaskAPI, projectTimelineAPI, adminAPI } from '../services/api';
import { Card, Row, Col, Statistic, Table, Tag, Space, Button, Input, Select, DatePicker, message, Spin, Empty, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';

const { Search: AntSearch } = Input;

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sCurveData, setSCurveData] = useState<any>(null);
  const [loadingSCurve, setLoadingSCurve] = useState(false);
  // --- S Curve ---
  const loadSCurve = async () => {
    if (!id) return;
    setLoadingSCurve(true);
    try {
      const res = await projectAPI.getProjectSCurve(id);
      if (res && res.success) {
        setSCurveData(res.data);
      } else {
        setSCurveData(null);
      }
    } catch (e) {
      setSCurveData(null);
    } finally {
      setLoadingSCurve(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'scurve') {
      loadSCurve();
    }
    // eslint-disable-next-line
  }, [activeTab, id]);

  const renderSCurve = () => {
    // เตรียมข้อมูลสำหรับกราฟ S Curve
    let chartData: any[] = [];
    if (sCurveData) {
      const progressArr = sCurveData.progress || [];
      const costArr = sCurveData.cost || [];
      const planArr = sCurveData.plannedProgress || [];
      // รวมวันที่ทั้งหมด
      const dateSet = new Set([
        ...progressArr.map((p: any) => p.reportedAt.slice(0, 10)),
        ...costArr.map((c: any) => c.date.slice(0, 10)),
        ...planArr.map((p: any) => p.date.slice(0, 10))
      ]);
      const dates = Array.from(dateSet).sort();
      let lastProgress = 0, lastCost = 0, lastPlan = 0;
      chartData = dates.map((date: string) => {
        const progress = progressArr.find((p: any) => p.reportedAt.slice(0, 10) === date);
        const cost = costArr.find((c: any) => c.date.slice(0, 10) === date);
        const plan = planArr.find((p: any) => p.date.slice(0, 10) === date);
        const data = {
          date,
          progress: progress ? progress.progress : lastProgress,
          cumulativeCost: cost ? cost.cumulative : lastCost,
          plan: plan ? plan.progress : lastPlan
        };
        if (progress) lastProgress = progress.progress;
        if (cost) lastCost = cost.cumulative;
        if (plan) lastPlan = plan.progress;
        return data;
      });
    }
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2"><LineChart className="h-5 w-5" /> S Curve</h3>
        {loadingSCurve ? (
          <Spin />
        ) : !sCurveData || chartData.length === 0 ? (
          <Empty description="ไม่มีข้อมูล S Curve" />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <RLineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={d => dayjs(d).format('DD/MM/YY')} />
              <YAxis yAxisId="left" label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Cumulative Cost', angle: 90, position: 'insideRight' }} />
              <Tooltip formatter={(value, name) => name === 'progress' ? `${value}%` : value} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="plan" name="Plan (%)" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="progress" name="Actual (%)" stroke="#3b82f6" strokeWidth={2} dot />
              <Line yAxisId="right" type="monotone" dataKey="cumulativeCost" name="Cumulative Cost" stroke="#f59e42" strokeWidth={2} dot />
            </RLineChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };
  const [team, setTeam] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberUserId, setAddMemberUserId] = useState('');
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    priority: 1
  });
  const [submitting, setSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Export functionality
  const exportProjectsToCSV = () => {
    try {
      // Build filter info first
      const filterInfo = [];
      if (search) filterInfo.push(`ค้นหา: "${search}"`);
      if (statusFilter !== 'all') {
        const statusText = statusFilter === 'ACTIVE' ? 'กำลังดำเนินการ' :
                          statusFilter === 'COMPLETED' ? 'เสร็จสิ้น' :
                          statusFilter === 'ON_HOLD' ? 'ระงับ' :
                          statusFilter === 'CANCELLED' ? 'ยกเลิก' : statusFilter;
        filterInfo.push(`สถานะ: ${statusText}`);
      }

      const headers = [
        'ชื่อโครงการ',
        'คำอธิบาย', 
        'ผู้จัดการ',
        'สถานะ',
        'วันที่เริ่มต้น',
        'วันที่สิ้นสุด',
        'งบประมาณ',
        'วันที่สร้าง'
      ];
      const csvData = allProjects.map((project: any) => [
        project.name,
        project.description,
        project.managerName,
        project.status === 'ACTIVE' ? 'กำลังดำเนินการ' :
        project.status === 'COMPLETED' ? 'เสร็จสิ้น' :
        project.status === 'ON_HOLD' ? 'ระงับ' :
        project.status === 'CANCELLED' ? 'ยกเลิก' : project.status || '',
        project.startDate ? dayjs(project.startDate).format('DD/MM/YYYY') : '',
        project.endDate ? dayjs(project.endDate).format('DD/MM/YYYY') : '',
        project.budget ? Number(project.budget).toLocaleString() : '',
        project.createdAt ? dayjs(project.createdAt).format('DD/MM/YYYY') : ''
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const filterSuffix = filterInfo.length > 0 ? `_${filterInfo.join('_').replace(/[^a-zA-Z0-9]/g, '')}` : '';
      link.setAttribute('download', `รายการโครงการ${filterSuffix}_${dayjs().format('YYYY-MM-DD_HH-mm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      const filterMessage = filterInfo.length > 0 ? ` (${filterInfo.join(', ')})` : '';
      
      showNotification({ 
        message: `ส่งออกรายการโครงการสำเร็จ${filterMessage} - ${filteredProjects.length} รายการ`, 
        type: 'success' 
      });
    } catch (error) {
      showNotification({ 
        message: 'เกิดข้อผิดพลาดในการส่งออกรายการ', 
        type: 'error' 
      });
    }
  };

  useEffect(() => {
    if (!id) {
      // Load all projects for /projects/details
      loadAllProjects();
    } else {
      loadAll();
    }
    // eslint-disable-next-line
  }, [id]);

  const loadAllProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectAPI.getProjects();
      if (res.success && res.data) {
        setAllProjects(res.data);
      } else {
        setError('ไม่สามารถโหลดข้อมูลโครงการได้');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load project data first
      const projRes = await projectAPI.getProject(id!);
      if (projRes.success) {
        setProject(projRes.data);
        setTasks(projRes.data.projectTasks?.filter((t: any) => !t.isDeleted) || []);
      } else {
        throw new Error(projRes.message || 'ไม่สามารถโหลดข้อมูลโครงการได้');
      }

      // Load additional data in parallel
      const [teamRes, timelineRes, usersRes] = await Promise.allSettled([
        projectTeamAPI.getTeam(id!),
        projectTimelineAPI.getTimeline(id!),
        adminAPI.getUsers()
      ]);

      // Handle team data
      if (teamRes.status === 'fulfilled' && teamRes.value.success) {
        setTeam(teamRes.value.data);
      }

      // Handle timeline data
      if (timelineRes.status === 'fulfilled' && timelineRes.value.success) {
        setTimeline(timelineRes.value.data);
      }

      // Handle users data
      if (usersRes.status === 'fulfilled' && usersRes.value.success) {
        setAllUsers(usersRes.value.data);
      }

    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      showNotification({ message: 'Failed to load project data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- Team Management ---
  const managerId = project?.managerId;
  const handleAddMember = () => {
    setAddMemberUserId('');
    setShowAddMemberModal(true);
  };
  const handleConfirmAddMember = async () => {
    if (!addMemberUserId) return;
    setSubmitting(true);
    try {
      await projectTeamAPI.addMember(id!, addMemberUserId);
      showNotification({ message: 'Member added', type: 'success' });
      setShowAddMemberModal(false);
      loadAll();
    } catch (e: any) {
      showNotification({ message: e.response?.data?.message || 'Failed to add member', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  const handleRemoveMember = async (userId: string) => {
    if (userId === managerId) return;
    setSubmitting(true);
    try {
      await projectTeamAPI.removeMember(id!, userId);
      showNotification({ message: 'Member removed', type: 'success' });
      loadAll();
    } catch (e: any) {
      showNotification({ message: e.response?.data?.message || 'Failed to remove member', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Task Management ---
  const handleAddTask = () => {
    setTaskForm({ name: '', description: '', assigneeId: '', dueDate: '', priority: 1 });
    setEditingTask(null);
    setShowEditTaskModal(true);
  };
  const handleEditTask = (task: any) => {
    setTaskForm({
      name: task.name,
      description: task.description,
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority || 1
    });
    setEditingTask(task);
    setShowEditTaskModal(true);
  };
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTask) {
        await projectTaskAPI.updateTask(id!, editingTask.id, taskForm);
        showNotification({ message: 'Task updated', type: 'success' });
      } else {
        await projectTaskAPI.addTask(id!, taskForm);
        showNotification({ message: 'Task added', type: 'success' });
      }
      setShowEditTaskModal(false);
      loadAll();
    } catch (e: any) {
      showNotification({ message: e.response?.data?.message || 'Failed to save task', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteTask = async (taskId: string) => {
    setSubmitting(true);
    try {
      await projectTaskAPI.deleteTask(id!, taskId);
      showNotification({ message: 'Task deleted', type: 'success' });
      loadAll();
    } catch (e: any) {
      showNotification({ message: e.response?.data?.message || 'Failed to delete task', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Progress Calculation ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // --- Filter Projects ---
  const filteredProjects = allProjects.filter(project => {
    // Status filter
    if (statusFilter !== 'all' && project.status !== statusFilter) {
      return false;
    }
    // Search filter
    return project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description?.toLowerCase().includes(search.toLowerCase()) ||
      project.manager?.name?.toLowerCase().includes(search.toLowerCase());
  });

  // --- Helper Functions ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'PENDING': return <Circle className="h-5 w-5 text-gray-400" />;
      default: return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  // --- UI Render Functions ---
  const renderTeam = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{t('project_details.team_title')}</h3>
        <Button 
          type="primary" 
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAddMember}
        >
          {t('project_details.add_member')}
        </Button>
      </div>
      
      <Table
        dataSource={team}
        rowKey={(record) => record.user.id}
        columns={[
          {
            title: 'สมาชิก',
            dataIndex: 'user',
            key: 'user',
            render: (user: any) => (
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </div>
              </div>
            )
          },
          {
            title: 'ตำแหน่ง',
            dataIndex: ['user', 'position'],
            key: 'position',
            render: (position: string) => position || '-'
          },
          {
            title: 'อีเมล',
            dataIndex: ['user', 'email'],
            key: 'email'
          },
          {
            title: 'การดำเนินการ',
            key: 'actions',
            render: (record: any) => (
              <Space>
                {record.user.id !== managerId && (
                  <Button 
                    type="text" 
                    danger 
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => handleRemoveMember(record.user.id)}
                  >
                    ลบ
                  </Button>
                )}
                {record.user.id === managerId && (
                  <Tag color="blue">{t('project_details.manager_tag')}</Tag>
                )}
              </Space>
            )
          }
        ]}
      />
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{t('project_details.tasks_title')}</h3>
        <Button 
          type="primary" 
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAddTask}
        >
          {t('project_details.add_task')}
        </Button>
      </div>
      
      <Table
        dataSource={tasks}
        rowKey="id"
        columns={[
          {
            title: 'งาน',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: any) => (
              <div className="flex items-center">
                {getTaskStatusIcon(record.status)}
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{name}</div>
                  <div className="text-sm text-gray-500">{record.description}</div>
                </div>
              </div>
            )
          },
          {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
              const statusConfig = {
                COMPLETED: { color: 'success', text: t('project_details.status.completed') },
                IN_PROGRESS: { color: 'processing', text: t('project_details.status.in_progress') },
                PENDING: { color: 'default', text: t('project_details.status.pending') }
              };
              const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
              return <Tag color={config.color}>{config.text}</Tag>;
            }
          },
          {
            title: 'ผู้รับผิดชอบ',
            dataIndex: 'assigneeId',
            key: 'assigneeId',
            render: (assigneeId: string) => {
              const member = team.find(m => m.user.id === assigneeId);
              return member?.user.name || '-';
            }
          },
          {
            title: 'กำหนดส่ง',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (dueDate: string) => dueDate ? dayjs(dueDate).format('DD/MM/YYYY') : '-'
          },
          {
            title: 'การดำเนินการ',
            key: 'actions',
            render: (record: any) => (
              <Space>
                <Button 
                  type="text" 
                  icon={<Edit className="h-4 w-4" />}
                  onClick={() => handleEditTask(record)}
                >
                  {t('project_details.edit_task')}
                </Button>
                <Button 
                  type="text" 
                  danger 
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => handleDeleteTask(record.id)}
                >
                  {t('project_details.delete_task')}
                </Button>
              </Space>
            )
          }
        ]}
      />
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">{t('project_details.timeline_title')}</h3>
      
      {timeline.length === 0 ? (
        <Empty description={t('project_details.no_timeline_activity')} />
      ) : (
        <div className="space-y-4">
          {timeline.map((item: any) => (
            <div key={item.id} className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {item.action === 'task_created' ? (
                  <Plus className="h-4 w-4 text-blue-600" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                <p className="text-xs text-gray-500">
                  โดย {item.user?.name || '-'} • {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{t('project_details.project_info_title')}</h3>
        </div>
        <div className="p-6">
          <Row gutter={24}>
            {/* Basic Information */}
            <Col span={12}>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('project_details.project_name_label')}</h4>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{project?.name || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('project_details.project_description_label')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{project?.description || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('project_details.project_status_label')}</h4>
                  <Tag color={project?.status === 'ACTIVE' ? 'success' : project?.status === 'COMPLETED' ? 'default' : 'warning'}>
                    {project?.status === 'ACTIVE' ? t('project_details.status.active') : 
                     project?.status === 'COMPLETED' ? t('project_details.status.completed') : 
                     project?.status === 'ON_HOLD' ? t('project_details.status.on_hold') : project?.status}
                  </Tag>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('project_details.project_manager_label')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{project?.manager?.name || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('project_details.project_job_code_label')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{project?.jobCode || '-'}</p>
                </div>
              </div>
            </Col>
            
            {/* Customer & Financial Information */}
            <Col span={12}>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('project_details.customer_name_label')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{project?.customerName || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('project_details.payment_terms_label')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{project?.paymentTerm || '-'}</p>
                  {project?.paymentCondition && (
                    <p className="mt-1 text-xs text-gray-500">{project.paymentCondition}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('project_details.budget_label')}</h4>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    {project?.budget ? `฿${Number(project.budget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('project_details.start_date_label')}</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {project?.startDate ? dayjs(project.startDate).format('DD/MM/YYYY') : '-'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('project_details.end_date_label')}</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {project?.endDate ? dayjs(project.endDate).format('DD/MM/YYYY') : '-'}
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Project Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('project_details.pending_tasks_title')}
              value={totalTasks - completedTasks}
              valueStyle={{ color: '#faad14' }}
              prefix={<Clock className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('project_details.completion_rate_title')}
              value={totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircle className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('project_details.recent_activity_title')}
              value={timeline.length}
              prefix={<Calendar className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('project_details.created_at_title')}
              value={project?.createdAt ? dayjs(project.createdAt).format('DD/MM/YYYY') : '-'}
              prefix={<FolderOpen className="h-4 w-4" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Bar */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('project_details.project_progress_title')}</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{t('project_details.overall_progress_label')}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Timeline Summary */}
      {timeline.length > 0 && (
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('project_details.recent_activities_title')}</h3>
          <div className="space-y-3">
            {timeline.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  {item.action === 'task_created' ? (
                    <Plus className="h-3 w-3 text-blue-600" />
                  ) : (
                    <Trash2 className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    โดย {item.user?.name || '-'} • {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {timeline.length > 5 && (
              <div className="text-center pt-2">
                <Button type="link" onClick={() => setActiveTab('timeline')}>
                  {t('project_details.view_all_activities', { count: timeline.length })}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  const renderProjectList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('project_details.project_list_title')}</h1>
            <p className="text-sm text-gray-600">{t('project_details.project_list_description')}</p>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<Download className="h-4 w-4" />}
          onClick={exportProjectsToCSV}
        >
          {t('project_details.export_projects')}
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <Row gutter={16}>
          <Col span={8}>
            <AntSearch
              placeholder={t('project_details.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search className="h-4 w-4 text-gray-400" />}
              size="large"
            />
          </Col>
          <Col span={8}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              size="large"
              style={{ width: '100%' }}
              placeholder={t('project_details.select_status')}
            >
              <Select.Option value="all">{t('project_details.all_status')}</Select.Option>
              <Select.Option value="ACTIVE">{t('project_details.active_status')}</Select.Option>
              <Select.Option value="ON_HOLD">{t('project_details.on_hold_status')}</Select.Option>
              <Select.Option value="COMPLETED">{t('project_details.completed_status')}</Select.Option>
              <Select.Option value="CANCELLED">{t('project_details.cancelled_status')}</Select.Option>
              <Select.Option value="ESCALATED_TO_SUPPORT">{t('project_details.escalated_to_support_status')}</Select.Option>
              <Select.Option value="SIGNED_CONTRACT">{t('project_details.signed_contract_status')}</Select.Option>
            </Select>
          </Col>
          <Col span={8}>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{t('project_details.found_projects', { count: filteredProjects.length })}</span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Project Statistics */}
      <Row gutter={16}>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('project_details.total_projects_title')}
              value={filteredProjects.length}
              prefix={<FolderOpen className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('project_details.active_projects_title')}
              value={filteredProjects.filter(p => p.status === 'ACTIVE').length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircle className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('project_details.on_hold_projects_title')}
              value={filteredProjects.filter(p => p.status === 'ON_HOLD').length}
              valueStyle={{ color: '#faad14' }}
              prefix={<AlertCircle className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('project_details.completed_projects_title')}
              value={filteredProjects.filter(p => p.status === 'COMPLETED').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChart3 className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('project_details.escalated_to_support_projects_title')}
              value={filteredProjects.filter(p => p.status === 'ESCALATED_TO_SUPPORT').length}
              valueStyle={{ color: '#722ed1' }}
              prefix={<AlertCircle className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('project_details.signed_contract_projects_title')}
              value={filteredProjects.filter(p => p.status === 'SIGNED_CONTRACT').length}
              valueStyle={{ color: '#b37feb' }}
              prefix={<CheckCircle className="h-4 w-4" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Project Table */}
      <Card 
        title={
          <div className="flex items-center justify-between">
            <span>{t('project_details.project_table_title')}</span>
            <Button 
              type="default" 
              icon={<Download className="h-4 w-4" />}
              onClick={exportProjectsToCSV}
              size="small"
            >
              {t('project_details.export_csv')}
            </Button>
          </div>
        }
      >
        <Table
          dataSource={filteredProjects}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} ${t('project_details.from_total_projects', { total })}`
          }}
          columns={[
            {
              title: t('project_details.project_name_column'),
              dataIndex: 'name',
              key: 'name',
              render: (name: string, record: any) => (
                <div>
                  <div className="font-medium text-gray-900">{name}</div>
                  <div className="text-sm text-gray-500">{record.description}</div>
                </div>
              )
            },
            {
              title: t('project_details.project_manager_column'),
              dataIndex: 'manager',
              key: 'manager',
              render: (manager: any) => manager?.name || '-'
            },
            {
              title: t('project_details.project_status_column'),
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => {
                const statusConfig = {
                  ACTIVE: { color: 'success', text: t('project_details.status.active') },
                  ON_HOLD: { color: 'warning', text: t('project_details.status.on_hold') },
                  COMPLETED: { color: 'default', text: t('project_details.status.completed') },
                  CANCELLED: { color: 'error', text: t('project_details.status.cancelled') },
                  ESCALATED_TO_SUPPORT: { color: 'processing', text: t('project_details.status.escalated_to_support') },
                  SIGNED_CONTRACT: { color: 'purple', text: t('project_details.status.signed_contract') }
                };
                const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
                return <Tag color={config.color}>{config.text}</Tag>;
              }
            },
            {
              title: t('project_details.created_at_column'),
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (date: string) => dayjs(date).format('DD/MM/YYYY')
            },
            {
              title: t('project_details.actions_column'),
              key: 'actions',
              render: (record: any) => (
                <Space>
                  <Button 
                    type="link" 
                    onClick={() => window.location.href = `/projects/${record.id}/details`}
                  >
                    {t('project_details.view_details')}
                  </Button>
                </Space>
              )
            }
          ]}
        />
      </Card>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-6 space-y-6">
          <Skeleton active paragraph={{ rows: 4 }} />
          <Skeleton active paragraph={{ rows: 6 }} />
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <Empty
            description={error}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => id ? loadAll() : loadAllProjects()}>
              {t('project_details.try_again')}
            </Button>
          </Empty>
        </div>
      );
    }

    if (!id) {
      return renderProjectList();
    }

    if (!project) {
      return (
        <div className="p-6">
          <Empty description={t('project_details.project_not_found')} />
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        {/* Project Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
          </div>
        </div>

        {/* Project Statistics */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('project_details.project_progress_rate_title')}
                value={progress}
                suffix="%"
                prefix={<BarChart3 className="h-4 w-4" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('project_details.total_tasks_title')}
                value={totalTasks}
                prefix={<CheckCircle className="h-4 w-4" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('project_details.completed_tasks_title')}
                value={completedTasks}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircle className="h-4 w-4" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('project_details.team_members_title')}
                value={team.length}
                prefix={<Users className="h-4 w-4" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Additional Project Info */}
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title={t('project_details.project_duration_title')}
                value={project?.startDate && project?.endDate ? 
                  Math.ceil(dayjs(project.endDate).diff(dayjs(project.startDate), 'day', true)) : 0}
                suffix={t('project_details.days')}
                prefix={<Calendar className="h-4 w-4" />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title={t('project_details.budget_utilised_title')}
                value={project?.budget ? Number(project.budget).toLocaleString() : 0}
                suffix={t('project_details.baht')}
                prefix={<BarChart3 className="h-4 w-4" />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title={t('project_details.project_status_description')}
                value={project?.status === 'ACTIVE' ? t('project_details.status.active') : 
                       project?.status === 'COMPLETED' ? t('project_details.status.completed') : 
                       project?.status === 'ON_HOLD' ? t('project_details.status.on_hold') : t('project_details.status.not_specified')}
                valueStyle={{ 
                  color: project?.status === 'ACTIVE' ? '#3f8600' : 
                         project?.status === 'COMPLETED' ? '#1890ff' : 
                         project?.status === 'ON_HOLD' ? '#faad14' : '#8c8c8c'
                }}
                prefix={<AlertCircle className="h-4 w-4" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: t('project_details.overview_tab'), icon: BarChart3 },
                { id: 'team', label: t('project_details.team_tab'), icon: Users },
                { id: 'tasks', label: t('project_details.tasks_tab'), icon: CheckCircle },
                { id: 'timeline', label: t('project_details.timeline_tab'), icon: Calendar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'team' && renderTeam()}
            {activeTab === 'tasks' && renderTasks()}
            {activeTab === 'timeline' && renderTimeline()}
            {activeTab === 'scurve' && renderSCurve()}
          </div>
        </Card>
      </div>
    );
  };

  return renderContent();
};

export default ProjectDetails; 