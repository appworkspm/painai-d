import React from 'react';
import { useQuery } from 'react-query';
import { timesheetAPI } from '../services/api';
import { BarChart3, Clock, Users, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data: timesheetsData, isLoading, isError } = useQuery(
    'dashboard-timesheets',
    () => timesheetAPI.getTimesheets({ limit: 10 }),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const timesheets = timesheetsData?.data || [];
  const totalTimesheets = timesheetsData?.pagination?.total || 0;

  // Calculate stats
  const totalHours = timesheets.reduce((sum: number, ts: any) => sum + Number(ts.hours_worked || 0) + Number(ts.overtime_hours || 0), 0);
  const projectWork = timesheets.filter((ts: any) => ts.work_type === 'PROJECT').length;
  const nonProjectWork = timesheets.filter((ts: any) => ts.work_type === 'NON_PROJECT').length;

  const stats = [
    {
      name: 'Total Timesheets',
      value: totalTimesheets,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Hours',
      value: Math.round(totalHours * 10) / 10,
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      name: 'Project Work',
      value: projectWork,
      icon: BarChart3,
      color: 'bg-purple-500',
    },
    {
      name: 'Non-Project Work',
      value: nonProjectWork,
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">ภาพรวมการทำงานของทีม</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Timesheets */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Timesheets</h3>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>
          ) : timesheets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No timesheets found</p>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timesheets.map((timesheet: any) => (
                    <tr key={timesheet.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {timesheet.user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {timesheet.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{timesheet.activity}</div>
                        <div className="text-sm text-gray-500">{timesheet.work_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {timesheet.project?.name || 'No Project'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Number(timesheet.hours_worked || 0) + Number(timesheet.overtime_hours || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {timesheet.date ? new Date(timesheet.date).toLocaleDateString() : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 