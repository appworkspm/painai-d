import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { timesheetAPI } from '../services/api';
import { ActivityType } from '../types';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';

const Timesheets: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState<ActivityType | ''>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: timesheetsData, isLoading } = useQuery(
    ['timesheets', search, activityFilter],
    () => timesheetAPI.getTimesheets({ 
      search, 
      activityType: activityFilter || undefined,
      limit: 20 
    })
  );

  const createMutation = useMutation(timesheetAPI.createTimesheet, {
    onSuccess: () => {
      queryClient.invalidateQueries('timesheets');
      setShowCreateForm(false);
    },
  });

  const deleteMutation = useMutation(timesheetAPI.deleteTimesheet, {
    onSuccess: () => {
      queryClient.invalidateQueries('timesheets');
    },
  });

  const timesheets = timesheetsData?.data?.data || [];

  const handleCreateTimesheet = (formData: any) => {
    createMutation.mutate(formData);
  };

  const handleDeleteTimesheet = (id: string) => {
    if (window.confirm('Are you sure you want to delete this timesheet?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-gray-600">จัดการและดูรายการ timesheet</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Timesheet
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search timesheets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value as ActivityType | '')}
                className="input"
              >
                <option value="">All Activities</option>
                <option value={ActivityType.PROJECT_WORK}>Project Work</option>
                <option value={ActivityType.NON_PROJECT_WORK}>Non-Project Work</option>
                <option value={ActivityType.MEETING}>Meeting</option>
                <option value={ActivityType.BREAK}>Break</option>
                <option value={ActivityType.OTHER}>Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Timesheets List */}
      <div className="card">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteTimesheet(timesheet.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Timesheet Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Timesheet</h3>
              <CreateTimesheetForm
                onSubmit={handleCreateTimesheet}
                onCancel={() => setShowCreateForm(false)}
                loading={createMutation.isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Timesheet Form Component
interface CreateTimesheetFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const CreateTimesheetForm: React.FC<CreateTimesheetFormProps> = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    activityType: ActivityType.PROJECT_WORK,
    description: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    duration: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Activity Type</label>
        <select
          value={formData.activityType}
          onChange={(e) => setFormData({ ...formData, activityType: e.target.value as ActivityType })}
          className="input"
          required
        >
          <option value={ActivityType.PROJECT_WORK}>Project Work</option>
          <option value={ActivityType.NON_PROJECT_WORK}>Non-Project Work</option>
          <option value={ActivityType.MEETING}>Meeting</option>
          <option value={ActivityType.BREAK}>Break</option>
          <option value={ActivityType.OTHER}>Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
        <input
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          className="input"
          placeholder="Optional"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Timesheet'}
        </button>
      </div>
    </form>
  );
};

export default Timesheets; 