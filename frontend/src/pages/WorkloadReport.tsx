import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  CalendarDays, Clock, TrendingUp, Download,
  BarChart3, PieChart as PieChartIcon, Building2, UserCheck
} from 'lucide-react';
import { reportAPI } from '../services/api';

// Define types for the data used in the component
interface WorkType {
  name: string;
  hours: number;
  percentage: number;
  count: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string;
  hours: number;
  projects: number;
  timesheetCount: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  budget: number;
  customer: string;
  hours: number;
  users: number;
  timesheetCount: number;
}

interface Department {
  name: string;
  hours: number;
  users: number;
  userList: string[];
}

interface Summary {
  totalTimesheets: number;
  averageHoursPerTimesheet: number;
  mostActiveUser: User | null;
  mostActiveProject: Project | null;
  mostCommonWorkType: WorkType | null;
}

interface WorkloadData {
  totalHours: number;
  totalUsers: number;
  totalProjects: number;
  activeUsers: number;
  activeProjects: number;
  averageHoursPerUser: number;
  averageHoursPerProject: number;
  timeframe: string;
  dateRange: {
    start: string;
    end: string;
  };
  users: User[];
  departments: Department[];
  workTypes: WorkType[];
  topUsers: User[];
  topProjects: Project[];
  projects: Project[];
  summary: Summary;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const WorkloadReport: React.FC = () => {
  const [data, setData] = useState<WorkloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('week');
  const [showCharts, setShowCharts] = useState(true);
  // State for future filtering functionality
  const [_selectedDepartment, _setSelectedDepartment] = useState<string>('all');
  const [_selectedWorkType, _setSelectedWorkType] = useState<string>('all');

  useEffect(() => {
    fetchWorkloadData();
  }, [timeframe]);

  const fetchWorkloadData = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getWorkloadReport({ timeframe });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load workload data');
      console.error('Error fetching workload data:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      await reportAPI.exportWorkloadCSV({ timeframe });
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  // Filtered data for future filtering functionality
  // const filteredData = data ? {
  //   ...data,
  //   users: (data.users ?? []).filter(user => 
  //     (_selectedDepartment === 'all' || user.role === _selectedDepartment) && 
  //     (_selectedWorkType === 'all' || true)
  //   ),
  //   departments: (data.departments ?? []).filter(dept => 
  //     _selectedDepartment === 'all' || dept.name === _selectedDepartment
  //   ),
  //   workTypes: (data.workTypes ?? []).filter(type => 
  //     _selectedWorkType === 'all' || type.name === _selectedWorkType
  //   ),
  //   topUsers: (data.topUsers ?? []),
  //   topProjects: (data.topProjects ?? [])
  // } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchWorkloadData}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
            <p className="text-gray-600">No workload data found for the selected timeframe.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Workload Report</h1>
            <p className="text-gray-600">Comprehensive analysis of team workload and productivity</p>
            {data.dateRange && (
              <p className="text-sm text-gray-500 mt-1">
                {new Date(data.dateRange.start).toLocaleDateString()} - {new Date(data.dateRange.end).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showCharts ? <BarChart3 size={18} /> : <PieChartIcon size={18} />}
              {showCharts ? 'Hide Charts' : 'Show Charts'}
            </button>
          </div>
        </div>

        {/* Quick Timeframe Selector */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="text-blue-600" size={20} />
            <span className="font-semibold text-gray-700">Timeframe</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'week', label: 'This Week', icon: '📅' },
              { key: 'month', label: 'This Month', icon: '📆' },
              { key: 'quarter', label: 'This Quarter', icon: '📊' },
              { key: 'year', label: 'This Year', icon: '📈' }
            ].map(period => (
              <button
                key={period.key}
                onClick={() => setTimeframe(period.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  timeframe === period.key
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{period.icon}</span>
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalHours.toLocaleString()}</p>
              </div>
              <Clock className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{data.activeUsers} / {data.totalUsers}</p>
              </div>
              <UserCheck className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{data.activeProjects} / {data.totalProjects}</p>
              </div>
              <Building2 className="text-purple-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Hours/User</p>
                <p className="text-2xl font-bold text-gray-900">{data.averageHoursPerUser.toFixed(1)}</p>
              </div>
              <TrendingUp className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {showCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Work Types Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.workTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {data.workTypes.map((workType: WorkType, index: number) => (
                      <Cell key={`cell-${workType.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Users Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Users by Hours</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topUsers.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Users Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-right py-2">Hours</th>
                    <th className="text-right py-2">Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-2 text-sm text-gray-600">{user.role}</td>
                      <td className="py-2 text-right font-medium">{user.hours}</td>
                      <td className="py-2 text-right text-sm text-gray-600">{user.projects}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Projects Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Projects</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Project</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-right py-2">Hours</th>
                    <th className="text-right py-2">Users</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProjects.map((project) => (
                    <tr key={project.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.customer}</div>
                        </div>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'ACTIVE' || project.status === 'ON_GOING' 
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-2 text-right font-medium">{project.hours}</td>
                      <td className="py-2 text-right text-sm text-gray-600">{project.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Department Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.departments.map((dept) => (
              <div key={dept.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{dept.name}</h4>
                  <span className="text-sm text-gray-500">{dept.users} users</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">{dept.hours} hours</div>
                <div className="text-sm text-gray-600">
                  {dept.userList.slice(0, 3).join(', ')}
                  {dept.userList.length > 3 && ` +${dept.userList.length - 3} more`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.summary.totalTimesheets}</div>
              <div className="text-sm text-gray-600">Total Timesheets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.summary.averageHoursPerTimesheet.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Avg Hours/Timesheet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.summary.mostActiveUser?.name || 'N/A'}</div>
              <div className="text-sm text-gray-600">Most Active User</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.summary.mostActiveProject?.name || 'N/A'}</div>
              <div className="text-sm text-gray-600">Most Active Project</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadReport; 