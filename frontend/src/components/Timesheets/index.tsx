import React, { useState, useEffect, useCallback } from 'react';
import { Card, message } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { 
  Timesheet, 
  TimesheetFormValues, 
  TimesheetStatus,
  TimesheetsState,
  Project
} from './types';
import { 
  getTimesheets, 
  createTimesheet as createTimesheetAPI, 
  updateTimesheet as updateTimesheetAPI, 
  deleteTimesheet as deleteTimesheetAPI,
  getProjects as getProjectsAPI
} from './api';
import { 
  calculateTotalHours, 
  filterTimesheetsByDateRange,
  mapToFormValues,
  getInitialFormValues
} from './utils';
import StatsPanel from './StatsPanel';
import TimesheetTable from './TimesheetTable';
import TimesheetForm from './TimesheetForm';
import FiltersPanel from './FiltersPanel';
import './index.css';

// Initial state
const initialState: TimesheetsState = {
  timesheets: [],
  projects: [],
  loading: false,
  submitting: false,
  isModalVisible: false,
  editingTimesheet: null,
  stats: {
    totalHours: 0,
    thisWeekHours: 0,
    approved: 0,
    pending: 0,
  },
  filters: {
    status: 'ALL',
    dateRange: [
      dayjs().startOf('month'),
      dayjs().endOf('month'),
    ] as [dayjs.Dayjs, dayjs.Dayjs],
    searchText: '',
  },
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  },
};

