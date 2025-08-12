// Holidays API
export const holidaysAPI = {
  async getHolidays() {
    const res = await api.get('/holidays');
    return res.data;
  },
  async createHoliday(data: any) {
    const res = await api.post('/holidays', data);
    return res.data;
  },
  async updateHoliday(id: string, data: any) {
    const res = await api.put(`/api/holidays/${id}`, data);
    return res.data;
  },
  async deleteHoliday(id: string) {
    const res = await api.delete(`/api/holidays/${id}`);
    return res.data;
  },
};

// Roles API
export const rolesAPI = {
  async getRoles() {
    const res = await api.get('/roles/roles');
    return res.data;
  },
  async getPermissions() {
    const res = await api.get('/roles/permissions');
    return res.data;
  },
  async createRole(data: any) {
    const res = await api.post('/roles/roles', data);
    return res.data;
  },
  async updateRole(id: string, data: any) {
    const res = await api.put(`/api/roles/roles/${id}`, data);
    return res.data;
  },
  async deleteRole(id: string) {
    const res = await api.delete(`/api/roles/roles/${id}`);
    return res.data;
  },
};

// Database API
export const databaseAPI = {
  async getStatus() {
    const res = await api.get('/database/status');
    return res.data;
  },
  async getBackups() {
    const res = await api.get('/database/backups');
    return res.data;
  },
  async createBackup() {
    const res = await api.post('/database/backup');
    return res.data;
  },
  async restoreBackup(backupId: string) {
    const res = await api.post(`/api/database/restore/${backupId}`);
    return res.data;
  },
  async deleteBackup(backupId: string) {
    const res = await api.delete(`/api/database/backup/${backupId}`);
    return res.data;
  },
};

// Settings API
export const settingsAPI = {
  async getSettings() {
    const res = await api.get('/settings/settings');
    return res.data;
  },
  async updateSettings(data: any) {
    const res = await api.put('/settings/settings', data);
    return res.data;
  },
  async resetSettings() {
    const res = await api.post('/settings/reset');
    return res.data;
  },
  async getSystemHealth() {
    const res = await api.get('/settings/health');
    return res.data;
  },
};

// Calendar API
export const calendarAPI = {
  async getEvents() {
    const res = await api.get('/calendar/events');
    return res.data;
  },
  async getEventsByRange(startDate: string, endDate: string) {
    const res = await api.get(`/api/calendar/events/range?startDate=${startDate}&endDate=${endDate}`);
    return res.data;
  },
};

// Notifications API
export const notificationsAPI = {
  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data;
  },
  async markAsRead(id: string) {
    const res = await api.patch(`/api/notifications/${id}/read`);
    return res.data;
  },
  async markAllAsRead() {
    const res = await api.patch('/api/notifications/read-all');
    return res.data;
  },
  async deleteNotification(id: string) {
    const res = await api.delete(`/api/notifications/${id}`);
    return res.data;
  },
};

