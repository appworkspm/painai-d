import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Clock, Calendar, FileText, Save, X } from 'lucide-react';
import { timesheetAPI } from '../services/api';
import { ActivityType } from '../types';

const CreateTimesheet: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    projectId: '',
    activityType: 'PROJECT_WORK',
    description: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    duration: 0
  });

  useEffect(() => {
    // TODO: Load projects
    setProjects([
      { id: '1', name: 'Project A' },
      { id: '2', name: 'Project B' },
      { id: '3', name: 'Project C' }
    ]);
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(0, diffHours);
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const duration = calculateDuration();
      const timesheetData = {
        ...formData,
        duration: duration > 0 ? duration : undefined
      };

      const response = await timesheetAPI.createTimesheet(timesheetData);
      
      if (response.success) {
        showNotification({
          message: 'Timesheet created successfully',
          type: 'success'
        });
        navigate('/timesheets');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Create Timesheet</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">New Timesheet Entry</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Type
                </label>
                <select
                  value={formData.activityType}
                  onChange={(e) => handleInputChange('activityType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="PROJECT_WORK">Project Work</option>
                  <option value="NON_PROJECT_WORK">Non-Project Work</option>
                  <option value="MEETING">Meeting</option>
                  <option value="BREAK">Break</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe what you worked on..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {formData.startTime && formData.endTime && (
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-800">
                  Duration: {calculateDuration().toFixed(2)} hours
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Timesheet
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/timesheets')}
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
  );
};

export default CreateTimesheet; 