const Timesheets: React.FC = () => {
  const [state, setState] = useState<TimesheetsState>(initialState);

  // Update state helper
  const updateState = (updates: Partial<TimesheetsState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      filters: {
        ...prev.filters,
        ...(updates.filters || {}),
      },
      pagination: {
        ...prev.pagination,
        ...(updates.pagination || {}),
      },
      stats: {
        ...prev.stats,
        ...(updates.stats || {}),
      },
    }));
  };

  // Fetch timesheets
  const fetchTimesheets = useCallback(async () => {
    try {
      updateState({ loading: true });
      const [startDate, endDate] = state.filters.dateRange || [null, null];
      
      const response = await getTimesheets({
        status: state.filters.status === 'ALL' ? undefined : state.filters.status,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        search: state.filters.searchText,
        page: state.pagination.current,
        pageSize: state.pagination.pageSize,
      });
      
      if (response.success && response.data) {
        const timesheetsData = response.data.data || [];
        const total = response.data.total || 0;
        
        // Calculate stats
        const totalHours = calculateTotalHours(timesheetsData);
        
        const thisWeekStart = dayjs().startOf('week');
        const thisWeekEnd = dayjs().endOf('week');
        const thisWeekHours = calculateTotalHours(
          timesheetsData.filter(ts => {
            const tsDate = dayjs(ts.date);
            return tsDate.isAfter(thisWeekStart) && tsDate.isBefore(thisWeekEnd);
          })
        );
        
        const approved = timesheetsData.filter(
          ts => ts.status === 'APPROVED'
        ).length;
        
        const pending = timesheetsData.filter(
          ts => ts.status === 'SUBMITTED' || ts.status === 'PENDING'
        ).length;
        
        updateState({
          timesheets: timesheetsData,
          pagination: {
            ...state.pagination,
            total,
          },
          stats: {
            totalHours,
            thisWeekHours,
            approved,
            pending,
          },
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      message.error('Failed to load timesheets');
      updateState({ loading: false });
    }
  }, [state.filters, state.pagination]);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      updateState({ loading: true });
      const response = await getProjectsAPI();
      if (response.success && response.data) {
        updateState({ 
          projects: response.data,
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      message.error('Failed to load projects');
      updateState({ loading: false });
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchTimesheets();
    fetchProjects();
  }, [fetchTimesheets, fetchProjects]);

  // Handle table change (pagination, sorting, etc.)
  const handleTableChange = (pagination: any) => {
    updateState({
      pagination: {
        ...state.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
    });
  };

  // Handle form submission
  const handleSubmit = async (values: TimesheetFormValues) => {
    try {
      updateState({ submitting: true });
      
      if (state.editingTimesheet) {
        // Update existing timesheet
        const response = await updateTimesheetAPI(state.editingTimesheet.id, values);
        if (response.success) {
          message.success('Timesheet updated successfully');
          await fetchTimesheets();
          updateState({ isModalVisible: false, editingTimesheet: null });
        } else {
          throw new Error(response.message || 'Failed to update timesheet');
        }
      } else {
        // Create new timesheet
        const response = await createTimesheetAPI(values);
        if (response.success) {
          message.success('Timesheet created successfully');
          await fetchTimesheets();
          updateState({ isModalVisible: false });
        } else {
          throw new Error(response.message || 'Failed to create timesheet');
        }
      }
    } catch (error) {
      console.error('Error saving timesheet:', error);
      message.error(error instanceof Error ? error.message : 'Failed to save timesheet');
    } finally {
      updateState({ submitting: false });
    }
  };

  // Handle edit timesheet
  const handleEdit = (record: Timesheet) => {
    updateState({
      isModalVisible: true,
      editingTimesheet: record,
    });
  };

  // Handle delete timesheet
  const handleDelete = async (id: string) => {
    try {
      updateState({ loading: true });
      const response = await deleteTimesheetAPI(id);
      if (response.success) {
        message.success('Timesheet deleted successfully');
        await fetchTimesheets();
      } else {
        throw new Error(response.message || 'Failed to delete timesheet');
      }
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      message.error(error instanceof Error ? error.message : 'Failed to delete timesheet');
    } finally {
      updateState({ loading: false });
    }
  };

  // Handle filter changes
  const handleStatusChange = (status: string) => {
    updateState({
      filters: {
        ...state.filters,
        status: status as TimesheetStatus | 'ALL',
      },
      pagination: {
        ...state.pagination,
        current: 1, // Reset to first page
      },
    });
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    if (dates && dates[0] && dates[1]) {
      updateState({
        filters: {
          ...state.filters,
          dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs],
        },
        pagination: {
          ...state.pagination,
          current: 1, // Reset to first page
        },
      });
    }
  };

  const handleSearch = (searchText: string) => {
    updateState({
      filters: {
        ...state.filters,
        searchText,
      },
      pagination: {
        ...state.pagination,
        current: 1, // Reset to first page
      },
    });
  };

  const handleResetFilters = () => {
    updateState({
      filters: {
        ...initialState.filters,
        dateRange: [
          dayjs().startOf('month'),
          dayjs().endOf('month'),
        ] as [dayjs.Dayjs, dayjs.Dayjs],
      },
      pagination: {
        ...state.pagination,
        current: 1, // Reset to first page
      },
    });
  };

  // Handle modal visibility
  const showModal = () => {
    updateState({ isModalVisible: true, editingTimesheet: null });
  };

  const handleCancel = () => {
    updateState({ isModalVisible: false, editingTimesheet: null });
  };

  return (
    <div className="timesheets-container">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="timesheets-card" bordered={false}>
          {/* Stats Panel */}
          <StatsPanel 
            stats={state.stats} 
            loading={state.loading} 
          />

          {/* Filters Panel */}
          <FiltersPanel
            filters={state.filters}
            onStatusChange={handleStatusChange}
            onDateRangeChange={handleDateRangeChange}
            onSearch={handleSearch}
            onReset={handleResetFilters}
            onCreateNew={showModal}
            loading={state.loading}
          />

          {/* Timesheet Table */}
          <TimesheetTable
            data={state.timesheets}
            loading={state.loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onChange={handleTableChange}
            pagination={state.pagination}
          />

          {/* Timesheet Form Modal */}
          <TimesheetForm
            visible={state.isModalVisible}
            initialValues={state.editingTimesheet ? mapToFormValues(state.editingTimesheet) : getInitialFormValues()}
            projects={state.projects}
            loading={state.submitting}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default Timesheets;
