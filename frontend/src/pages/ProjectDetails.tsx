import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FolderOpen, Users, Calendar, Clock, CheckCircle, AlertCircle, BarChart3, Edit, Plus } from 'lucide-react';
import api from '../services/api';

const ProjectDetails: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadProjectDetails();
  }, []);

  const loadProjectDetails = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockProject = {
        id: '1',
        name: 'Website Redesign Project',
        description: 'Complete redesign of the company website with modern UI/UX',
        status: 'ACTIVE',
        progress: 65,
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        manager: {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        team: [
          { id: '1', name: 'John Doe', role: 'Project Manager', email: 'john.doe@example.com' },
          { id: '2', name: 'Jane Smith', role: 'Frontend Developer', email: 'jane.smith@example.com' },
          { id: '3', name: 'Mike Johnson', role: 'Backend Developer', email: 'mike.johnson@example.com' },
          { id: '4', name: 'Sarah Wilson', role: 'UI/UX Designer', email: 'sarah.wilson@example.com' }
        ],
        tasks: [
          { id: '1', title: 'Design System Setup', status: 'COMPLETED', assignee: 'Sarah Wilson', dueDate: '2024-01-15' },
          { id: '2', title: 'Frontend Development', status: 'IN_PROGRESS', assignee: 'Jane Smith', dueDate: '2024-02-15' },
          { id: '3', title: 'Backend API Development', status: 'IN_PROGRESS', assignee: 'Mike Johnson', dueDate: '2024-02-20' },
          { id: '4', title: 'Testing & QA', status: 'PENDING', assignee: 'John Doe', dueDate: '2024-03-15' },
          { id: '5', title: 'Deployment', status: 'PENDING', assignee: 'John Doe', dueDate: '2024-03-31' }
        ],
        budget: 50000,
        spent: 32500,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
      };
      setProject(mockProject);
    } catch (error) {
      showNotification({
        message: 'Failed to load project details',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'BLOCKED':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'tasks', name: 'Tasks', icon: CheckCircle },
    { id: 'timeline', name: 'Timeline', icon: Calendar }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{project?.progress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{project?.team?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{project?.tasks?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Budget Used</p>
              <p className="text-2xl font-bold text-gray-900">฿{project?.spent?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Project Information</h3>
            <button className="text-primary-600 hover:text-primary-900 flex items-center">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-sm text-gray-900">{project?.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project?.status)}`}>
                {project?.status}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
              <p className="mt-1 text-sm text-gray-900">{new Date(project?.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">End Date</h4>
              <p className="mt-1 text-sm text-gray-900">{new Date(project?.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Budget</h4>
              <p className="mt-1 text-sm text-gray-900">฿{project?.budget?.toLocaleString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Spent</h4>
              <p className="mt-1 text-sm text-gray-900">฿{project?.spent?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{project?.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${project?.progress || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Project Team</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {project?.team?.map((member: any) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Project Tasks</h3>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">All Tasks</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {project?.tasks?.map((task: any) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTaskStatusIcon(task.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.assignee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Project Timeline</h3>
        <div className="space-y-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-900">Project Started</p>
              <p className="text-sm text-gray-500">{new Date(project?.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-900">Design Phase Completed</p>
              <p className="text-sm text-gray-500">January 15, 2024</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-900">Development Phase</p>
              <p className="text-sm text-gray-500">In Progress - Due February 20, 2024</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-900">Testing & QA</p>
              <p className="text-sm text-gray-500">Due March 15, 2024</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-900">Project Completion</p>
              <p className="text-sm text-gray-500">Due March 31, 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'team':
        return renderTeam();
      case 'tasks':
        return renderTasks();
      case 'timeline':
        return renderTimeline();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No project found</h3>
        <p className="mt-1 text-sm text-gray-500">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">Project Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
};

export default ProjectDetails; 