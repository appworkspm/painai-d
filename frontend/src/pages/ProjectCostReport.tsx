import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  FileText, 
  Filter, 
  Download, 
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Building,
  Package,
  Truck,
  Wrench,
  Plane,
  ShoppingCart,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { projectCostAPI, projectAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const COST_CATEGORIES = [
  { value: 'direct', label: 'ต้นทุนตรง', icon: Package, color: '#3b82f6' },
  { value: 'indirect', label: 'ต้นทุนทางอ้อม', icon: Building, color: '#10b981' },
  { value: 'labor', label: 'ค่าแรง', icon: Receipt, color: '#f59e0b' },
  { value: 'material', label: 'ค่าวัสดุ', icon: ShoppingCart, color: '#8b5cf6' },
  { value: 'subcontract', label: 'ผู้รับเหมาช่วง', icon: Truck, color: '#ef4444' },
  { value: 'overhead', label: 'ค่าใช้จ่ายทั่วไป', icon: CreditCard, color: '#06b6d4' },
  { value: 'equipment', label: 'ค่าเครื่องมือ/เครื่องจักร', icon: Wrench, color: '#84cc16' },
  { value: 'travel', label: 'ค่าเดินทาง', icon: Plane, color: '#f97316' },
  { value: 'other', label: 'อื่น ๆ', icon: FileText, color: '#6b7280' },
];

const ProjectCostReport = ({ projectId }: { projectId?: string }) => {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState(projectId || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [activeTab, setActiveTab] = useState('summary');

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectAPI.getProjects(),
  });

  // Fetch project costs
  const { data: costsData, isLoading } = useQuery({
    queryKey: ['project-costs', selectedProject, selectedCategory],
    queryFn: () => projectCostAPI.getProjectCosts({ 
      projectId: selectedProject === 'all' ? undefined : selectedProject,
      category: selectedCategory === 'all' ? undefined : selectedCategory 
    }),
  });

  const projects = projectsData?.data || [];
  const costs = costsData?.data || [];

  // Filter costs by date range
  const filteredCosts = costs.filter((cost: any) => {
    if (!dateRange.start && !dateRange.end) return true;
    const costDate = new Date(cost.date);
    if (dateRange.start && costDate < dateRange.start) return false;
    if (dateRange.end && costDate > dateRange.end) return false;
    return true;
  });

  // Calculate statistics
  const totalAmount = filteredCosts.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0);
  const totalCount = filteredCosts.length;
  const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

  // Group by category
  const categoryStats = COST_CATEGORIES.map(category => {
    const categoryCosts = filteredCosts.filter((cost: any) => cost.category === category.value);
    const total = categoryCosts.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0);
    return {
      ...category,
      total,
      count: categoryCosts.length,
      percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0
    };
  }).filter(stat => stat.total > 0);

  // Group by project
  const projectStats = projects.map(project => {
    const projectCosts = filteredCosts.filter((cost: any) => cost.projectId === project.id);
    const total = projectCosts.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0);
    return {
      id: project.id,
      name: project.name,
      total,
      count: projectCosts.length,
      percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0
    };
  }).filter(stat => stat.total > 0);

  // Monthly trend data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthCosts = filteredCosts.filter((cost: any) => {
      const costDate = new Date(cost.date);
      return costDate.getMonth() === i;
    });
    const total = monthCosts.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0);
    return {
      month: new Date(2024, i, 1).toLocaleDateString('th-TH', { month: 'short' }),
      total,
      count: monthCosts.length
    };
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = COST_CATEGORIES.find(c => c.value === category);
    return categoryData?.icon || FileText;
  };

  const exportReport = () => {
    // Implementation for exporting report
    console.log('Exporting report...');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">รายงานค่าใช้จ่ายโครงการ</h1>
          <p className="text-gray-600">สรุปและวิเคราะห์ค่าใช้จ่ายของโครงการ</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={exportReport} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            ตัวกรองข้อมูล
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>โครงการ</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกโครงการ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกโครงการ</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>หมวดหมู่</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                  {COST_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center">
                        <category.icon className="h-4 w-4 mr-2" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>วันที่เริ่มต้น</Label>
              <DatePicker
                date={dateRange.start}
                onDateChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                placeholder="เลือกวันที่"
              />
            </div>
            
            <div className="space-y-2">
              <Label>วันที่สิ้นสุด</Label>
              <DatePicker
                date={dateRange.end}
                onDateChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                placeholder="เลือกวันที่"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">ค่าใช้จ่ายรวม</p>
                <p className="text-2xl font-bold text-gray-900">฿{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">จำนวนรายการ</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">ค่าเฉลี่ยต่อรายการ</p>
                <p className="text-2xl font-bold text-gray-900">฿{averageAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-orange-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">โครงการที่เกี่ยวข้อง</p>
                <p className="text-2xl font-bold text-gray-900">{projectStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="summary">สรุป</TabsTrigger>
          <TabsTrigger value="analytics">การวิเคราะห์</TabsTrigger>
          <TabsTrigger value="details">รายละเอียด</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  การกระจายตามหมวดหมู่
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="total"
                        label={({ label, percentage }) => `${label}: ${percentage.toFixed(1)}%`}
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'จำนวนเงิน']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Project Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  การกระจายตามโครงการ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectStats.slice(0, 5).map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{project.name}</span>
                        <span className="text-sm text-gray-500">฿{project.total.toLocaleString()}</span>
                      </div>
                      <Progress value={project.percentage} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{project.count} รายการ</span>
                        <span>{project.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                แนวโน้มรายเดือน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'จำนวนเงิน']} />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  วิเคราะห์ตามหมวดหมู่
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'จำนวนเงิน']} />
                      <Bar dataKey="total" fill="#3b82f6">
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Project Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  วิเคราะห์ตามโครงการ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'จำนวนเงิน']} />
                      <Bar dataKey="total" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                รายละเอียดค่าใช้จ่าย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">วันที่</th>
                      <th className="text-left p-2">โครงการ</th>
                      <th className="text-left p-2">หมวดหมู่</th>
                      <th className="text-left p-2">รายการ</th>
                      <th className="text-right p-2">จำนวนเงิน</th>
                      <th className="text-left p-2">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCosts.map((cost: any) => {
                      const CategoryIcon = getCategoryIcon(cost.category);
                      const categoryData = COST_CATEGORIES.find(c => c.value === cost.category);
                      const projectData = projects.find((p: any) => p.id === cost.projectId);
                      
                      return (
                        <tr key={cost.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            {format(new Date(cost.date), 'dd/MM/yyyy', { locale: th })}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-gray-500" />
                              {projectData?.name || 'ไม่ระบุ'}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center">
                              <CategoryIcon className="h-4 w-4 mr-2" />
                              <Badge variant="outline">{categoryData?.label || cost.category}</Badge>
                            </div>
                          </td>
                          <td className="p-2">{cost.title}</td>
                          <td className="p-2 text-right font-medium">
                            ฿{cost.amount?.toLocaleString()}
                          </td>
                          <td className="p-2">
                            {getStatusIcon(cost.status)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectCostReport;
