import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { SCurveChart } from './SCurveChart';
import { projectProgressAPI, ProjectProgress, SCurveData, ProgressFilters, ProjectWithProgress } from '../services/projectProgressAPI';
import { toast } from 'sonner';
import { 
  Upload, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  BarChart3, 
  Calendar,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface ProjectProgressManagerProps {
  projectId: string;
  projectName?: string;
  className?: string;
}

export const ProjectProgressManager: React.FC<ProjectProgressManagerProps> = ({
  projectId,
  projectName = 'Project',
  className = ''
}) => {
  const [progressData, setProgressData] = useState<ProjectProgress[]>([]);
  const [sCurveData, setSCurveData] = useState<SCurveData[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectWithProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProjectProgress | null>(null);
  const [filters, setFilters] = useState<ProgressFilters>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    progress: '',
    planned: '',
    actual: '',
    status: 'ON_TRACK',
    milestone: '',
    description: ''
  });

  const statusOptions = [
    { value: 'ON_TRACK', label: 'ตามแผน', color: 'bg-green-100 text-green-800' },
    { value: 'BEHIND_SCHEDULE', label: 'ล่าช้า', color: 'bg-red-100 text-red-800' },
    { value: 'AHEAD_OF_SCHEDULE', label: 'เร็วกว่าแผน', color: 'bg-blue-100 text-blue-800' },
    { value: 'COMPLETED', label: 'เสร็จสิ้น', color: 'bg-purple-100 text-purple-800' },
    { value: 'ON_HOLD', label: 'ระงับ', color: 'bg-gray-100 text-gray-800' }
  ];

  const loadProgressData = async () => {
    setLoading(true);
    try {
      const response = await projectProgressAPI.getProjectProgress(projectId, {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      if (response.success) {
        setProgressData(response.data);
        setSCurveData(response.sCurveData || []);
        setProjectDetails(response.project);
      }
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลความก้าวหน้าได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.progress) {
      toast.error('กรุณากรอกความก้าวหน้า');
      return;
    }

    try {
      if (editingEntry) {
        await projectProgressAPI.updateProgress(editingEntry.id, {
          progress: parseInt(formData.progress),
          planned: formData.planned ? parseInt(formData.planned) : undefined,
          actual: formData.actual ? parseInt(formData.actual) : undefined,
          status: formData.status,
          milestone: formData.milestone || undefined,
          description: formData.description || undefined
        });
        toast.success('อัปเดตความก้าวหน้าสำเร็จ');
      } else {
        await projectProgressAPI.createProgress({
          projectId,
          progress: parseInt(formData.progress),
          planned: formData.planned ? parseInt(formData.planned) : undefined,
          actual: formData.actual ? parseInt(formData.actual) : undefined,
          status: formData.status,
          milestone: formData.milestone || undefined,
          description: formData.description || undefined
        });
        toast.success('เพิ่มความก้าวหน้าสำเร็จ');
      }
      
      resetForm();
      loadProgressData();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบรายการนี้หรือไม่?')) return;
    
    try {
      await projectProgressAPI.deleteProgress(id);
      toast.success('ลบรายการสำเร็จ');
      loadProgressData();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const handleEdit = (entry: ProjectProgress) => {
    setEditingEntry(entry);
    setFormData({
      progress: entry.progress.toString(),
      planned: entry.planned?.toString() || '',
      actual: entry.actual?.toString() || '',
      status: entry.status,
      milestone: entry.milestone || '',
      description: entry.description || ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      progress: '',
      planned: '',
      actual: '',
      status: 'ON_TRACK',
      milestone: '',
      description: ''
    });
    setEditingEntry(null);
    setShowAddModal(false);
  };

  const handleImport = async (file: File) => {
    try {
      const response = await projectProgressAPI.importProgress(projectId, file);
      if (response.success) {
        toast.success(`นำเข้าข้อมูลสำเร็จ ${response.data.length} รายการ`);
        loadProgressData();
        setShowImportModal(false);
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'csv') => {
    try {
      await projectProgressAPI.exportProgress(projectId, {
        startDate: filters.startDate,
        endDate: filters.endDate
      }, format);
      toast.success('ส่งออกข้อมูลสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    }
  };

  const downloadTemplate = () => {
    projectProgressAPI.generateCSVTemplate();
    toast.success('ดาวน์โหลดเทมเพลตสำเร็จ');
  };

  React.useEffect(() => {
    loadProgressData();
  }, [projectId, filters]);

  const getStatusBadge = (status: string) => {
    const statusInfo = statusOptions.find(option => option.value === status);
    return (
      <Badge className={statusInfo?.color || 'bg-gray-100 text-gray-800'}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const latestProgress = progressData[0];
  const overallProgress = projectDetails?.metrics.overallProgress || latestProgress?.progress || 0;
  const taskBasedProgress = projectDetails?.metrics.taskBasedProgress || 0;
  const manualProgress = projectDetails?.metrics.manualProgress || 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                จัดการความก้าวหน้า: {projectDetails?.name || projectName}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {projectDetails?.description || 'ติดตามและจัดการความก้าวหน้าของโครงการ'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                นำเข้า
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
              >
                <Download className="w-4 h-4 mr-2" />
                ส่งออก
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มความก้าวหน้า
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Project Details Summary */}
      {projectDetails && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              รายละเอียดโครงการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">ข้อมูลโครงการ</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">สถานะ:</span>
                    {getStatusBadge(projectDetails.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ผู้จัดการ:</span>
                    <span className="font-medium">{projectDetails.manager?.name || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">งบประมาณ:</span>
                    <span className="font-medium">
                      {projectDetails.budget ? `${projectDetails.budget.toLocaleString()} บาท` : 'ไม่ระบุ'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">วันที่เริ่มต้น:</span>
                    <span className="font-medium">
                      {projectDetails.startDate ? new Date(projectDetails.startDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">วันที่สิ้นสุด:</span>
                    <span className="font-medium">
                      {projectDetails.endDate ? new Date(projectDetails.endDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                    </span>
                  </div>
                  {projectDetails.metrics.daysRemaining !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">เหลือเวลา:</span>
                      <span className={`font-medium ${projectDetails.metrics.daysRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {projectDetails.metrics.daysRemaining > 0 ? `${projectDetails.metrics.daysRemaining} วัน` : 'เลยกำหนด'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">ความก้าวหน้าทั้งหมด</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>จากงาน (Task-based):</span>
                      <span className="font-semibold text-blue-600">{taskBasedProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={taskBasedProgress} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>รายงานด้วยตนเอง:</span>
                      <span className="font-semibold text-green-600">{manualProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={manualProgress} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>รวมทั้งสิ้น:</span>
                      <span className="font-semibold text-purple-600">{overallProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">สถานะงาน</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">งานทั้งหมด:</span>
                    <span className="font-medium">{projectDetails.metrics.totalTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">เสร็จสิ้น:</span>
                    <span className="font-medium text-green-600">{projectDetails.metrics.completedTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">กำลังดำเนินการ:</span>
                    <span className="font-medium text-blue-600">{projectDetails.metrics.inProgressTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ยังไม่เริ่ม:</span>
                    <span className="font-medium text-gray-600">{projectDetails.metrics.notStartedTasks}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">สถานะโครงการ:</span>
                      <span className={`font-medium ${projectDetails.metrics.isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
                        {projectDetails.metrics.isOnTrack ? 'ตามแผน' : 'ล่าช้า'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ความก้าวหน้าทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {overallProgress.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">รายการทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {progressData.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">สถานะล่าสุด</p>
                <div className="mt-1">
                  {latestProgress ? getStatusBadge(latestProgress.status) : <span className="text-gray-400">ไม่มีข้อมูล</span>}
                </div>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">อัปเดตล่าสุด</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {latestProgress ? new Date(latestProgress.date).toLocaleDateString('th-TH') : 'ไม่มีข้อมูล'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ตัวกรอง:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-40"
                placeholder="วันที่เริ่มต้น"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-40"
                placeholder="วันที่สิ้นสุด"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({})}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              รีเซ็ต
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* S-Curve Chart */}
      <SCurveChart 
        data={sCurveData}
        title="กราฟความก้าวหน้า S-Curve"
        height={400}
        showArea={true}
        showGrid={true}
        showLegend={true}
      />

      {/* Progress List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            รายการความก้าวหน้า
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">กำลังโหลด...</span>
            </div>
          ) : progressData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>ไม่มีข้อมูลความก้าวหน้า</p>
              <p className="text-sm">เริ่มต้นโดยการเพิ่มความก้าวหน้าใหม่</p>
            </div>
          ) : (
            <div className="space-y-4">
              {progressData.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {entry.progress}%
                        </span>
                        {getStatusBadge(entry.status)}
                        {entry.milestone && (
                          <Badge variant="outline">{entry.milestone}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">แผน:</span> {entry.planned || '-'}%
                        </div>
                        <div>
                          <span className="font-medium">ผลงานจริง:</span> {entry.actual || '-'}%
                        </div>
                        <div>
                          <span className="font-medium">วันที่:</span> {new Date(entry.date).toLocaleDateString('th-TH')}
                        </div>
                        <div>
                          <span className="font-medium">รายงานโดย:</span> {entry.reporter?.name || '-'}
                        </div>
                      </div>
                      
                      {entry.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'แก้ไขความก้าวหน้า' : 'เพิ่มความก้าวหน้าใหม่'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ความก้าวหน้า (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  สถานะ
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  แผน (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.planned}
                  onChange={(e) => setFormData(prev => ({ ...prev, planned: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ผลงานจริง (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.actual}
                  onChange={(e) => setFormData(prev => ({ ...prev, actual: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Milestone
              </label>
              <Input
                value={formData.milestone}
                onChange={(e) => setFormData(prev => ({ ...prev, milestone: e.target.value }))}
                placeholder="ระบุ milestone (ถ้ามี)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                คำอธิบาย
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="รายละเอียดเพิ่มเติม..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingEntry ? 'อัปเดต' : 'เพิ่ม'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>นำเข้าข้อมูลจากไฟล์ CSV</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>รองรับไฟล์ CSV ที่มีคอลัมน์ดังนี้:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>date - วันที่ (YYYY-MM-DD)</li>
                <li>progress - ความก้าวหน้า (%)</li>
                <li>planned - แผน (%)</li>
                <li>actual - ผลงานจริง (%)</li>
                <li>status - สถานะ</li>
                <li>milestone - Milestone</li>
                <li>description - คำอธิบาย</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                ดาวน์โหลดเทมเพลต
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImport(file);
                  }
                }}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                เลือกไฟล์ CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 