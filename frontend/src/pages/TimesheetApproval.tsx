import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CheckCircle, XCircle, Clock, User, Calendar, FileText, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { timesheetAPI } from '../services/api';

const TimesheetApproval: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  
  const [filter, setFilter] = useState('pending');
  const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Fetch real timesheet data
  const statusMap: Record<string, string | undefined> = {
    pending: 'submitted',
    approved: 'approved',
    rejected: 'rejected',
    all: undefined
  };

  const { data: timesheetsData, isLoading } = useQuery(
    ['timesheets-approval', filter],
    () => timesheetAPI.getTimesheets({ 
      limit: 100, 
      status: statusMap[filter]
    }),
    {
      refetchInterval: 30000,
    }
  );

  const timesheets = timesheetsData?.data || [];

  // Approve mutation
  const approveMutation = useMutation(
    (timesheetId: string) => timesheetAPI.approveTimesheet(timesheetId),
    {
      onSuccess: () => {
        showNotification({
          message: 'Timesheet approved successfully',
          type: 'success'
        });
        queryClient.invalidateQueries(['timesheets-approval']);
      },
      onError: (error: any) => {
        showNotification({
          message: 'Failed to approve timesheet',
          description: error.response?.data?.message || 'An error occurred',
          type: 'error'
        });
      }
    }
  );

  // Reject mutation
  const rejectMutation = useMutation(
    ({ timesheetId, reason }: { timesheetId: string; reason: string }) => 
      timesheetAPI.rejectTimesheet(timesheetId, { reason }),
    {
      onSuccess: () => {
        showNotification({
          message: 'Timesheet rejected successfully',
          type: 'success'
        });
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedTimesheet(null);
        queryClient.invalidateQueries(['timesheets-approval']);
      },
      onError: (error: any) => {
        showNotification({
          message: 'Failed to reject timesheet',
          description: error.response?.data?.message || 'An error occurred',
          type: 'error'
        });
      }
    }
  );

  const handleApprove = async (timesheetId: string) => {
    if (window.confirm('Are you sure you want to approve this timesheet?')) {
      approveMutation.mutate(timesheetId);
    }
  };

  const handleReject = (timesheet: any) => {
    setSelectedTimesheet(timesheet);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      showNotification({
        message: 'Please provide a rejection reason',
        type: 'error'
      });
      return;
    }
    
    if (selectedTimesheet) {
      rejectMutation.mutate({
        timesheetId: selectedTimesheet.id,
        reason: rejectReason
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkTypeColor = (type: string) => {
    switch (type) {
      case 'PROJECT':
        return 'bg-blue-100 text-blue-800';
      case 'NON_PROJECT':
        return 'bg-purple-100 text-purple-800';
      case 'LEAVE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  };

  const filteredTimesheets = timesheets.filter(ts => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ts.status?.toUpperCase() === 'SUBMITTED';
    return ts.status?.toUpperCase() === filter.toUpperCase();
  });

  const stats = {
    pending: timesheets.filter(ts => ts.status?.toUpperCase() === 'SUBMITTED').length,
    approved: timesheets.filter(ts => ts.status?.toUpperCase() === 'APPROVED').length,
    rejected: timesheets.filter(ts => ts.status?.toUpperCase() === 'REJECTED').length,
    total: timesheets.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Timesheet Approval</h1>
            <p className="text-gray-600 mt-1">จัดการการอนุมัติ timesheet ของทีม</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="text-sm font-medium">{showDetails ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">รออนุมัติ</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">อนุมัติแล้ว</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">ไม่อนุมัติ</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">รายการ Timesheet</h2>
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">รออนุมัติ</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="rejected">ไม่อนุมัติ</option>
                <option value="all">ทั้งหมด</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredTimesheets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium">ไม่พบ timesheet</p>
              <p className="text-sm">ไม่มี timesheet ที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTimesheets.map((timesheet) => (
                <div key={timesheet.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* User Info */}
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {timesheet.user?.name || 'Unknown User'}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(timesheet.status)}`}>
                            {timesheet.status}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getWorkTypeColor(timesheet.work_type)}`}>
                            {timesheet.work_type?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">กิจกรรม:</span> {timesheet.activity || 'No activity'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">โครงการ:</span> {timesheet.project?.name || 'No Project'}
                          </p>
                          {timesheet.description && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">รายละเอียด:</span> {timesheet.description}
                            </p>
                          )}
                          {timesheet.rejection_reason && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-800">
                                <span className="font-medium">เหตุผลการไม่อนุมัติ:</span> {timesheet.rejection_reason}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {timesheet.date ? new Date(timesheet.date).toLocaleDateString('th-TH') : 'No date'}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDuration(Number(timesheet.hours_worked || 0) + Number(timesheet.overtime_hours || 0))}
                          </span>
                          {timesheet.createdAt && (
                            <span className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              ส่งเมื่อ {new Date(timesheet.createdAt).toLocaleString('th-TH')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {timesheet.status?.toUpperCase() === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleApprove(timesheet.id)}
                            disabled={approveMutation.isLoading}
                            className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleReject(timesheet)}
                            disabled={rejectMutation.isLoading}
                            className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            ไม่อนุมัติ
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">ไม่อนุมัติ Timesheet</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedTimesheet(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  กรุณาระบุเหตุผลในการไม่อนุมัติ timesheet ของ {selectedTimesheet?.user?.name}
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="ระบุเหตุผลการไม่อนุมัติ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleRejectSubmit}
                  disabled={rejectMutation.isLoading || !rejectReason.trim()}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {rejectMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังส่ง...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      ไม่อนุมัติ
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedTimesheet(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetApproval; 