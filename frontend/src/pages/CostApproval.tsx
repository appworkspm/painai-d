import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  AlertCircle,
  Package,
  Building,
  Receipt,
  ShoppingCart,
  Truck,
  CreditCard,
  Wrench,
  Plane,
  Clock,
  User
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
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const CostApproval = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending cost requests
  const { data: costRequestsData, isLoading, refetch } = useQuery({
    queryKey: ['pending-cost-requests'],
    queryFn: () => costRequestAPI.getCostRequests({ status: 'PENDING' }),
  });

  const costRequests = costRequestsData?.data || [];

  const handleApprove = async (request: any) => {
    try {
      await costRequestAPI.approveCostRequest(request.id, { status: 'APPROVED' });
      showNotification({
        message: 'อนุมัติคำขอสำเร็จ',
        type: 'success'
      });
      refetch();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติ',
        type: 'error'
      });
    }
  };

  const handleReject = (request: any) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      showNotification({
        message: 'กรุณากรอกเหตุผลที่ไม่อนุมัติ',
        type: 'error'
      });
      return;
    }

    try {
      await costRequestAPI.approveCostRequest(selectedRequest.id, { 
        status: 'REJECTED', 
        rejectionReason: rejectionReason 
      });
      showNotification({
        message: 'ปฏิเสธคำขอแล้ว',
        type: 'success'
      });
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      refetch();
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธ',
        type: 'error'
      });
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
          <h1 className="text-3xl font-bold text-gray-900">อนุมัติค่าใช้จ่าย</h1>
          <p className="text-gray-600">จัดการคำขอค่าใช้จ่ายที่รอการอนุมัติ</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4 mr-1" />
            {costRequests.length} รายการรออนุมัติ
          </Badge>
        </div>
      </div>

      {/* Cost Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            คำขอที่รอการอนุมัติ
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
                    <th className="text-left p-2">การดำเนินการ</th>
                    <th className="text-left p-2">วันที่</th>
                    <th className="text-left p-2">หมวดหมู่</th>
                    <th className="text-left p-2">รายการ</th>
                    <th className="text-right p-2">จำนวนเงิน</th>
                    <th className="text-left p-2">ผู้ขอ</th>
                    <th className="text-left p-2">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {costRequests.map((request: any) => {
                    const CategoryIcon = getCategoryIcon(request.category);
                    const categoryData = COST_CATEGORIES.find(c => c.value === request.category);
                    
                    return (
                      <tr key={request.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request)}
                              className="flex items-center bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(request)}
                              className="flex items-center text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              ไม่อนุมัติ
                            </Button>
                          </div>
                        </td>
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
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            {request.requesterName || request.user?.name || 'ไม่ระบุ'}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-4 w-4 mr-1" />
                            รออนุมัติ
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-500">ไม่มีคำขอที่รอการอนุมัติ</p>
              <p className="text-sm text-gray-400 mt-2">ทุกคำขอได้รับการอนุมัติแล้ว</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-red-600" />
              เหตุผลที่ไม่อนุมัติ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">รายละเอียดคำขอ</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">รายการ:</span> {selectedRequest.title}</p>
                  <p><span className="font-medium">จำนวนเงิน:</span> ฿{selectedRequest.amount?.toLocaleString()}</p>
                  <p><span className="font-medium">ผู้ขอ:</span> {selectedRequest.requesterName || selectedRequest.user?.name || 'ไม่ระบุ'}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">เหตุผลที่ไม่อนุมัติ *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="กรอกเหตุผลที่ไม่อนุมัติคำขอนี้"
                rows={4}
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleRejectSubmit}
                className="flex items-center bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                ยืนยันการไม่อนุมัติ
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CostApproval;
