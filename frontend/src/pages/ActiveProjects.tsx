import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Plus, Eye, Edit, Calendar, DollarSign, Users } from 'lucide-react';
import { projectAPI } from '../services/api';
import { Project } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ActiveProjects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjects();
      if (response.success && response.data) {
        // Filter only active projects
        const activeProjects = response.data.filter((project: Project) => 
          project.status === 'ACTIVE'
        );
        setProjects(activeProjects);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH');
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
          <FolderOpen className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('project.activeProjects')}
          </h1>
        </div>
        <Button onClick={() => navigate('/projects/create')}>
          <Plus className="h-4 w-4 mr-2" />
          {t('project.createNew')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('project.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
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

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('project.noActiveProjects')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('project.noActiveProjectsDesc')}
            </p>
            <Button onClick={() => navigate('/projects/create')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('project.createFirst')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                    <Badge className={`mt-2 ${getStatusColor(project.status)}`}>
                      {t(`project.status${project.status}`)}
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
                  {user?.role === 'ADMIN' || user?.role === 'MANAGER' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/projects/${project.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveProjects; 