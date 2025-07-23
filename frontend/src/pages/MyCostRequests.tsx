import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  Plus, 
  FileText, 
  Calendar,
  Package,
  Building,
  Receipt,
  ShoppingCart,
  Truck,
  CreditCard,
  Wrench,
  Plane,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/contexts/NotificationContext';
import { costRequestAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const COST_CATEGORIES = [
  { value: 'direct', label: 'ต้นทุนตรง', icon: Package },
  { value: 'indirect', label: 'ต้นทุนทางอ้อม', icon: Building },
  { value: 'labor', label: 'ค่าแรง', icon: Receipt },
  { value: 'material', label: 'ค่าวัสดุ', icon: ShoppingCart },
  { value: 'subcontract', label: 'ผู้รับเหมาช่วง', icon: Truck },
  { value: 'overhead', label: 'ค่าใช้จ่ายทั่วไป', icon: CreditCard },
  { value: 'equipment', label: 'ค่าเครื่องมือ/เครื่องจักร', icon: Wrench },
  { value: 'travel', label: 'ค่าเดินทาง', icon: Plane },
  { value: 'other', label: 'อื่น ๆ', icon: FileText },
];

const MyCostRequests = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(),
    category: '',
    title: '',
    amount: '',
    description: ''
  });

  // Fetch cost requests
  const { data: costRequestsData, isLoading, refetch } = useQuery({
    queryKey: ['my-cost-requests'],
    queryFn: () => costRequestAPI.getCostRequests(),
  });

  const costRequests = costRequestsData?.data || [];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.title || !formData.amount) {
      showNotification({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        type: 'error'
      });
      return;
    }

    try {
      await costRequestAPI.createCostRequest({
        ...formData,
        date: formData.date.toISOString().split('T')[0],
        amount: parseFloat(formData.amount)
      });
      
      showNotification({
        message: 'ส่งคำขอค่าใช้จ่ายสำเร็จ',
        type: 'success'
      });
      
      setShowModal(false);
      setFormData({
        date: new Date(),
        category: '',
        title: '',
        amount: '',
        description: ''
      });
      refetch();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งคำขอ',
        type: 'error'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">อนุมัติแล้ว</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">รออนุมัติ</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">ไม่อนุมัติ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = COST_CATEGORIES.find(c => c.value === category);
    return categoryData?.icon || FileText;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">คำขอค่าใช้จ่ายของฉัน</h1>
          <p className="text-gray-600">จัดการคำขอค่าใช้จ่ายและการอนุมัติ</p>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              สร้างคำขอใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                สร้างคำขอค่าใช้จ่าย
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">วันที่ *</Label>
                <DatePicker
                  date={formData.date}
                  onDateChange={(date) => handleInputChange('date', date)}
                  placeholder="เลือกวันที่"
                />
              </div>
              
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
              
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อรายการ *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="กรอกชื่อรายการค่าใช้จ่าย"
                />
              </div>
              
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
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex items-center"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  ส่งคำขอ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cost Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            รายการคำขอค่าใช้จ่าย
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : costRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">วันที่</th>
                    <th className="text-left p-2">หมวดหมู่</th>
                    <th className="text-left p-2">รายการ</th>
                    <th className="text-right p-2">จำนวนเงิน</th>
                    <th className="text-left p-2">สถานะ</th>
                    <th className="text-left p-2">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {costRequests.map((request: any) => {
                    const CategoryIcon = getCategoryIcon(request.category);
                    const categoryData = COST_CATEGORIES.find(c => c.value === request.category);
                    
                    return (
                      <tr key={request.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {format(new Date(request.date), 'dd/MM/yyyy', { locale: th })}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <CategoryIcon className="h-4 w-4 mr-2" />
                            <Badge variant="outline">{categoryData?.label || request.category}</Badge>
                          </div>
                        </td>
                        <td className="p-2">{request.title}</td>
                        <td className="p-2 text-right font-medium">
                          ฿{request.amount?.toLocaleString()}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request.status)}
                            {getStatusBadge(request.status)}
                          </div>
                        </td>
                        <td className="p-2 text-sm text-gray-500">
                          {request.rejectionReason || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีคำขอค่าใช้จ่าย</p>
              <Button 
                onClick={() => setShowModal(true)}
                className="mt-4"
              >
                สร้างคำขอแรก
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCostRequests;