// User Activities API
export const userActivitiesAPI = {
  async getUserActivities(params?: any) {
    const res = await api.get('/user-activities', { params });
    return res.data;
  },
  async getUserActivitiesByUser(userId: string, params?: any) {
    const res = await api.get(`/api/user-activities/user/${userId}`, { params });
    return res.data;
  },
  async getActivityStats(params?: any) {
    const res = await api.get('/user-activities/stats', { params });
    return res.data;
  },
};
import axios from 'axios';
import { 
  ApiResponse, 
  LoginRequest, 
  AuthResponse, 
  Timesheet, 
  CreateTimesheetForm, 
  UpdateTimesheetForm, 
  PaginatedResponse,
  TimesheetWithApproval,
  ApproveTimesheetRequest,
  RejectTimesheetRequest
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Ensure the base URL doesn't end with a slash to prevent double slashes
const normalizedBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Skip for auth endpoints
    if (config.url?.includes('/auth/')) {
      return config;
    }

    // Get tokens from storage (check both localStorage and sessionStorage)
    const getStoredAuth = (): { accessToken: string } | null => {
      const authData = localStorage.getItem('auth') || sessionStorage.getItem('auth');
      return authData ? JSON.parse(authData) : null;
    };

    const storedAuth = getStoredAuth();
    
    if (storedAuth?.accessToken) {
      config.headers.Authorization = `Bearer ${storedAuth.accessToken}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.debug('Adding token to request:', {
          url: config.url,
          tokenLength: storedAuth.accessToken.length
        });
      }
    } else if (!config.url?.includes('/public/')) {
      console.warn('No auth token found for secured endpoint:', config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Skip refresh for login/refresh-token endpoints to avoid infinite loops
      if (originalRequest.url?.includes('/auth/refresh-token') || 
          originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      try {
        console.log('Attempting to refresh token...');
        
        // Get refresh token from storage
        const storedAuth = 
          JSON.parse(localStorage.getItem('auth') || 'null') || 
          JSON.parse(sessionStorage.getItem('auth') || 'null');
        
        if (!storedAuth?.refreshToken) {
          console.warn('No refresh token available');
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await authAPI.refreshToken(storedAuth.refreshToken);
        
        if (response.success && response.data) {
          const { accessToken, refreshToken, expiresIn } = response.data;
          
          // Update stored tokens
          const newTokens = { 
            accessToken, 
            refreshToken, 
            expiresIn: expiresIn || 60 * 15, // Default 15 minutes
            tokenType: 'Bearer' 
          };
          
          // Update tokens in the same storage as before
          const storage = localStorage.getItem('auth') ? localStorage : sessionStorage;
          storage.setItem('auth', JSON.stringify(newTokens));
          
          // Update axios default headers
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          // Update the original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, clear auth data and redirect to login
        localStorage.removeItem('auth');
        localStorage.removeItem('user');
        sessionStorage.removeItem('auth');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', credentials);
    // Map the response to match the expected AuthResponse structure
    if (response.data.data) {
      const { user, token, accessToken, refreshToken, expiresIn } = response.data.data;
      return {
        ...response.data,
        data: {
          user,
          token: accessToken || token, // Fallback to token for backward compatibility
          accessToken: accessToken || token,
          refreshToken,
          expiresIn
        }
      };
    }
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>> => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  register: async (userData: any): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (data: { email: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  getProjectSCurve: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/projects/${id}/s-curve`);
    return response.data;
  },
};

export const usersAPI = {
  updateProfile: (data: { name: string; currentPassword?: string; newPassword?: string }) =>
    api.patch('/api/auth/profile', data),
  
  getTeamMembers: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/users/team');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/users');
    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  createUser: async (userData: { email: string; name: string; password: string; role: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: { email?: string; name?: string; role?: string; isActive?: boolean }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  getSystemStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/users/stats/overview');
    return response.data;
  },

  getProjects: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/projects');
    return response.data;
  },

  getRoles: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/users/roles');
    return response.data;
  },

  deleteRole: async (roleId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/users/roles/${roleId}`);
    return response.data;
  },

  getUserActivities: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/activities');
    return response.data;
  },
};

// Project API
export const projectAPI = {
  getProjects: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/projects');
    return response.data;
  },

  getProject: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData: { 
    name: string; 
    description: string; 
    status: string; 
    managerId: string;
    jobCode?: string;
    customerName?: string;
    paymentTerm?: string;
    startDate?: Date;
    endDate?: Date;
    budget?: number;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  updateProject: async (id: string, projectData: { 
    name?: string; 
    description?: string; 
    status?: string; 
    managerId?: string;
    jobCode?: string;
    customerName?: string;
    paymentTerm?: string;
    startDate?: Date;
    endDate?: Date;
    budget?: number;
  }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/api/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  },
};

export const projectTeamAPI = {
  getTeam: async (projectId: string) => {
    const response = await api.get(`/api/projects/${projectId}/team`);
    return response.data;
  },
  addMember: async (projectId: string, userId: string) => {
    const response = await api.post(`/api/projects/${projectId}/team`, { userId });
    return response.data;
  },
  removeMember: async (projectId: string, userId: string) => {
    const response = await api.delete(`/api/projects/${projectId}/team/${userId}`);
    return response.data;
  },
};

export const projectTaskAPI = {
  addTask: async (projectId: string, data: any) => {
    const response = await api.post(`/api/projects/${projectId}/tasks`, data);
    return response.data;
  },
  updateTask: async (projectId: string, taskId: string, data: any) => {
    const response = await api.put(`/api/projects/${projectId}/tasks/${taskId}`, data);
    return response.data;
  },
  deleteTask: async (projectId: string, taskId: string) => {
    const response = await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },
};

export const projectTimelineAPI = {
  getTimeline: async (projectId: string) => {
    const response = await api.get(`/api/projects/${projectId}/timeline`);
    return response.data;
  },
};

// Project Progress API
export const projectProgressAPI = {
  getProjectProgress: async (projectId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/api/project-progress/project/${projectId}`);
    return response.data;
  },

  getLatestProgress: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/project-progress/latest');
    return response.data;
  },

  createProgress: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/project-progress', data);
    return response.data;
  },

  updateProgress: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/api/project-progress/${id}`, data);
    return response.data;
  },

  deleteProgress: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/project-progress/${id}`);
    return response.data;
  },
};

