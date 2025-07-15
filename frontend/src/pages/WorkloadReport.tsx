import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { BarChart3, TrendingUp, Users, Clock, Download, Calendar } from 'lucide-react';
import { reportAPI } from '../services/api';

const WorkloadReport: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    loadWorkloadReport();
    // eslint-disable-next-line
  }, [dateRange, selectedDepartment]);

  const loadWorkloadReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange.start && dateRange.end) {
        params.start = dateRange.start;
        params.end = dateRange.end;
      }
      if (selectedDepartment && selectedDepartment !== 'all') {
        params.department = selectedDepartment;
      }
      const response = await api.get('/reports/workload', { params });
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
        department: selectedDepartment
      };
      await reportAPI.exportWorkloadCSV(params);
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

  const filteredDepartments = reportData?.departments?.filter((dept: any) => 
    selectedDepartment === 'all' || dept.name.toLowerCase().includes(selectedDepartment.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Workload Report</h1>
        </div>
        <button 
          onClick={handleExport}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
          disabled={loading || !reportData}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Departments</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="USER">User</option>
          </select>
        </div>
      </div>

      {/* Loading/Error State */}
      {loading && <div className="text-center py-10 text-gray-500">Loading...</div>}
      {!loading && !reportData && <div className="text-center py-10 text-red-500">ไม่พบข้อมูลรายงาน</div>}

      {/* Key Metrics */}
      {!loading && reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.totalHours?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Hours/Week</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.averageHoursPerWeek || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.activeUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Workload */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Workload by Department</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {filteredDepartments.map((dept: any) => (
                <div key={dept.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{dept.name}</h4>
                    <span className="text-sm text-gray-500">{dept.userCount} users</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Hours</span>
                      <span className="font-medium">{dept.totalHours}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Average Hours</span>
                      <span className="font-medium">{dept.averageHours}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(dept.totalHours / reportData?.totalHours) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Weekly Trend</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {reportData?.weeklyData?.map((week: any) => (
                <div key={week.week} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{week.week}</h4>
                    <span className="text-sm text-gray-500">{week.users} users</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Hours</span>
                      <span className="font-medium">{week.hours}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(week.hours / Math.max(...reportData?.weeklyData?.map((w: any) => w.hours) || [0])) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Users by Hours</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData?.topUsers?.map((user: any, index: number) => (
                <tr key={user.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.hours} hours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${(user.hours / Math.max(...reportData?.topUsers?.map((u: any) => u.hours) || [0])) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {((user.hours / reportData?.totalHours) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkloadReport; 