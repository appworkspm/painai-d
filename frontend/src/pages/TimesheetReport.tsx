import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Clock, BarChart3, CheckCircle, AlertCircle, Download, Filter, Calendar, TrendingUp, RefreshCw, FileText } from 'lucide-react';
import { reportAPI } from '../services/api';

const TimesheetReport: React.FC = () => {
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
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedWorkType, setSelectedWorkType] = useState('all');
  const [selectedSubWorkType, setSelectedSubWorkType] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState('all');

  useEffect(() => {
    loadTimesheetReport();
    // eslint-disable-next-line
  }, [dateRange, selectedStatus, selectedProject, selectedWorkType, selectedSubWorkType, selectedActivity]);

  const loadTimesheetReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange.start && dateRange.end) {
        params.start = dateRange.start;
        params.end = dateRange.end;
      }
      if (selectedStatus && selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      if (selectedProject && selectedProject !== 'all') {
        params.project = selectedProject;
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
      const response = await reportAPI.getTimesheetReport(params);
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
        status: selectedStatus,
        project: selectedProject,
        workType: selectedWorkType,
        subWorkType: selectedSubWorkType,
        activity: selectedActivity
      };
      await reportAPI.exportTimesheetCSV(params);
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
    setSelectedStatus('all');
    setSelectedProject('all');
    setSelectedWorkType('all');
    setSelectedSubWorkType('all');
    setSelectedActivity('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedStatus !== 'all') count++;
    if (selectedProject !== 'all') count++;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
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
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">รายงานไทม์ชีท</h1>
                <p className="text-sm text-gray-500">Timesheet Report</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="APPROVED">อนุมัติแล้ว</option>
                  <option value="PENDING">รออนุมัติ</option>
                  <option value="REJECTED">ไม่อนุมัติ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">โครงการ</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">ทุกโครงการ</option>
                  <option value="Non-Project">ไม่ใช่งานโครงการ</option>
                  {/* TODO: Add dynamic project list */}
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
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">รายการรวม</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(reportData.totalEntries || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">อนุมัติแล้ว</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(reportData.approvedEntries || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">รออนุมัติ</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(reportData.pendingEntries || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600" />
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

            {/* Status Breakdown */}
            {reportData.statusBreakdown && reportData.statusBreakdown.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">สรุปตามสถานะ</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reportData.statusBreakdown.map((status: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{status.status}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status.status)}`}>
                            {formatNumber(status.count)} รายการ
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">เปอร์เซ็นต์:</span>
                            <span className="font-medium">{status.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${status.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Projects Breakdown */}
            {reportData.projects && reportData.projects.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">สรุปตามโครงการ</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          โครงการ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          รายการ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ชั่วโมง
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เฉลี่ย/รายการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.projects.map((project: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProjectStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(project.entries)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatHours(project.hours)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatHours(project.entries > 0 ? project.hours / project.entries : 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Users */}
            {reportData.topUsers && reportData.topUsers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">ผู้ใช้งานที่มีรายการสูงสุด</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.topUsers.map((user: any, index: number) => (
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
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">รายการ:</span>
                            <span className="font-medium">{formatNumber(user.entries)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">ชั่วโมง:</span>
                            <span className="font-medium">{formatHours(user.hours)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">อัตราการอนุมัติ:</span>
                            <span className="font-medium">{user.approvalRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${user.approvalRate}%` }}
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

export default TimesheetReport; 