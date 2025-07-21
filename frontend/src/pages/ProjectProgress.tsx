import React, { useState, useEffect } from 'react';
import { projectAPI, projectProgressAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/modal';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  User
} from 'lucide-react';

interface ProjectProgress {
  id: string;
  projectId: string;
  progress: number;
  status: 'ON_TRACK' | 'BEHIND' | 'AHEAD' | 'COMPLETED';
  milestone?: string;
  description?: string;
  reportedBy: string;
  reportedAt: string;
  project: {
    id: string;
    name: string;
    status: string;
  };
  reporter: {
    id: string;
    name: string;
    email: string;
  };
}

interface Project {
  id: string;
  name: string;
  status: string;
}

export default function ProjectProgress() {
  const [progresses, setProgresses] = useState<ProjectProgress[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgress, setEditingProgress] = useState<ProjectProgress | null>(null);
  const [formData, setFormData] = useState({
    projectId: '',
    progress: 0,
    status: 'ON_TRACK' as 'ON_TRACK' | 'BEHIND' | 'AHEAD' | 'COMPLETED',
    milestone: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progressesRes, projectsRes] = await Promise.all([
        projectProgressAPI.getLatestProgress(),
        projectAPI.getProjects()
      ]);

      if (progressesRes.success) {
        setProgresses(progressesRes.data ?? []);
      }
      if (projectsRes.success) {
        setProjects(projectsRes.data ?? []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProgress) {
        await projectProgressAPI.updateProgress(editingProgress.id, formData);
      } else {
        await projectProgressAPI.createProgress(formData);
      }
      setShowModal(false);
      setEditingProgress(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleEdit = (progress: ProjectProgress) => {
    setEditingProgress(progress);
    setFormData({
      projectId: progress.projectId,
      progress: progress.progress,
      status: progress.status,
      milestone: progress.milestone || '',
      description: progress.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this progress entry?')) {
      try {
        await projectProgressAPI.deleteProgress(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting progress:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: '',
      progress: 0,
      status: 'ON_TRACK',
      milestone: '',
      description: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'BEHIND':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'AHEAD':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return 'bg-green-100 text-green-800';
      case 'BEHIND':
        return 'bg-red-100 text-red-800';
      case 'AHEAD':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Project Progress Management</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Progress
        </Button>
      </div>

      <div className="grid gap-6">
        {progresses.map((progress) => (
          <Card key={progress.id} className="shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {progress.project.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(progress.status)}
                    <Badge className={getStatusColor(progress.status)}>
                      {progress.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(progress)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(progress.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Progress</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {progress.progress}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Milestone</div>
                  <div className="text-sm text-gray-900">
                    {progress.milestone || 'No milestone set'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Reported By</div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {progress.reporter.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {new Date(progress.reportedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {progress.description && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-500">Description</div>
                  <div className="text-sm text-gray-900 mt-1">
                    {progress.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setShowModal(false);
            setEditingProgress(null);
            resetForm();
          }
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-lg font-semibold mb-4">
            {editingProgress ? 'Edit Progress' : 'Add Progress'}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <Select
              value={formData.projectId}
              onValueChange={(value: string) => setFormData({ ...formData, projectId: value })}
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progress (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value: string) => setFormData({ ...formData, status: value as 'ON_TRACK' | 'BEHIND' | 'AHEAD' | 'COMPLETED' })}
              required
            >
              <option value="ON_TRACK">On Track</option>
              <option value="BEHIND">Behind</option>
              <option value="AHEAD">Ahead</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Milestone
            </label>
            <Input
              value={formData.milestone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, milestone: e.target.value })}
              placeholder="e.g., Phase 1 Complete"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the current progress..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setEditingProgress(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editingProgress ? 'Update' : 'Add'} Progress
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}