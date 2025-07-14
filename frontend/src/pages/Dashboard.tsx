import React from 'react';
import { useQuery } from 'react-query';
import { timesheetAPI } from '../services/api';
import { BarChart3, Clock, Users, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data: timesheetsData, isLoading } = useQuery(
    'timesheets',
    () => timesheetAPI.getTimesheets({ limit: 10 }),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const timesheets = timesheetsData?.data?.data || [];
  const totalTimesheets = timesheetsData?.data?.pagination?.total || 0;

  // Calculate stats
  const totalHours = timesheets.reduce((sum: number, ts: any) => sum + (ts.duration || 0), 0);
  const projectWork = timesheets.filter((ts: any) => ts.activityType === 'PROJECT_WORK').length;
  const nonProjectWork = timesheets.filter((ts: any) => ts.activityType === 'NON_PROJECT_WORK').length;

  const stats = [
    {
      name: 'Total Timesheets',
      value: totalTimesheets,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Hours',
      value: Math.round(totalHours / 60 * 10) / 10,
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
                      Duration
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
                        <div className="text-sm text-gray-900">{timesheet.description}</div>
                        <div className="text-sm text-gray-500">{timesheet.activityType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {timesheet.project?.name || 'No Project'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {timesheet.duration ? `${Math.round(timesheet.duration / 60 * 10) / 10}h` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(timesheet.startTime).toLocaleDateString()}
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