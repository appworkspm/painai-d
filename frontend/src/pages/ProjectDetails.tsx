import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FolderOpen, Users, Calendar, Clock, CheckCircle, AlertCircle, BarChart3, Edit, Plus, Circle, X, Save, Trash2, Search, Filter } from 'lucide-react';
import { projectAPI, projectTeamAPI, projectTaskAPI, projectTimelineAPI, adminAPI } from '../services/api';
import { Card, Row, Col, Statistic, Table, Tag, Space, Button, Input, Select, DatePicker, message, Spin, Empty, Skeleton } from 'antd';
import dayjs from 'dayjs';

const { Search: AntSearch } = Input;

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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
  const [error, setError] = useState<string | null>(null);

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
  const filteredProjects = allProjects.filter(project => 
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    project.description?.toLowerCase().includes(search.toLowerCase()) ||
    project.manager?.name?.toLowerCase().includes(search.toLowerCase())
  );

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
        <h3 className="text-lg font-medium text-gray-900">สมาชิกทีม</h3>
        <Button 
          type="primary" 
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAddMember}
        >
          เพิ่มสมาชิก
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
                  <Tag color="blue">ผู้จัดการ</Tag>
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
        <h3 className="text-lg font-medium text-gray-900">งานในโครงการ</h3>
        <Button 
          type="primary" 
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAddTask}
        >
          เพิ่มงาน
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
                COMPLETED: { color: 'success', text: 'เสร็จสิ้น' },
                IN_PROGRESS: { color: 'processing', text: 'กำลังดำเนินการ' },
                PENDING: { color: 'default', text: 'รอดำเนินการ' }
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
                  แก้ไข
                </Button>
                <Button 
                  type="text" 
                  danger 
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => handleDeleteTask(record.id)}
                >
                  ลบ
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
      <h3 className="text-lg font-medium text-gray-900">ไทม์ไลน์โครงการ</h3>
      
      {timeline.length === 0 ? (
        <Empty description="ยังไม่มีกิจกรรมในไทม์ไลน์" />
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
          <h3 className="text-lg font-medium text-gray-900">ข้อมูลโครงการ</h3>
        </div>
        <div className="p-6">
          <Row gutter={16}>
            <Col span={12}>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">คำอธิบาย</h4>
                <p className="mt-1 text-sm text-gray-900">{project?.description || '-'}</p>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">สถานะ</h4>
                <Tag color={project?.status === 'ACTIVE' ? 'success' : 'default'}>
                  {project?.status === 'ACTIVE' ? 'กำลังดำเนินการ' : project?.status}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">วันที่เริ่มต้น</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {project?.startDate ? dayjs(project.startDate).format('DD/MM/YYYY') : '-'}
                </p>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">วันที่สิ้นสุด</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {project?.endDate ? dayjs(project.endDate).format('DD/MM/YYYY') : '-'}
                </p>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">งบประมาณ</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {project?.budget ? `฿${project.budget.toLocaleString()}` : '-'}
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">ความคืบหน้าโครงการ</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>ความคืบหน้ารวม</span>
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
      </div>
    </div>
  );

  const renderProjectList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">รายการโครงการ</h1>
            <p className="text-sm text-gray-600">ค้นหาและดูรายละเอียดโครงการทั้งหมด</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <Row gutter={16}>
          <Col span={12}>
            <AntSearch
              placeholder="ค้นหาตามชื่อโครงการ, คำอธิบาย, หรือผู้จัดการ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search className="h-4 w-4 text-gray-400" />}
              size="large"
            />
          </Col>
          <Col span={12}>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">พบ {filteredProjects.length} โครงการ</span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Project Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="โครงการทั้งหมด"
              value={allProjects.length}
              prefix={<FolderOpen className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="โครงการที่กำลังดำเนินการ"
              value={allProjects.filter(p => p.status === 'ACTIVE').length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircle className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="โครงการที่เสร็จสิ้น"
              value={allProjects.filter(p => p.status === 'COMPLETED').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChart3 className="h-4 w-4" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="โครงการที่ระงับ"
              value={allProjects.filter(p => p.status === 'ON_HOLD').length}
              valueStyle={{ color: '#faad14' }}
              prefix={<AlertCircle className="h-4 w-4" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Project Table */}
      <Card title="รายการโครงการ">
        <Table
          dataSource={filteredProjects}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`
          }}
          columns={[
            {
              title: 'ชื่อโครงการ',
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
              title: 'ผู้จัดการ',
              dataIndex: 'manager',
              key: 'manager',
              render: (manager: any) => manager?.name || '-'
            },
            {
              title: 'สถานะ',
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => {
                const statusConfig = {
                  ACTIVE: { color: 'success', text: 'กำลังดำเนินการ' },
                  COMPLETED: { color: 'default', text: 'เสร็จสิ้น' },
                  ON_HOLD: { color: 'warning', text: 'ระงับ' }
                };
                const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
                return <Tag color={config.color}>{config.text}</Tag>;
              }
            },
            {
              title: 'วันที่สร้าง',
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (date: string) => dayjs(date).format('DD/MM/YYYY')
            },
            {
              title: 'การดำเนินการ',
              key: 'actions',
              render: (record: any) => (
                <Space>
                  <Button 
                    type="link" 
                    onClick={() => window.location.href = `/projects/${record.id}/details`}
                  >
                    ดูรายละเอียด
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
              ลองใหม่
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
          <Empty description="ไม่พบข้อมูลโครงการ" />
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
                title="ความคืบหน้า"
                value={progress}
                suffix="%"
                prefix={<BarChart3 className="h-4 w-4" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="งานทั้งหมด"
                value={totalTasks}
                prefix={<CheckCircle className="h-4 w-4" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="งานเสร็จสิ้น"
                value={completedTasks}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircle className="h-4 w-4" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="สมาชิกทีม"
                value={team.length}
                prefix={<Users className="h-4 w-4" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'ภาพรวม', icon: BarChart3 },
                { id: 'team', label: 'ทีม', icon: Users },
                { id: 'tasks', label: 'งาน', icon: CheckCircle },
                { id: 'timeline', label: 'ไทม์ไลน์', icon: Calendar }
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
          </div>
        </Card>
      </div>
    );
  };

  return renderContent();
};

export default ProjectDetails; 