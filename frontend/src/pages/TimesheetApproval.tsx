import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { CheckCircle, XCircle, Clock, User, Calendar, FileText } from 'lucide-react';
import { timesheetAPI } from '../services/api';

const TimesheetApproval: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadTimesheets();
  }, [filter]);

  const loadTimesheets = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockData = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          projectId: 'project1',
          projectName: 'Project A',
          activityType: 'PROJECT_WORK',
          description: 'Developed new feature',
          startTime: '2024-01-15T09:00:00Z',
          endTime: '2024-01-15T17:00:00Z',
          duration: 8,
          status: 'PENDING',
          createdAt: '2024-01-15T18:00:00Z'
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Jane Smith',
          projectId: 'project2',
          projectName: 'Project B',
          activityType: 'MEETING',
          description: 'Team meeting',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T11:00:00Z',
          duration: 1,
          status: 'APPROVED',
          createdAt: '2024-01-15T12:00:00Z'
        }
      ];
      setTimesheets(mockData);
    } catch (error) {
      showNotification({
        message: 'Failed to load timesheets',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (timesheetId: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTimesheets(prev => 
        prev.map(ts => 
          ts.id === timesheetId 
            ? { ...ts, status: 'APPROVED' }
            : ts
        )
      );
      
      showNotification({
        message: 'Timesheet approved successfully',
        type: 'success'
      });
    } catch (error) {
      showNotification({
        message: 'Failed to approve timesheet',
        type: 'error'
      });
    }
  };

  const handleReject = async (timesheetId: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTimesheets(prev => 
        prev.map(ts => 
          ts.id === timesheetId 
            ? { ...ts, status: 'REJECTED' }
            : ts
        )
      );
      
      showNotification({
        message: 'Timesheet rejected',
        type: 'success'
      });
    } catch (error) {
      showNotification({
        message: 'Failed to reject timesheet',
        type: 'error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'PROJECT_WORK':
        return 'bg-blue-100 text-blue-800';
      case 'MEETING':
        return 'bg-purple-100 text-purple-800';
      case 'BREAK':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTimesheets = timesheets.filter(ts => {
    if (filter === 'all') return true;
    return ts.status === filter.toUpperCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-8 w-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Timesheet Approval</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Pending Approvals</h2>
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredTimesheets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No timesheets found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTimesheets.map((timesheet) => (
                  <tr key={timesheet.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {timesheet.userName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{timesheet.projectName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivityTypeColor(timesheet.activityType)}`}>
                          {timesheet.activityType.replace('_', ' ')}
                        </span>
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {timesheet.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {timesheet.duration} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(timesheet.status)}`}>
                        {timesheet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(timesheet.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {timesheet.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(timesheet.id)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(timesheet.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimesheetApproval; 