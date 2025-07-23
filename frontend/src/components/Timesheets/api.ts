import { Timesheet, TimesheetFormValues, TimesheetStatus } from './types';

// Mock API client - replace with actual API calls
const API_BASE_URL = '/api/timesheets';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

// Get all timesheets with optional filters
export const getTimesheets = async (params: {
  status?: TimesheetStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<{ data: Timesheet[]; total: number }>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const response = await fetch(`${API_BASE_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch timesheets');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    return { success: false, message: 'Failed to fetch timesheets' };
  }
};

// Create a new timesheet
export const createTimesheet = async (data: Omit<TimesheetFormValues, 'id'>): Promise<ApiResponse<Timesheet>> => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create timesheet');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating timesheet:', error);
    return { success: false, message: 'Failed to create timesheet' };
  }
};

// Update an existing timesheet
export const updateTimesheet = async (id: string, data: Partial<TimesheetFormValues>): Promise<ApiResponse<Timesheet>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update timesheet');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating timesheet:', error);
    return { success: false, message: 'Failed to update timesheet' };
  }
};

// Delete a timesheet
export const deleteTimesheet = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete timesheet');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting timesheet:', error);
    return { success: false, message: 'Failed to delete timesheet' };
  }
};

// Get projects for dropdown
export const getProjects = async (): Promise<ApiResponse<Array<{ id: string; name: string }>>> => {
  try {
    const response = await fetch('/api/projects', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { success: false, message: 'Failed to fetch projects' };
  }
};
