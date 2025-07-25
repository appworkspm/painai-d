import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { Save, X, FolderEdit } from 'lucide-react';
import { projectAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FormData = {
  name: string;
  description: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  budget: string;
  managerId: string;
};

const EditProject: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: '',
    managerId: user?.id || ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await projectAPI.getProject(id);
        
        if (response.success && response.data) {
          const project = response.data;
          setFormData({
            ...project,
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
            budget: project.budget?.toString() || ''
          });
        } else {
          showNotification({
            message: t('project.fetchError'),
            type: 'error'
          });
          navigate('/projects');
        }
      } catch (error) {
        showNotification({
          message: t('project.fetchError'),
          type: 'error'
        });
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate, showNotification, t]);

  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (!id) return;
      
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined
      };

      const response = await projectAPI.updateProject(id, projectData);
      
      if (response.success) {
        showNotification({
          message: t('project.updateSuccess'),
          type: 'success'
        });
        navigate(`/projects/${id}`);
      } else {
        showNotification({
          message: response.message || t('project.updateError'),
          type: 'error'
        });
      }
    } catch (error) {
      showNotification({
        message: t('project.updateError'),
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderEdit className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('project.editProject')}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={submitting}
        >
          <X className="h-4 w-4 mr-2" />
          {t('common.cancel')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('project.projectDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t('project.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t('project.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED') => 
                    handleInputChange('status', value)
                  }
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t('project.statusActive')}</SelectItem>
                    <SelectItem value="ON_HOLD">{t('project.statusOnHold')}</SelectItem>
                    <SelectItem value="COMPLETED">{t('project.statusCompleted')}</SelectItem>
                    <SelectItem value="CANCELLED">{t('project.statusCancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">{t('project.startDate')}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate as string}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">{t('project.endDate')}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate as string}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">{t('project.budget')} (THB)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value || '0')}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('project.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                disabled={submitting}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                <X className="h-4 w-4 mr-2" />
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('common.saveChanges')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProject;
