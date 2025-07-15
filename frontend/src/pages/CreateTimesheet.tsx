import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Clock, Calendar, FileText, Save, X } from 'lucide-react';
import { timesheetAPI } from '../services/api';
import { ActivityType } from '../types';
import { projectAPI } from '../services/api';
import TimesheetForm from '../components/TimesheetForm';

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
    // Load projects from API
    const fetchProjects = async () => {
      try {
        const response = await projectAPI.getProjects();
        if (response.success && response.data) {
          setProjects(response.data);
        }
      } catch (error) {
        // Optionally show notification
      }
    };
    fetchProjects();
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

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await timesheetAPI.createTimesheet(values);
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
          <div className="p-6">
            <TimesheetForm
              mode="create"
              onSubmit={handleSubmit}
              onCancel={() => navigate('/timesheets')}
              loading={loading}
              projects={projects}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTimesheet; 