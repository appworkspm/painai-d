import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  Save, 
  AlertCircle,
  Building,
  Package,
  Truck,
  Wrench,
  Plane,
  Car,
  ShoppingCart,
  CreditCard,
  Receipt
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/contexts/NotificationContext';
import { projectCostAPI, projectAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';

const COST_CATEGORIES = [
  { value: 'direct', label: 'ต้นทุนตรง (ค่าแรง, วัสดุ, เครื่องจักร)', icon: Package },
  { value: 'indirect', label: 'ต้นทุนทางอ้อม (สำนักงาน, บริหาร)', icon: Building },
  { value: 'labor', label: 'ค่าแรง (จาก timesheet หรือ manual)', icon: Receipt },
  { value: 'material', label: 'ค่าวัสดุ', icon: ShoppingCart },
  { value: 'subcontract', label: 'ผู้รับเหมาช่วง', icon: Truck },
  { value: 'overhead', label: 'ค่าใช้จ่ายทั่วไป', icon: CreditCard },
  { value: 'equipment', label: 'ค่าเครื่องมือ/เครื่องจักร', icon: Wrench },
  { value: 'travel', label: 'ค่าเดินทาง', icon: Plane },
  { value: 'other', label: 'อื่น ๆ', icon: FileText },
];

const ProjectCostEntry = ({ projectId }: { projectId?: string }) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [formData, setFormData] = useState({
    date: new Date(),
    category: '',
    title: '',
    amount: '',
    description: '',
    projectId: projectId || ''
  });

  // Fetch projects for dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectAPI.getProjects(),
  });

  const projects = projectsData?.data || [];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId) {
      showNotification({
        message: 'กรุณาเลือกโครงการ',
        type: 'error'
      });
      return;
    }

    if (!formData.category || !formData.title || !formData.amount) {
      showNotification({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await projectCostAPI.createProjectCost({
        ...formData,
        projectId: formData.projectId,
        date: formData.date.toISOString().split('T')[0],
        amount: parseFloat(formData.amount)
      });
      
      showNotification({
        message: 'บันทึกค่าใช้จ่ายสำเร็จ',
        type: 'success'
      });
      
      // Reset form
      setFormData({
        date: new Date(),
        category: '',
        title: '',
        amount: '',
        description: '',
        projectId: formData.projectId
      });
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = COST_CATEGORIES.find(c => c.value === category);
    return categoryData?.icon || FileText;
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center mb-8">
        <DollarSign className="h-10 w-10 text-green-600 mr-4" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">บันทึกค่าใช้จ่ายโครงการ</h1>
          <p className="text-gray-600">บันทึกค่าใช้จ่ายที่เกี่ยวข้องกับโครงการ</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            ข้อมูลค่าใช้จ่าย
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="project">โครงการ *</Label>
              <Select 
                value={formData.projectId} 
                onValueChange={(value) => handleInputChange('projectId', value)}
                disabled={!!projectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกโครงการ" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">วันที่ *</Label>
              <DatePicker
                date={formData.date}
                onDateChange={(date) => handleInputChange('date', date)}
                placeholder="เลือกวันที่"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">หมวดหมู่ค่าใช้จ่าย *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่ค่าใช้จ่าย" />
                </SelectTrigger>
                <SelectContent>
                  {COST_CATEGORIES.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center">
                          <IconComponent className="h-4 w-4 mr-2" />
                          {category.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">ชื่อรายการ *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="กรอกชื่อรายการค่าใช้จ่าย"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">จำนวนเงิน (บาท) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="กรอกรายละเอียดเพิ่มเติม (ถ้ามี)"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                บันทึกค่าใช้จ่าย
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    date: new Date(),
                    category: '',
                    title: '',
                    amount: '',
                    description: '',
                    projectId: formData.projectId
                  });
                }}
                disabled={loading}
              >
                ล้างข้อมูล
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            คำแนะนำ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• กรุณาเลือกโครงการที่ต้องการบันทึกค่าใช้จ่าย</p>
            <p>• เลือกหมวดหมู่ค่าใช้จ่ายที่เหมาะสม</p>
            <p>• กรอกจำนวนเงินเป็นตัวเลขเท่านั้น</p>
            <p>• สามารถเพิ่มรายละเอียดเพิ่มเติมได้ (ไม่บังคับ)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectCostEntry;
