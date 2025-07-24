import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Plus, Eye, Calendar, DollarSign, Award } from 'lucide-react';
import { projectAPI } from '../services/api';
import { Project } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';

const CompletedProjects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjects();
      if (response.success && response.data) {
        // Filter only completed projects
        const completedProjects = response.data.filter((project: Project) => 
          project.status === 'COMPLETED'
        );
        setProjects(completedProjects);
      }
    } catch (error) {
      showNotification({
        message: t('project.fetchError'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const calculateCompletionTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('project.completedProjects')}
          </h1>
        </div>
        <Button onClick={() => navigate('/projects/create')}>
          <Plus className="h-4 w-4 mr-2" />
          {t('project.createNew')}
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('project.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">{t('project.totalCompleted')}</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">{t('project.totalBudget')}</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {projects.reduce((sum, project) => sum + (project.budget || 0), 0).toLocaleString()} THB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">{t('project.avgCompletionTime')}</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {projects.length > 0 
                ? Math.round(projects.reduce((sum, project) => {
                    if (project.startDate && project.endDate) {
                      return sum + calculateCompletionTime(project.startDate, project.endDate);
                    }
                    return sum;
                  }, 0) / projects.length)
                : 0} {t('project.days')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('project.noCompletedProjects')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('project.noCompletedProjectsDesc')}
            </p>
            <Button onClick={() => navigate('/projects')}>
              {t('project.viewAllProjects')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow border-green-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      {t('project.statusCompleted')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2">
                  {project.description || t('project.noDescription')}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                  {project.budget && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <DollarSign className="h-4 w-4" />
                      <span>{project.budget.toLocaleString()} THB</span>
                    </div>
                  )}
                  {project.startDate && project.endDate && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Award className="h-4 w-4" />
                      <span>
                        {calculateCompletionTime(project.startDate, project.endDate)} {t('project.days')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t('common.view')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedProjects; 