import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { projectProgressAPI, SCurveData } from '../services/projectProgressAPI';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Users,
  Target,
  ArrowRight,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProjectWithProgress extends Project {
  progress: number;
  sCurveData: SCurveData[];
  lastUpdate?: string;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const ProjectProgressList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'date'>('name');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Load projects
      const projectsResponse = await api.get('/projects');
      if (!projectsResponse.data.success) {
        throw new Error('Failed to load projects');
      }

      const projectsData = projectsResponse.data.data;
      
      // Load progress data for each project
      const projectsWithProgress = await Promise.all(
        projectsData.map(async (project: Project) => {
          try {
            const progressResponse = await projectProgressAPI.getSCurveData(project.id);
            const progress = progressResponse.success && progressResponse.data.length > 0 
              ? progressResponse.data[progressResponse.data.length - 1].actual 
              : 0;
            
            return {
              ...project,
              progress,
              sCurveData: progressResponse.success ? progressResponse.data : [],
              lastUpdate: progressResponse.success && progressResponse.data.length > 0 
                ? progressResponse.data[progressResponse.data.length - 1].date 
                : undefined
            };
          } catch (error) {
            console.error(`Error loading progress for project ${project.id}:`, error);
            return {
              ...project,
              progress: 0,
              sCurveData: [],
              lastUpdate: undefined
            };
          }
        })
      );

      setProjects(projectsWithProgress);
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลโครงการได้');
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
      'ACTIVE': { label: 'ดำเนินการ', variant: 'default' },
      'COMPLETED': { label: 'เสร็จสิ้น', variant: 'outline' },
      'ON_HOLD': { label: 'ระงับ', variant: 'destructive' },
      'CANCELLED': { label: 'ยกเลิก', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 80) return 'ดีมาก';
    if (progress >= 60) return 'ดี';
    if (progress >= 40) return 'ปานกลาง';
    return 'ต้องปรับปรุง';
  };

  const calculateDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.manager?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.progress - a.progress;
        case 'date':
          return new Date(b.lastUpdate || '').getTime() - new Date(a.lastUpdate || '').getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  const averageProgress = projects.length > 0 
    ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูลโครงการ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                รายการโครงการและความก้าวหน้า
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                ติดตามความก้าวหน้าของโครงการทั้งหมด
              </p>
            </div>
            <Button
              onClick={() => navigate('/projects')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              สร้างโครงการใหม่
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    โครงการทั้งหมด
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {totalProjects}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    กำลังดำเนินการ
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {activeProjects}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    เสร็จสิ้น
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {completedProjects}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    ความก้าวหน้าเฉลี่ย
                  </p>
                  <p className={`text-3xl font-bold ${getProgressColor(averageProgress)}`}>
                    {averageProgress.toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
              <Progress value={averageProgress} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="ค้นหาโครงการ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="ACTIVE">กำลังดำเนินการ</option>
                  <option value="COMPLETED">เสร็จสิ้น</option>
                  <option value="ON_HOLD">ระงับ</option>
                  <option value="CANCELLED">ยกเลิก</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">เรียงตาม:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">ชื่อโครงการ</option>
                  <option value="progress">ความก้าวหน้า</option>
                  <option value="date">วันที่อัปเดตล่าสุด</option>
                </select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={loadProjects}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                รีเฟรช
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        {filteredAndSortedProjects.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  ไม่พบโครงการ
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'ลองเปลี่ยนเงื่อนไขการค้นหา' 
                    : 'ยังไม่มีโครงการในระบบ'}
                </p>
                <Button onClick={() => navigate('/projects')}>
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างโครงการใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedProjects.map((project) => {
              const daysRemaining = calculateDaysRemaining(project.endDate);
              
              return (
                <Card 
                  key={project.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/project-progress/${project.id}`)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {project.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(project.status)}
                          {daysRemaining !== null && (
                            <Badge variant={daysRemaining > 0 ? 'outline' : 'destructive'}>
                              {daysRemaining > 0 ? `เหลือ ${daysRemaining} วัน` : 'เลยกำหนด'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {project.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    
                    {/* Progress Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          ความก้าวหน้า
                        </span>
                        <span className={`text-sm font-semibold ${getProgressColor(project.progress)}`}>
                          {project.progress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getProgressStatus(project.progress)}
                      </p>
                    </div>
                    
                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">ผู้จัดการ</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {project.manager?.name || 'ไม่ระบุ'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">งบประมาณ</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {project.budget ? `${project.budget.toLocaleString()} บาท` : 'ไม่ระบุ'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">วันที่เริ่มต้น</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">วันที่สิ้นสุด</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Last Update */}
                    {project.lastUpdate && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Clock className="w-3 h-3" />
                        <span>อัปเดตล่าสุด: {new Date(project.lastUpdate).toLocaleDateString('th-TH')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 

export default ProjectProgressList; 