// Cost Request API
export const costRequestAPI = {
  getCostRequests: async (params?: any): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/cost-requests', { params });
    return response.data;
  },

  getCostRequest: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/cost-requests/${id}`);
    return response.data;
  },

  createCostRequest: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/cost-requests', data);
    return response.data;
  },

  updateCostRequest: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/api/cost-requests/${id}`, data);
    return response.data;
  },

  approveCostRequest: async (id: string, data: { status: string; rejectionReason?: string }): Promise<ApiResponse<any>> => {
    const response = await api.patch(`/api/cost-requests/${id}/approve`, data);
    return response.data;
  },

  deleteCostRequest: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/cost-requests/${id}`);
    return response.data;
  },
};

// Project Cost API
export const projectCostAPI = {
  getProjectCosts: async (params?: any): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/project-costs', { params });
    return response.data;
  },

  getProjectCost: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/project-costs/${id}`);
    return response.data;
  },

  createProjectCost: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/project-costs', data);
    return response.data;
  },

  updateProjectCost: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/api/project-costs/${id}`, data);
    return response.data;
  },

  deleteProjectCost: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/project-costs/${id}`);
    return response.data;
  },

  getCostSummary: async (projectId: string, params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/project-costs/summary/project/${projectId}`, { params });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getProjectOverview: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/dashboard/projects/overview', { params });
    return response.data;
  },

  getProjectProgress: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/dashboard/projects/progress');
    return response.data;
  },

  getCostOverview: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/dashboard/costs/overview', { params });
    return response.data;
  },

  getTimesheetOverview: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/dashboard/timesheets/overview', { params });
    return response.data;
  },

  getActivityOverview: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/dashboard/activities/overview', { params });
    return response.data;
  },

  getComprehensiveDashboard: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/dashboard/comprehensive', { params });
    return response.data;
  },
};

// Timesheet Types API
export const timesheetTypesAPI = {
  getWorkTypes: async (): Promise<ApiResponse<Array<{ id: string; name: string; description: string }>>> => {
    const response = await api.get('/timesheet-types/work-types');
    return response.data;
  },
  
  getSubWorkTypes: async (workTypeId: string): Promise<ApiResponse<Array<{ id: string; name: string; description: string; workTypeId: string }>>> => {
    const response = await api.get(`/api/timesheet-types/sub-work-types?workTypeId=${workTypeId}`);
    return response.data;
  },
  
  getActivities: async (subWorkTypeId: string): Promise<ApiResponse<Array<{ id: string; name: string; description: string; subWorkTypeId: string }>>> => {
    const response = await api.get(`/api/timesheet-types/activities?subWorkTypeId=${subWorkTypeId}`);
    return response.data;
  },
};

// Timesheet API
export const timesheetAPI = {
  getTimesheets: async (params?: any): Promise<ApiResponse<PaginatedResponse<Timesheet>>> => {
    const response = await api.get('/timesheets', { params });
    return response.data;
  },

  getMyTimesheets: async (params?: any): Promise<ApiResponse<PaginatedResponse<Timesheet>>> => {
    const response = await api.get('/timesheets/my', { params });
    return response.data;
  },

  getUserTimesheetHistory: async (params?: any): Promise<ApiResponse<PaginatedResponse<Timesheet>>> => {
    const response = await api.get('/timesheets/history', { params });
    return response.data;
  },

  getTimesheet: async (id: string): Promise<ApiResponse<Timesheet>> => {
    const response = await api.get(`/api/timesheets/${id}`);
    return response.data;
  },

  createTimesheet: async (data: CreateTimesheetForm): Promise<ApiResponse<Timesheet>> => {
    const response = await api.post('/timesheets', data);
    return response.data;
  },

  updateTimesheet: async (id: string, data: UpdateTimesheetForm): Promise<ApiResponse<Timesheet>> => {
    const response = await api.put(`/api/timesheets/${id}`, data);
    return response.data;
  },

  deleteTimesheet: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/timesheets/${id}`);
    return response.data;
  },

  submitTimesheet: async (id: string): Promise<ApiResponse<Timesheet>> => {
    const response = await api.patch(`/api/timesheets/${id}/submit`);
    return response.data;
  },

  // Approve/Reject methods
  approveTimesheet: async (id: string): Promise<ApiResponse<TimesheetWithApproval>> => {
    const response = await api.patch(`/api/timesheets/${id}/approve`, { status: 'approved' });
    return response.data;
  },

  rejectTimesheet: async (id: string, data: RejectTimesheetRequest): Promise<ApiResponse<TimesheetWithApproval>> => {
    const response = await api.patch(`/api/timesheets/${id}/reject`, data);
    return response.data;
  },

  // Alternative approve method with status
  approveTimesheetWithStatus: async (id: string, data: ApproveTimesheetRequest): Promise<ApiResponse<TimesheetWithApproval>> => {
    const response = await api.patch(`/api/timesheets/${id}/approve`, data);
    return response.data;
  },

  getTimesheetHistory: async (id: string): Promise<ApiResponse<TimesheetWithApproval[]>> => {
    const response = await api.get(`/api/timesheets/${id}/history`);
    return response.data;
  },

  // Additional timesheet management methods
  getPendingApprovals: async (): Promise<ApiResponse<TimesheetWithApproval[]>> => {
    const response = await api.get('/timesheets/pending-approvals');
    return response.data;
  },

  getApprovedTimesheets: async (): Promise<ApiResponse<TimesheetWithApproval[]>> => {
    const response = await api.get('/timesheets/approved');
    return response.data;
  },

  getRejectedTimesheets: async (): Promise<ApiResponse<TimesheetWithApproval[]>> => {
    const response = await api.get('/timesheets/rejected');
    return response.data;
  },

  // Bulk operations
  approveMultipleTimesheets: async (ids: string[]): Promise<ApiResponse<TimesheetWithApproval[]>> => {
    const response = await api.put('/timesheets/bulk-approve', { ids });
    return response.data;
  },

  rejectMultipleTimesheets: async (data: { ids: string[]; reason: string }): Promise<ApiResponse<TimesheetWithApproval[]>> => {
    const response = await api.put('/timesheets/bulk-reject', data);
    return response.data;
  },
};

// Report API
export const reportAPI = {
  getWorkloadReport: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/reports/workload', { params });
    return response.data;
  },

  getTimesheetReport: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/reports/timesheet', { params });
    return response.data;
  },

  getProjectReport: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/reports/project', { params });
    return response.data;
  },

  getUserActivityReport: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/reports/user-activity', { params });
    return response.data;
  },

  // Export functions
  exportProjectCSV: async (params?: any): Promise<void> => {
    const response = await api.get('/reports/export/project/csv', { 
      params,
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `project-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportUserActivityCSV: async (params?: any): Promise<void> => {
    const response = await api.get('/reports/export/user-activity/csv', { 
      params,
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `user-activity-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportWorkloadCSV: async (params?: any): Promise<void> => {
    const response = await api.get('/reports/export/workload/csv', { 
      params,
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `workload-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportTimesheetCSV: async (params?: any): Promise<void> => {
    const response = await api.get('/reports/export/timesheet/csv', { 
      params,
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `timesheet-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default api; 

// User API
export const userAPI = {
  getUsers: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/users');
    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  createUser: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
}; 