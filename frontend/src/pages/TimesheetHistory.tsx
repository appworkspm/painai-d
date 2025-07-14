import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Clock, Search, Filter, Download, Eye, Calendar } from 'lucide-react';
import api from '../services/api';

const TimesheetHistory: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadTimesheetHistory();
  }, []);

  const loadTimesheetHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/timesheets/history');
      if (response.data.success) {
        setTimesheets(response.data.data);
      }
    } catch (error) {
      showNotification({
        message: 'Failed to load timesheet history',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
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

  const filteredTimesheets = timesheets.filter(timesheet => {
    const matchesFilter = filter === 'all' || timesheet.status.toLowerCase() === filter;
    const matchesSearch = timesheet.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timesheet.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateRange = (!dateRange.start || timesheet.date >= dateRange.start) &&
                           (!dateRange.end || timesheet.date <= dateRange.end);
    
    return matchesFilter && matchesSearch && matchesDateRange;
  });

  const handleExport = () => {
    // TODO: Implement export functionality
    showNotification({
      message: 'Export functionality coming soon',
      type: 'info'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Timesheet History</h1>
        </div>
        <button 
          onClick={handleExport}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">All Timesheets</h2>
            <div className="flex space-x-2">
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
              <input
                type="text"
                placeholder="Search timesheets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTimesheets.map((timesheet) => (
                  <tr key={timesheet.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(timesheet.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{timesheet.project?.name}</div>
                      <div className="text-sm text-gray-500">{timesheet.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {timesheet.hours} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(timesheet.status)}`}>
                        {timesheet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(timesheet.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View
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

export default TimesheetHistory; 