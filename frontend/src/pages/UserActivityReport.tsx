import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Activity, Users, TrendingUp, Download, Calendar, BarChart3, Filter, RefreshCw, UserCheck } from 'lucide-react';
import { reportAPI } from '../services/api';

const UserActivityReport: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Default filters - 30 days from today
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [dateRange, setDateRange] = useState({ 
    start: thirtyDaysAgo.toISOString().split('T')[0], 
    end: today.toISOString().split('T')[0] 
  });
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedWorkType, setSelectedWorkType] = useState('all');
  const [selectedSubWorkType, setSelectedSubWorkType] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState('all');

  useEffect(() => {
    loadUserActivityReport();
    // eslint-disable-next-line
  }, [dateRange, selectedUser, selectedAction, selectedWorkType, selectedSubWorkType, selectedActivity]);

  const loadUserActivityReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange.start && dateRange.end) {
        params.start = dateRange.start;
        params.end = dateRange.end;
      }
      if (selectedUser && selectedUser !== 'all') {
        params.user_id = selectedUser;
      }
      if (selectedAction && selectedAction !== 'all') {
        params.action = selectedAction;
      }
      if (selectedWorkType && selectedWorkType !== 'all') {
        params.workType = selectedWorkType;
      }
      if (selectedSubWorkType && selectedSubWorkType !== 'all') {
        params.subWorkType = selectedSubWorkType;
      }
      if (selectedActivity && selectedActivity !== 'all') {
        params.activity = selectedActivity;
      }
      const response = await reportAPI.getUserActivityReport(params);
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setReportData(null);
        showNotification({
          message: response.data.message || 'ไม่สามารถโหลดรายงานได้',
          type: 'error'
        });
      }
    } catch (error) {
      setReportData(null);
      showNotification({
        message: 'ไม่สามารถโหลดรายงานได้',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const params = {
        start: dateRange.start,
        end: dateRange.end,
        user: selectedUser,
        action: selectedAction,
        workType: selectedWorkType,
        subWorkType: selectedSubWorkType,
        activity: selectedActivity
      };
      await reportAPI.exportUserActivityCSV(params);
      showNotification({
        message: 'Export completed successfully',
        type: 'success'
      });
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || 'Failed to export report',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setDateRange({ 
      start: thirtyDaysAgo.toISOString().split('T')[0], 
      end: today.toISOString().split('T')[0] 
    });
    setSelectedUser('all');
    setSelectedAction('all');
    setSelectedWorkType('all');
    setSelectedSubWorkType('all');
    setSelectedActivity('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedUser !== 'all') count++;
    if (selectedAction !== 'all') count++;
    if (selectedWorkType !== 'all') count++;
    if (selectedSubWorkType !== 'all') count++;
    if (selectedActivity !== 'all') count++;
    return count;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  const formatHours = (hours: number) => {
    return `${formatNumber(hours)} ชั่วโมง`;
  };

  const formatPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-green-100 text-green-800';
      case 'LOGOUT':
        return 'bg-red-100 text-red-800';
      case 'TIMESHEET_CREATE':
        return 'bg-blue-100 text-blue-800';
      case 'TIMESHEET_UPDATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'TIMESHEET_APPROVE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">รายงานกิจกรรมผู้ใช้</h1>
                <p className="text-sm text-gray-500">User Activity Report</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="h-4 w-4" />
                ตัวกรอง
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                รีเซ็ต
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled={loading || !reportData}
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ช่วงวันที่</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="flex items-center text-gray-500">ถึง</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ผู้ใช้</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">ทุกผู้ใช้</option>
                  {/* TODO: Add dynamic user list */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">การกระทำ</label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">ทุกการกระทำ</option>
                  <option value="LOGIN">เข้าสู่ระบบ</option>
                  <option value="LOGOUT">ออกจากระบบ</option>
                  <option value="TIMESHEET_CREATE">สร้างไทม์ชีท</option>
                  <option value="TIMESHEET_UPDATE">แก้ไขไทม์ชีท</option>
                  <option value="TIMESHEET_APPROVE">อนุมัติไทม์ชีท</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทงาน</label>
                <select
                  value={selectedWorkType}
                  onChange={(e) => {
                    setSelectedWorkType(e.target.value);
                    setSelectedSubWorkType('all');
                    setSelectedActivity('all');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">ทุกประเภท</option>
                  <option value="Project">งานโครงการ</option>
                  <option value="Non-Project">ไม่ใช่งานโครงการ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทย่อย</label>
                <select
                  value={selectedSubWorkType}
                  onChange={(e) => {
                    setSelectedSubWorkType(e.target.value);
                    setSelectedActivity('all');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={selectedWorkType === 'all'}
                >
                  <option value="all">ทุกประเภทย่อย</option>
                  {selectedWorkType === 'Project' && (
                    <>
                      <option value="Development">การพัฒนา</option>
                      <option value="Testing">การทดสอบ</option>
                      <option value="Design">การออกแบบ</option>
                      <option value="Documentation">เอกสาร</option>
                      <option value="Meeting">การประชุม</option>
                      <option value="Research">การวิจัย</option>
                    </>
                  )}
                  {selectedWorkType === 'Non-Project' && (
                    <>
                      <option value="Administrative">งานบริหาร</option>
                      <option value="Training">การฝึกอบรม</option>
                      <option value="Maintenance">การบำรุงรักษา</option>
                      <option value="Support">การสนับสนุน</option>
                      <option value="Break">พักผ่อน</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">กิจกรรม</label>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={selectedSubWorkType === 'all'}
                >
                  <option value="all">ทุกกิจกรรม</option>
                  {selectedSubWorkType === 'Development' && (
                    <>
                      <option value="Coding">การเขียนโค้ด</option>
                      <option value="Debugging">การแก้ไขบั๊ก</option>
                      <option value="Code Review">การรีวิวโค้ด</option>
                      <option value="Refactoring">การปรับปรุงโค้ด</option>
                    </>
                  )}
                  {selectedSubWorkType === 'Testing' && (
                    <>
                      <option value="Unit Testing">การทดสอบหน่วย</option>
                      <option value="Integration Testing">การทดสอบบูรณาการ</option>
                      <option value="Manual Testing">การทดสอบด้วยมือ</option>
                      <option value="Test Planning">การวางแผนทดสอบ</option>
                    </>
                  )}
                  {selectedSubWorkType === 'Design' && (
                    <>
                      <option value="UI/UX Design">การออกแบบ UI/UX</option>
                      <option value="System Design">การออกแบบระบบ</option>
                      <option value="Database Design">การออกแบบฐานข้อมูล</option>
                      <option value="Architecture Design">การออกแบบสถาปัตยกรรม</option>
                    </>
                  )}
                  {selectedSubWorkType === 'Documentation' && (
                    <>
                      <option value="Technical Documentation">เอกสารเทคนิค</option>
                      <option value="User Manual">คู่มือผู้ใช้</option>
                      <option value="API Documentation">เอกสาร API</option>
                      <option value="Requirements Documentation">เอกสารความต้องการ</option>
                    </>
                  )}
                  {selectedSubWorkType === 'Meeting' && (
                    <>
                      <option value="Project Meeting">การประชุมโครงการ</option>
                      <option value="Client Meeting">การประชุมลูกค้า</option>
                      <option value="Team Meeting">การประชุมทีม</option>
                      <option value="Planning Meeting">การประชุมวางแผน</option>
                    </>
                  )}
                  {selectedSubWorkType === 'Research' && (
                    <>
                      <option value="Technology Research">การวิจัยเทคโนโลยี</option>
                      <option value="Market Research">การวิจัยตลาด</option>
                      <option value="Best Practices Research">การวิจัยแนวทางปฏิบัติ</option>
                      <option value="Competitor Analysis">การวิเคราะห์คู่แข่ง</option>
                    </>
                  )}
                  {selectedSubWorkType === 'Administrative' && (
                    <>
                      <option value="Email Management">การจัดการอีเมล</option>
                      <option value="Report Writing">การเขียนรายงาน</option>
                      <option value="Planning">การวางแผน</option>
                      <option value="Administrative Tasks">งานบริหาร</option>
                    </>
                  )}
                  {selectedSubWorkType === 'Training' && (
                    <>
                      <option value="Skill Development">การพัฒนาทักษะ</option>
                      <option value="Workshop">การประชุมเชิงปฏิบัติการ</option>
                      <option value="Online Course">หลักสูตรออนไลน์</option>
                      <option value="Knowledge Sharing">การแบ่งปันความรู้</option>
                    </>
                  )}
                  {selectedSubWorkType === 'Maintenance' && (
                    <>
                      <option value="System Maintenance">การบำรุงรักษาระบบ</option>
                      <option value="Bug Fixes">การแก้ไขบั๊ก</option>
                      <option value="Performance Optimization">การปรับปรุงประสิทธิภาพ</option>
                      <option value="Security Updates">การอัปเดตความปลอดภัย</option>
                    </>
                  )}
                  {selectedSubWorkType === 'Support' && (
                    <>
                      <option value="Technical Support">การสนับสนุนเทคนิค</option>
                      <option value="User Support">การสนับสนุนผู้ใช้</option>
                      <option value="Troubleshooting">การแก้ไขปัญหา</option>
                      <option value="Issue Resolution">การแก้ไขปัญหา</option>
                    </>
                  )}
                  {selectedSubWorkType === 'Break' && (
                    <>
                      <option value="Lunch Break">พักเที่ยง</option>
                      <option value="Coffee Break">พักกาแฟ</option>
                      <option value="Rest Break">พักผ่อน</option>
                      <option value="Personal Time">เวลาส่วนตัว</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && !reportData && (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูล</h3>
            <p className="text-gray-500">ไม่พบข้อมูลรายงานในช่วงเวลาที่เลือก</p>
          </div>
        )}

        {/* Report Content */}
        {!loading && reportData && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">กิจกรรมรวม</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(reportData.totalActivities || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">ผู้ใช้งาน</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(reportData.totalUsers || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">ผู้ใช้งานที่ใช้งาน</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(reportData.activeUsers || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">ชั่วโมงรวม</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatHours(reportData.totalHours || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Breakdown */}
            {reportData.actionBreakdown && reportData.actionBreakdown.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">สรุปตามการกระทำ</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.actionBreakdown.map((action: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{action.action}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(action.action)}`}>
                            {formatNumber(action.count)} ครั้ง
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">เปอร์เซ็นต์:</span>
                            <span className="font-medium">{action.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${action.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* User Activity Summary */}
            {reportData.userStats && reportData.userStats.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">สรุปกิจกรรมผู้ใช้</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ผู้ใช้
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          แผนก
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          กิจกรรม
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ชั่วโมง
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          การอนุมัติ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.userStats.map((user: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(user.activities)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatHours(user.hours)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(user.approvals)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Active Users */}
            {reportData.topActiveUsers && reportData.topActiveUsers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">ผู้ใช้งานที่มีกิจกรรมสูงสุด</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.topActiveUsers.map((user: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{user.name}</h4>
                              <p className="text-sm text-gray-500">{user.department}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">กิจกรรม:</span>
                            <span className="font-medium">{formatNumber(user.activities)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">ชั่วโมง:</span>
                            <span className="font-medium">{formatHours(user.hours)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">การเข้าสู่ระบบ:</span>
                            <span className="font-medium">{formatNumber(user.logins)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${formatPercentage(user.activities, Math.max(...reportData.topActiveUsers.map((u: any) => u.activities)))}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivityReport; 