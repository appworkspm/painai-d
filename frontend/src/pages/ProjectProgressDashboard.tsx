import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ProjectProgressManager } from '../components/ProjectProgressManager';
import { SCurveChart } from '../components/SCurveChart';
import { projectProgressAPI, SCurveData } from '../services/projectProgressAPI';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  RefreshCw,
  Plus
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
  metrics: {
    overallProgress: number;
    taskBasedProgress: number;
    manualProgress: number;
    daysRemaining: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    notStartedTasks: number;
  };
  sCurveData: SCurveData[];
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

export const ProjectProgressDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectWithProgress | null>(null);
  const [sCurveData, setSCurveData] = useState<SCurveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId) {
      loadProjectData();
      loadSCurveData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      if (response.data.success) {
        setProject(response.data.data);
      }
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลโครงการได้');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const loadSCurveData = async () => {
    try {
      const response = await projectProgressAPI.getProjectProgress(projectId!);
      if (response.success) {
        setSCurveData(response.sCurveData);
        setProjectDetails(response.project);
      }
    } catch (error) {
      console.error('Error loading S-Curve data:', error);
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

  const calculateProjectProgress = () => {
    if (sCurveData.length === 0) return 0;
    const latest = sCurveData[sCurveData.length - 1];
    return latest.actual;
  };

  const calculateDaysRemaining = () => {
    if (!project?.endDate) return null;
    const endDate = new Date(project.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูลโครงการ...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบโครงการ</h2>
          <p className="text-gray-600 mb-4">โครงการที่คุณค้นหาอาจถูกลบหรือไม่มีอยู่</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปยังรายการโครงการ
          </Button>
        </div>
      </div>
    );
  }

  const progress = projectDetails?.metrics.overallProgress || 0;
  const taskBasedProgress = projectDetails?.metrics.taskBasedProgress || 0;
  const manualProgress = projectDetails?.metrics.manualProgress || 0;
  const daysRemaining = projectDetails?.metrics.daysRemaining;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/projects')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {projectDetails?.name || project?.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {projectDetails?.description || project?.description || 'ไม่มีคำอธิบาย'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {projectDetails && getStatusBadge(projectDetails.status)}
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                การตั้งค่า
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    ความก้าวหน้าทั้งหมด
                  </p>
                  <p className={`text-3xl font-bold ${getProgressColor(progress)}`}>
                    {progress.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-4">
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    จากงาน (Task-based)
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {taskBasedProgress.toFixed(1)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <Progress value={taskBasedProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    รายงานด้วยตนเอง
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {manualProgress.toFixed(1)}%
                  </p>
                </div>
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
              <Progress value={manualProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    วันที่สิ้นสุด
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {projectDetails?.endDate ? new Date(projectDetails.endDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                  </p>
                  {daysRemaining !== null && (
                    <p className={`text-sm ${daysRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {daysRemaining > 0 ? `เหลือ ${daysRemaining} วัน` : 'เลยกำหนดแล้ว'}
                    </p>
                  )}
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Metrics Summary */}
        {projectDetails && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                สรุปข้อมูลโครงการ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{projectDetails.metrics.totalTasks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">งานทั้งหมด</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{projectDetails.metrics.completedTasks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">เสร็จสิ้น</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{projectDetails.metrics.inProgressTasks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">กำลังดำเนินการ</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">{projectDetails.metrics.notStartedTasks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">ยังไม่เริ่ม</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              ภาพรวม
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              จัดการความก้าวหน้า
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              กราฟและรายงาน
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              การวิเคราะห์
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    รายละเอียดโครงการ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ชื่อโครงการ</p>
                      <p className="text-gray-900 dark:text-gray-100">{projectDetails?.name || project?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">สถานะ</p>
                      <div className="mt-1">{projectDetails && getStatusBadge(projectDetails.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">วันที่เริ่มต้น</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {projectDetails?.startDate ? new Date(projectDetails.startDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">วันที่สิ้นสุด</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {projectDetails?.endDate ? new Date(projectDetails.endDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">งบประมาณ</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {projectDetails?.budget ? `${projectDetails.budget.toLocaleString()} บาท` : 'ไม่ระบุ'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ผู้จัดการ</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {projectDetails?.manager?.name || 'ไม่ระบุ'}
                      </p>
                    </div>
                  </div>
                  {projectDetails?.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">คำอธิบาย</p>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{projectDetails.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    การดำเนินการด่วน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab('progress')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มความก้าวหน้าใหม่
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('charts')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    ดูกราฟความก้าวหน้า
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    สร้างรายงาน
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    จัดการทีมงาน
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* S-Curve Chart */}
            <SCurveChart
              data={sCurveData}
              title="กราฟความก้าวหน้า S-Curve"
              height={400}
              showArea={true}
              showGrid={true}
              showLegend={true}
            />
          </TabsContent>

          <TabsContent value="progress">
            <ProjectProgressManager
              projectId={projectId!}
              projectName={projectDetails?.name || project?.name}
            />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SCurveChart
                data={sCurveData}
                title="กราฟเส้น (Line Chart)"
                height={300}
                showArea={false}
                showGrid={true}
                showLegend={true}
              />
              <SCurveChart
                data={sCurveData}
                title="กราฟพื้นที่ (Area Chart)"
                height={300}
                showArea={true}
                showGrid={true}
                showLegend={true}
              />
            </div>
            <SCurveChart
              data={sCurveData}
              title="กราฟแท่งและเส้น (Bar & Line Chart)"
              height={400}
              showArea={true}
              showBars={true}
              showGrid={true}
              showLegend={true}
            />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  การวิเคราะห์ความก้าวหน้า
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>ฟีเจอร์การวิเคราะห์จะเปิดให้ใช้งานเร็วๆ นี้</p>
                  <p className="text-sm">รวมถึงการวิเคราะห์แนวโน้ม การคาดการณ์ และการแจ้งเตือน</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectProgressDashboard; 