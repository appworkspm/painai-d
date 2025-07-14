import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Activity, User, Clock, Download, Eye } from 'lucide-react';
import { adminAPI } from '../services/api';

const UserActivity: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedUser, setSelectedUser] = useState('all');

  useEffect(() => {
    loadUserActivities();
  }, []);

  const loadUserActivities = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUserActivities();
      if (response.success && response.data) {
        setActivities(response.data);
      } else {
        // Mock data for demonstration
        setActivities([
          {
            id: '1',
            userId: '1',
            userName: 'John Doe',
            userEmail: 'john.doe@example.com',
            action: 'LOGIN',
            description: 'User logged in successfully',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            timestamp: '2024-01-15T14:30:25Z',
            status: 'SUCCESS'
          },
          {
            id: '2',
            userId: '2',
            userName: 'Jane Smith',
            userEmail: 'jane.smith@example.com',
            action: 'TIMESHEET_CREATE',
            description: 'Created new timesheet entry',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            timestamp: '2024-01-15T13:45:12Z',
            status: 'SUCCESS'
          },
          {
            id: '3',
            userId: '1',
            userName: 'John Doe',
            userEmail: 'john.doe@example.com',
            action: 'USER_CREATE',
            description: 'Created new user: mike.johnson@example.com',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            timestamp: '2024-01-15T12:20:45Z',
            status: 'SUCCESS'
          },
          {
            id: '4',
            userId: '3',
            userName: 'Mike Johnson',
            userEmail: 'mike.johnson@example.com',
            action: 'LOGIN_FAILED',
            description: 'Failed login attempt - incorrect password',
            ipAddress: '192.168.1.102',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)',
            timestamp: '2024-01-15T11:15:30Z',
            status: 'FAILED'
          },
          {
            id: '5',
            userId: '2',
            userName: 'Jane Smith',
            userEmail: 'jane.smith@example.com',
            action: 'TIMESHEET_APPROVE',
            description: 'Approved timesheet for user: mike.johnson@example.com',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            timestamp: '2024-01-15T10:30:15Z',
            status: 'SUCCESS'
          }
        ]);
      }
    } catch (error) {
      showNotification({
        message: 'Failed to load user activities',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-green-100 text-green-800';
      case 'LOGOUT':
        return 'bg-blue-100 text-blue-800';
      case 'TIMESHEET_CREATE':
      case 'TIMESHEET_UPDATE':
        return 'bg-purple-100 text-purple-800';
      case 'TIMESHEET_APPROVE':
      case 'TIMESHEET_REJECT':
        return 'bg-yellow-100 text-yellow-800';
      case 'USER_CREATE':
      case 'USER_UPDATE':
      case 'USER_DELETE':
        return 'bg-red-100 text-red-800';
      case 'LOGIN_FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'FAILED':
        return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
      case 'WARNING':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.action.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = selectedUser === 'all' || activity.userId === selectedUser;
    const matchesDateRange = (!dateRange.start || activity.timestamp >= dateRange.start) &&
                           (!dateRange.end || activity.timestamp <= dateRange.end);
    
    return matchesFilter && matchesSearch && matchesUser && matchesDateRange;
  });

  const handleExport = () => {
    // TODO: Implement export functionality
    showNotification({
      message: 'Export functionality coming soon',
      type: 'info'
    });
  };

  const uniqueUsers = Array.from(new Set(activities.map(a => ({ id: a.userId, name: a.userName, email: a.userEmail }))));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">User Activity</h1>
        </div>
        <button 
          onClick={handleExport}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Activities</p>
              <p className="text-2xl font-bold text-gray-900">
                {activities.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed Actions</p>
              <p className="text-2xl font-bold text-gray-900">
                {activities.filter(a => a.status === 'FAILED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Activity Log</h2>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
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
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Users</option>
                {uniqueUsers.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="timesheet">Timesheet</option>
                <option value="user">User Management</option>
                <option value="failed">Failed Actions</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No activities found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{activity.userName}</div>
                          <div className="text-sm text-gray-500">{activity.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(activity.action)}`}>
                        {activity.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(activity.status)}
                        <span className="ml-2 text-sm text-gray-900">{activity.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </button>
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

export default UserActivity; 