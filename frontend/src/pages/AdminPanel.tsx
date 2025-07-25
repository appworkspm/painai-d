import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { User, Settings, Users, BarChart3, Shield, Activity, FolderOpen, Plus, Edit, Trash2, X, Save, UserCog, Calendar, Building2 } from 'lucide-react';
import { User as UserType } from '../types';
import { adminAPI, projectAPI } from '../services/api';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<UserType[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    isActive: true,
    employeeCode: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    isActive: true,
    employeeCode: ''
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [createProjectForm, setCreateProjectForm] = useState({
    name: '',
    description: '',
    status: '',
    managerId: '',
    budget: 0,
    startDate: '',
    endDate: ''
  });
  const [creatingProject, setCreatingProject] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editProjectForm, setEditProjectForm] = useState({
    name: '',
    description: '',
    status: '',
    managerId: '',
    budget: 0,
    startDate: '',
    endDate: ''
  });
  const [submittingProject, setSubmittingProject] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [filterUserRole, setFilterUserRole] = useState('all');
  const [searchProjects, setSearchProjects] = useState('');
  const [filterProjectStatus, setFilterProjectStatus] = useState('all');
  const [systemSettings, setSystemSettings] = useState({
    systemName: 'ไปไหน (Painai)',
    sessionTimeout: 30,
    maxLoginAttempts: 5
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [filterActivityType, setFilterActivityType] = useState('all');
  const [filterActivityDate, setFilterActivityDate] = useState('');

  const menuItems = [
    { key: 'dashboard', label: 'แดชบอร์ด', icon: <BarChart3 className="w-5 h-5" /> },
    { key: 'users', label: 'จัดการผู้ใช้', icon: <Users className="w-5 h-5" /> },
    { key: 'projects', label: 'จัดการโปรเจค', icon: <FolderOpen className="w-5 h-5" /> },
    { key: 'user-roles', label: 'สิทธิ์การใช้งาน', icon: <UserCog className="w-5 h-5" /> },
    { key: 'activity', label: 'กิจกรรม', icon: <Activity className="w-5 h-5" /> },
    { key: 'holidays', label: 'วันหยุด', icon: <Calendar className="w-5 h-5" /> },
    { key: 'database', label: 'จัดการฐานข้อมูล', icon: <Building2 className="w-5 h-5" /> },
    { key: 'settings', label: 'ตั้งค่าระบบ', icon: <Settings className="w-5 h-5" /> }
  ];

  useEffect(() => {
    // รอให้ token พร้อมก่อนเรียก API
    const loadDataWhenReady = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        console.log('Token ready, loading admin data');
        loadAdminData();
        addActivityLog('admin_panel_accessed', `${user?.name} accessed Admin Panel`, 'info');
      } else {
        console.log('No token yet, retrying in 1 second');
        setTimeout(loadDataWhenReady, 1000);
      }
    };
    
    loadDataWhenReady();
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // ตรวจสอบ token ก่อนเรียก API
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping admin data load');
        setLoading(false);
        return;
      }

      console.log('Loading admin data with token:', { tokenLength: token.length });

      // เรียก API แยกกันเพื่อจัดการ error แต่ละตัว
      try {
        const usersResponse = await adminAPI.getUsers();
        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data);
          console.log('Users loaded:', usersResponse.data.length);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }

      try {
        const statsResponse = await adminAPI.getSystemStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
          console.log('Stats loaded:', statsResponse.data);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }

      try {
        const projectsResponse = await adminAPI.getProjects();
        if (projectsResponse.success && projectsResponse.data) {
          setProjects(projectsResponse.data);
          console.log('Projects loaded:', projectsResponse.data.length);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      }

      // สร้าง activity logs ตัวอย่าง
      setActivityLogs([
        {
          id: 1,
          type: 'admin_panel_accessed',
          message: `${user?.name} accessed Admin Panel`,
          timestamp: new Date(),
          severity: 'info'
        },
        {
          id: 2,
          type: 'user_management',
          message: 'User data loaded successfully',
          timestamp: new Date(Date.now() - 60000),
          severity: 'success'
        },
        {
          id: 3,
          type: 'project_management',
          message: 'Project data loaded successfully',
          timestamp: new Date(Date.now() - 120000),
          severity: 'success'
        }
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
      showNotification({
        message: 'Error loading admin data',
        description: 'Failed to load users, projects and statistics',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      employeeCode: user.employeeCode || ''
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await adminAPI.updateUser(editingUser!.id, editForm);
      
      if (response.success) {
        addActivityLog('user_updated', `User updated: ${editForm.email}`, 'info');
        showNotification({
          message: 'User updated successfully',
          type: 'success'
        });
        setShowEditModal(false);
        setEditingUser(null);
        loadAdminData(); // Reload data
      } else {
        showNotification({
          message: response.message || 'Failed to update user',
          type: 'error'
        });
      }
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Failed to update user',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await adminAPI.deleteUser(userId);
        if (response.success) {
          addActivityLog('user_deleted', `User deleted: ${userId}`, 'warning');
          setUsers(prev => prev.filter(u => u.id !== userId));
          showNotification({
            message: 'User deleted successfully',
            type: 'success'
          });
        } else {
          showNotification({
            message: response.message || 'Failed to delete user',
            type: 'error'
          });
        }
      } catch (error: any) {
        showNotification({
          message: error.response?.data?.message || 'Failed to delete user',
          type: 'error'
        });
      }
    }
  };

  const handleCreateUser = () => {
    setCreateUserForm({
      name: '',
      email: '',
      role: '',
      password: '',
      isActive: true,
      employeeCode: ''
    });
    setShowCreateUserModal(true);
  };

  const handleCreateProject = () => {
    setCreateProjectForm({
      name: '',
      description: '',
      status: '',
      managerId: '',
      budget: 0,
      startDate: '',
      endDate: ''
    });
    setShowCreateProjectModal(true);
  };

  const handleSubmitCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);

    try {
      const response = await adminAPI.createUser(createUserForm);
      
      if (response.success) {
        addActivityLog('user_created', `New user created: ${createUserForm.email}`, 'success');
        showNotification({
          message: 'User created successfully',
          type: 'success'
        });
        setShowCreateUserModal(false);
        loadAdminData(); // Reload data
      } else {
        showNotification({
          message: response.message || 'Failed to create user',
          type: 'error'
        });
      }
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Failed to create user',
        type: 'error'
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleSubmitCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProject(true);

    try {
      const response = await adminAPI.createProject(createProjectForm);
      
      if (response.success) {
        addActivityLog('project_created', `New project created: ${createProjectForm.name}`, 'success');
        showNotification({
          message: 'Project created successfully',
          type: 'success'
        });
        setShowCreateProjectModal(false);
        loadAdminData(); // Reload data
      } else {
        showNotification({
          message: response.message || 'Failed to create project',
          type: 'error'
        });
      }
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Failed to create project',
        type: 'error'
      });
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateUserInputChange = (field: string, value: string | boolean) => {
    setCreateUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateProjectInputChange = (field: string, value: string | number) => {
    setCreateProjectForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setEditProjectForm({
      name: project.name,
      description: project.description,
      status: project.status,
      managerId: project.managerId || '',
      budget: project.budget || 0,
      startDate: project.startDate || '',
      endDate: project.endDate || ''
    });
    setShowEditProjectModal(true);
  };

  const handleSubmitEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProject(true);

    try {
      const response = await projectAPI.updateProject(editingProject.id, editProjectForm);
      
      if (response.success) {
        addActivityLog('project_updated', `Project updated: ${editProjectForm.name}`, 'info');
        showNotification({
          message: 'Project updated successfully',
          type: 'success'
        });
        setShowEditProjectModal(false);
        setEditingProject(null);
        loadAdminData(); // Reload data
      } else {
        showNotification({
          message: response.message || 'Failed to update project',
          type: 'error'
        });
      }
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Failed to update project',
        type: 'error'
      });
    } finally {
      setSubmittingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await projectAPI.deleteProject(projectId);
        if (response.success) {
          addActivityLog('project_deleted', `Project deleted: ${projectId}`, 'warning');
          setProjects(prev => prev.filter(p => p.id !== projectId));
          showNotification({
            message: 'Project deleted successfully',
            type: 'success'
          });
        } else {
          showNotification({
            message: response.message || 'Failed to delete project',
            type: 'error'
          });
        }
      } catch (error: any) {
        showNotification({
          message: error.response?.data?.message || 'Failed to delete project',
          type: 'error'
        });
      }
    }
  };

  const handleEditProjectInputChange = (field: string, value: string | number) => {
    setEditProjectForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchUsers.toLowerCase());
    const matchesRole = filterUserRole === 'all' || user.role === filterUserRole;
    return matchesSearch && matchesRole;
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchProjects.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchProjects.toLowerCase());
    const matchesStatus = filterProjectStatus === 'all' || project.status === filterProjectStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addActivityLog('settings_updated', 'System settings updated', 'info');
      showNotification({
        message: 'Settings saved successfully',
        type: 'success'
      });
    } catch (error) {
      showNotification({
        message: 'Failed to save settings',
        type: 'error'
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSettingsChange = (field: string, value: string | number) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addActivityLog = (type: string, message: string, severity: string = 'info') => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date(),
      severity
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep only last 50 logs
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'bg-green-400';
      case 'warning': return 'bg-yellow-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-blue-400';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const filteredActivityLogs = activityLogs.filter(log => {
    const matchesType = filterActivityType === 'all' || log.type.includes(filterActivityType.toLowerCase());
    const matchesDate = !filterActivityDate || log.timestamp.toDateString() === new Date(filterActivityDate).toDateString();
    return matchesType && matchesDate;
  });

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">VPs</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.vpUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.adminUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Managers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.managerUsers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activityLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="flex items-center space-x-4">
                <div className={`w-2 h-2 ${getSeverityColor(log.severity)} rounded-full`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{log.message}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">User Management</h3>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors" onClick={handleCreateUser}>
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">Users</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search users..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              />
              <select 
                value={filterUserRole}
                onChange={(e) => setFilterUserRole(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Roles</option>
                <option value="VP">VP</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="USER">User</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'VP' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'MANAGER' ? 'bg-yellow-100 text-yellow-800' :
                      user.role === 'USER' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-primary-600 hover:text-primary-900 mr-3"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProjectManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Project Management</h3>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center" onClick={handleCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">Projects</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchProjects}
                onChange={(e) => setSearchProjects(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              />
              <select 
                value={filterProjectStatus}
                onChange={(e) => setFilterProjectStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ESCALATED_TO_SUPPORT">Escalated to Support</option>
                <option value="SIGNED_CONTRACT">Signed Contract</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <FolderOpen className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.manager?.name}</div>
                    <div className="text-sm text-gray-500">{project.manager?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      project.status === 'ESCALATED_TO_SUPPORT' ? 'bg-orange-100 text-orange-800' :
                      project.status === 'SIGNED_CONTRACT' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{project.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                        onClick={() => handleEditProject(project)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 flex items-center"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUserRoles = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">จัดการสิทธิ์การใช้งาน</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มสิทธิ์ใหม่
        </button>
      </div>
      <div className="text-center py-8">
        <UserCog className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">จัดการสิทธิ์การใช้งาน</h3>
        <p className="mt-1 text-sm text-gray-500">จัดการบทบาทและสิทธิ์ของผู้ใช้ในระบบ</p>
      </div>
    </div>
  );

  const renderHolidayManagement = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">จัดการวันหยุด</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มวันหยุด
        </button>
      </div>
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">จัดการวันหยุด</h3>
        <p className="mt-1 text-sm text-gray-500">เพิ่ม แก้ไข และลบวันหยุดในระบบ</p>
      </div>
    </div>
  );

  const renderDatabaseManagement = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">จัดการฐานข้อมูล</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
          <Save className="h-4 w-4 mr-2" />
          สำรองข้อมูล
        </button>
      </div>
      <div className="text-center py-8">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">จัดการฐานข้อมูล</h3>
        <p className="mt-1 text-sm text-gray-500">สำรองและกู้คืนข้อมูลในระบบ</p>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">ตั้งค่าระบบ</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">การตั้งค่าทั่วไป</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อระบบ</label>
                <input
                  type="text"
                  value={systemSettings.systemName}
                  onChange={(e) => handleSettingsChange('systemName', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">เวลาหมดอายุเซสชัน (นาที)</label>
                <input
                  type="number"
                  value={systemSettings.sessionTimeout}
                  onChange={(e) => handleSettingsChange('sessionTimeout', parseInt(e.target.value) || 30)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">จำนวนครั้งเข้าสู่ระบบสูงสุด</label>
                <input
                  type="number"
                  value={systemSettings.maxLoginAttempts}
                  onChange={(e) => handleSettingsChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {savingSettings ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      บันทึกการตั้งค่า
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityLogs = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">บันทึกกิจกรรม</h3>
            <div className="flex space-x-2">
              <select 
                value={filterActivityType}
                onChange={(e) => setFilterActivityType(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">กิจกรรมทั้งหมด</option>
                <option value="user">จัดการผู้ใช้</option>
                <option value="project">จัดการโครงการ</option>
                <option value="settings">ตั้งค่าระบบ</option>
                <option value="admin">การเข้าถึงระบบ</option>
              </select>
              <input
                type="date"
                value={filterActivityDate}
                onChange={(e) => setFilterActivityDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activityLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>ไม่พบบันทึกกิจกรรมสำหรับตัวกรองที่เลือก</p>
              </div>
            ) : (
              <>
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 ${getSeverityColor(log.severity)} rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {log.message}
                      </p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(log.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUserManagement();
      case 'projects':
        return renderProjectManagement();
      case 'user-roles':
        return renderUserRoles();
      case 'activity':
        return renderActivityLogs();
      case 'holidays':
        return renderHolidayManagement();
      case 'database':
        return renderDatabaseManagement();
      case 'settings':
        return renderSystemSettings();
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage system settings and users</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary-600" />
          <span className="text-sm text-gray-500">Admin Access</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === item.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderContent()}
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Code
                  </label>
                  <input
                    type="text"
                    value={editForm.employeeCode}
                    onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="USER">User</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active User
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update User
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New User</h3>
                <button
                  onClick={() => setShowCreateUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={createUserForm.name}
                    onChange={(e) => handleCreateUserInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={createUserForm.email}
                    onChange={(e) => handleCreateUserInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={createUserForm.password}
                    onChange={(e) => handleCreateUserInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Code
                  </label>
                  <input
                    type="text"
                    value={createUserForm.employeeCode}
                    onChange={(e) => handleCreateUserInputChange('employeeCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={createUserForm.role}
                    onChange={(e) => handleCreateUserInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="USER">User</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="createIsActive"
                    checked={createUserForm.isActive}
                    onChange={(e) => handleCreateUserInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="createIsActive" className="ml-2 block text-sm text-gray-900">
                    Active User
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {creatingUser ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create User
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Project</h3>
                <button
                  onClick={() => setShowCreateProjectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={createProjectForm.name}
                    onChange={(e) => handleCreateProjectInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={createProjectForm.description}
                    onChange={(e) => handleCreateProjectInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={createProjectForm.status}
                    onChange={(e) => handleCreateProjectInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="ESCALATED_TO_SUPPORT">Escalated to Support</option>
                    <option value="SIGNED_CONTRACT">Signed Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager
                  </label>
                  <select
                    value={createProjectForm.managerId}
                    onChange={(e) => handleCreateProjectInputChange('managerId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Manager</option>
                    {users.filter(user => user.role === 'MANAGER').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <input
                    type="number"
                    value={createProjectForm.budget}
                    onChange={(e) => handleCreateProjectInputChange('budget', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={createProjectForm.startDate}
                      onChange={(e) => handleCreateProjectInputChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={createProjectForm.endDate}
                      onChange={(e) => handleCreateProjectInputChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={creatingProject}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {creatingProject ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateProjectModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProjectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Project</h3>
                <button
                  onClick={() => {
                    setShowEditProjectModal(false);
                    setEditingProject(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitEditProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editProjectForm.name}
                    onChange={(e) => handleEditProjectInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editProjectForm.description}
                    onChange={(e) => handleEditProjectInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editProjectForm.status}
                    onChange={(e) => handleEditProjectInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="ESCALATED_TO_SUPPORT">Escalated to Support</option>
                    <option value="SIGNED_CONTRACT">Signed Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager
                  </label>
                  <select
                    value={editProjectForm.managerId}
                    onChange={(e) => handleEditProjectInputChange('managerId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Manager</option>
                    {users.filter(user => user.role === 'MANAGER').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <input
                    type="number"
                    value={editProjectForm.budget}
                    onChange={(e) => handleEditProjectInputChange('budget', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editProjectForm.startDate}
                      onChange={(e) => handleEditProjectInputChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editProjectForm.endDate}
                      onChange={(e) => handleEditProjectInputChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submittingProject}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submittingProject ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Project
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditProjectModal(false);
                      setEditingProject(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 