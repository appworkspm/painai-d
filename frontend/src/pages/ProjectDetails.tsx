import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FolderOpen, Users, Calendar, Clock, CheckCircle, AlertCircle, BarChart3, Edit, Plus, Circle, X, Save, Trash2 } from 'lucide-react';
import { projectAPI, projectTeamAPI, projectTaskAPI, projectTimelineAPI, adminAPI } from '../services/api';

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

  useEffect(() => {
    if (!id) {
      // Load all projects for /projects/details
      projectAPI.getProjects().then(res => {
        if (res.success && res.data) setAllProjects(res.data);
      });
    } else {
      loadAll();
    }
    // eslint-disable-next-line
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [projRes, teamRes, timelineRes] = await Promise.all([
        projectAPI.getProject(id!),
        projectTeamAPI.getTeam(id!),
        projectTimelineAPI.getTimeline(id!)
      ]);
      setProject(projRes.data);
      setTeam(teamRes.data);
      setTimeline(timelineRes.data);
      setTasks(projRes.data.projectTasks?.filter((t: any) => !t.isDeleted) || []);
      // For add member modal
      const usersRes = await adminAPI.getUsers();
      setAllUsers(usersRes.data);
    } catch (error) {
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

  // --- UI Render Functions ---
  const renderTeam = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
        <button onClick={handleAddMember} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {team.map((member: any) => (
                <tr key={member.user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.user.position || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {member.user.id !== managerId && (
                      <button onClick={() => handleRemoveMember(member.user.id)} className="text-red-600 hover:text-red-900 flex items-center"><Trash2 className="h-4 w-4 mr-1" />Remove</button>
                    )}
                    {member.user.id === managerId && <span className="text-gray-400">Manager</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Member</h3>
                <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="mb-4">
                <select value={addMemberUserId} onChange={e => setAddMemberUserId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Select User</option>
                  {allUsers.filter(u => u.id !== managerId && !team.some((m: any) => m.user.id === u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.position || '-'})</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={handleConfirmAddMember} className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700" disabled={submitting || !addMemberUserId}>Add</button>
                <button type="button" onClick={() => setShowAddMemberModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Project Tasks</h3>
        <button onClick={handleAddTask} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task: any) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTaskStatusIcon(task.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{task.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.find(m => m.user.id === task.assigneeId)?.user.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEditTask(task)} className="text-primary-600 hover:text-primary-900 mr-2">Edit</button>
                    <button onClick={() => handleDeleteTask(task.id)} className="text-red-600 hover:text-red-900 flex items-center"><Trash2 className="h-4 w-4 mr-1" />Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add/Edit Task Modal */}
      {showEditTaskModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
                <button onClick={() => setShowEditTaskModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmitTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                  <input type="text" value={taskForm.name} onChange={e => setTaskForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={taskForm.description} onChange={e => setTaskForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <select value={taskForm.assigneeId} onChange={e => setTaskForm(prev => ({ ...prev, assigneeId: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select Member</option>
                    {team.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <input type="number" min={1} max={5} value={taskForm.priority} onChange={e => setTaskForm(prev => ({ ...prev, priority: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700" disabled={submitting}>{editingTask ? 'Update' : 'Add'} Task</button>
                  <button type="button" onClick={() => setShowEditTaskModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Project Timeline</h3>
        <ul className="space-y-4">
          {timeline.map((item: any) => (
            <li key={item.id} className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {item.action === 'task_created' ? <Plus className="h-4 w-4 text-blue-600" /> : <Trash2 className="h-4 w-4 text-red-600" />}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                <p className="text-xs text-gray-500">By {item.user?.name || '-'} • {new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

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
              <p className="text-2xl font-bold text-gray-900">{progress}%</p>
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
              <p className="text-2xl font-bold text-gray-900">{team.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Project Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Project Information</h3>
            <button onClick={() => setShowEditModal(true)} className="text-primary-600 hover:text-primary-900 flex items-center">
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
              <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project?.status)}`}>{project?.status}</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
              <p className="mt-1 text-sm text-gray-900">{project?.startDate ? new Date(project?.startDate).toLocaleDateString() : '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">End Date</h4>
              <p className="mt-1 text-sm text-gray-900">{project?.endDate ? new Date(project?.endDate).toLocaleDateString() : '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Budget</h4>
              <p className="mt-1 text-sm text-gray-900">฿{project?.budget?.toLocaleString()}</p>
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
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render project list with filter for /projects/details
  const renderProjectList = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <FolderOpen className="h-8 w-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Project List</h1>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อโครงการ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allProjects.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(project => (
              <tr key={project.id}>
                <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{project.manager?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{project.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!id) {
      // /projects/details: show filterable project list
      return renderProjectList();
    }
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
        return null;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center space-x-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center"><FolderOpen className="h-7 w-7 mr-2 text-primary-600" /> {project?.name}</h2>
        <div className="flex space-x-2">
          {['overview', 'team', 'tasks', 'timeline'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md ${activeTab === tab ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'} font-medium`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
          ))}
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default ProjectDetails; 