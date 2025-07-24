import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { FolderPlus, Save, X } from 'lucide-react';
import { projectAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    budget: '',
    managerId: user?.id || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
        endDate: formData.endDate ? new Date(formData.endDate) : null
      };

      const response = await projectAPI.createProject(projectData);
      
      if (response.success) {
        showNotification({
          message: t('project.createSuccess'),
          type: 'success'
        });
        navigate('/projects');
      }
    } catch (error: any) {
      showNotification({
        message: t('project.createError'),
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
        <FolderPlus className="h-8 w-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('project.createNew')}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t('project.projectDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t('project.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('project.namePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('project.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('project.descriptionPlaceholder')}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t('project.startDate')}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">{t('project.endDate')}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">{t('project.status')}</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="budget">{t('project.budget')}</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? t('common.saving') : t('project.create')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/projects')}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateProject; 