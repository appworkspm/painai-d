import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FolderOpen, Plus, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { projectAPI } from '../services/api';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadProjects();
  }, [filter]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projectAPI.getProjects();
      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        showNotification({
          message: response.message || 'ไม่สามารถโหลดข้อมูลโครงการได้',
          type: 'error'
        });
      }
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลโครงการได้',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบโครงการนี้?')) {
      try {
        setDeleting(projectId);
        const response = await projectAPI.deleteProject(projectId);
        if (response.success) {
          setProjects(prev => prev.filter(p => p.id !== projectId));
          showNotification({
            message: 'ลบโครงการสำเร็จ',
            type: 'success'
          });
        } else {
          showNotification({
            message: response.message || 'เกิดข้อผิดพลาดในการลบโครงการ',
            type: 'error'
          });
        }
      } catch (error: any) {
        showNotification({
          message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบโครงการ',
          type: 'error'
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter.toUpperCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">All Projects</h2>
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              ไม่พบโครงการ
            </div>
          ) : (
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
                    Team Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{project.manager?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(project.progress || 0)}`}
                            style={{ width: `${project.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{project.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {project.teamSize || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900 flex items-center">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id)}
                          disabled={deleting === project.id}
                          className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50"
                        >
                          {deleting === project.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects; 