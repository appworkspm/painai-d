// Holidays API
export const holidaysAPI = {
  async getHolidays() {
    const res = await api.get('/api/holidays');
    return res.data;
  },
  async createHoliday(data: any) {
    const res = await api.post('/api/holidays', data);
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
    const res = await api.get('/api/roles/roles');
    return res.data;
  },
  async getPermissions() {
    const res = await api.get('/api/roles/permissions');
    return res.data;
  },
  async createRole(data: any) {
    const res = await api.post('/api/roles/roles', data);
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
    const res = await api.get('/api/database/status');
    return res.data;
  },
  async getBackups() {
    const res = await api.get('/api/database/backups');
    return res.data;
  },
  async createBackup() {
    const res = await api.post('/api/database/backup');
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
    const res = await api.get('/api/settings/settings');
    return res.data;
  },
  async updateSettings(data: any) {
    const res = await api.put('/api/settings/settings', data);
    return res.data;
  },
  async resetSettings() {
    const res = await api.post('/api/settings/reset');
    return res.data;
  },
  async getSystemHealth() {
    const res = await api.get('/api/settings/health');
    return res.data;
  },
};

// Calendar API
export const calendarAPI = {
  async getEvents() {
    const res = await api.get('/api/calendar/events');
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
    const res = await api.get('/api/notifications');
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
    const res = await api.get('/api/user-activities', { params });
    return res.data;
  },
  async getUserActivitiesByUser(userId: string, params?: any) {
    const res = await api.get(`/api/user-activities/user/${userId}`, { params });
    return res.data;
  },
  async getActivityStats(params?: any) {
    const res = await api.get('/api/user-activities/stats', { params });
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

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // ดึง token จาก localStorage ก่อน แล้วค่อย sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', {
        url: config.url,
        hasToken: !!token,
        tokenLength: token.length
      });
    } else {
      console.warn('No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ไม่ redirect ทันที แต่ให้ component จัดการเอง
      console.warn('401 Unauthorized - Token may be invalid or expired', {
        url: error.config.url,
        isLoginRequest: error.config.url?.includes('/auth/login'),
        hasToken: !!(localStorage.getItem('token') || sessionStorage.getItem('token'))
      });
      
      // ลบ token เฉพาะเมื่อไม่ใช่ login request และมี token อยู่จริง
      const isLoginRequest = error.config.url?.includes('/auth/login');
      const isPublicEndpoint = error.config.url?.includes('/health') || 
                              error.config.url?.includes('/api') === false;
      const isFirstLoad = error.config.url?.includes('/users') || 
                         error.config.url?.includes('/projects') || 
                         error.config.url?.includes('/activities');
      
      // ไม่ลบ token สำหรับ request แรกหลัง login
      if (!isLoginRequest && !isPublicEndpoint && !isFirstLoad) {
        const hasToken = !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
        if (hasToken) {
          console.log('Removing tokens due to 401 error from:', error.config.url);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          console.log('No token to remove for 401 error from:', error.config.url);
        }
      } else {
        console.log('Skipping token removal for:', error.config.url, { 
          isLoginRequest, 
          isPublicEndpoint, 
          isFirstLoad 
        });
        // ไม่ลบ token แต่ให้ retry request หลังจาก delay สักครู่
        if (isFirstLoad) {
          console.log('First load request failed, will retry later');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData: any): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (data: { email: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/auth/forgot-password', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/auth/profile');
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
    const response = await api.get('/api/users/team');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/users');
    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  createUser: async (userData: { email: string; name: string; password: string; role: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/users', userData);
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
    const response = await api.get('/api/users/stats/overview');
    return response.data;
  },

  getProjects: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/projects');
    return response.data;
  },

  getRoles: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/users/roles');
    return response.data;
  },

  deleteRole: async (roleId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/users/roles/${roleId}`);
    return response.data;
  },

  getUserActivities: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/activities');
    return response.data;
  },
};

// Project API
export const projectAPI = {
  getProjects: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/projects');
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
    const response = await api.post('/api/projects', projectData);
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
    const response = await api.get('/api/project-progress/latest');
    return response.data;
  },

  createProgress: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/project-progress', data);
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
    const response = await api.get('/api/cost-requests', { params });
    return response.data;
  },

  getCostRequest: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/cost-requests/${id}`);
    return response.data;
  },

  createCostRequest: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/cost-requests', data);
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
    const response = await api.get('/api/project-costs', { params });
    return response.data;
  },

  getProjectCost: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/project-costs/${id}`);
    return response.data;
  },

  createProjectCost: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/project-costs', data);
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
    const response = await api.get('/api/dashboard/projects/overview', { params });
    return response.data;
  },

  getProjectProgress: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/dashboard/projects/progress');
    return response.data;
  },

  getCostOverview: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/dashboard/costs/overview', { params });
    return response.data;
  },

  getTimesheetOverview: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/dashboard/timesheets/overview', { params });
    return response.data;
  },

  getActivityOverview: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/dashboard/activities/overview', { params });
    return response.data;
  },

  getComprehensiveDashboard: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/dashboard/comprehensive', { params });
    return response.data;
  },
};

// Timesheet Types API
export const timesheetTypesAPI = {
  getWorkTypes: async (): Promise<ApiResponse<Array<{ id: string; name: string; description: string }>>> => {
    const response = await api.get('/api/timesheet-types/work-types');
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
    const response = await api.get('/api/timesheets', { params });
    return response.data;
  },

  getMyTimesheets: async (params?: any): Promise<ApiResponse<PaginatedResponse<Timesheet>>> => {
    const response = await api.get('/api/timesheets/my', { params });
    return response.data;
  },

  getUserTimesheetHistory: async (params?: any): Promise<ApiResponse<PaginatedResponse<Timesheet>>> => {
    const response = await api.get('/api/timesheets/history', { params });
    return response.data;
  },

  getTimesheet: async (id: string): Promise<ApiResponse<Timesheet>> => {
    const response = await api.get(`/api/timesheets/${id}`);
    return response.data;
  },

  createTimesheet: async (data: CreateTimesheetForm): Promise<ApiResponse<Timesheet>> => {
    const response = await api.post('/api/timesheets', data);
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
    const response = await api.get('/api/timesheets/pending-approvals');
    return response.data;
  },

  getApprovedTimesheets: async (): Promise<ApiResponse<TimesheetWithApproval[]>> => {
    const response = await api.get('/api/timesheets/approved');
    return response.data;
  },

  getRejectedTimesheets: async (): Promise<ApiResponse<TimesheetWithApproval[]>> => {
    const response = await api.get('/api/timesheets/rejected');
    return response.data;
  },

  // Bulk operations
  approveMultipleTimesheets: async (ids: string[]): Promise<ApiResponse<TimesheetWithApproval[]>> => {
    const response = await api.put('/api/timesheets/bulk-approve', { ids });
    return response.data;
  },

  rejectMultipleTimesheets: async (data: { ids: string[]; reason: string }): Promise<ApiResponse<TimesheetWithApproval[]>> => {
    const response = await api.put('/api/timesheets/bulk-reject', data);
    return response.data;
  },
};

// Report API
export const reportAPI = {
  getWorkloadReport: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/reports/workload', { params });
    return response.data;
  },

  getTimesheetReport: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/reports/timesheet', { params });
    return response.data;
  },

  getProjectReport: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/reports/project', { params });
    return response.data;
  },

  getUserActivityReport: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/reports/user-activity', { params });
    return response.data;
  },

  // Export functions
  exportProjectCSV: async (params?: any): Promise<void> => {
    const response = await api.get('/api/reports/export/project/csv', { 
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
    const response = await api.get('/api/reports/export/user-activity/csv', { 
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
    const response = await api.get('/api/reports/export/workload/csv', { 
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
    const response = await api.get('/api/reports/export/timesheet/csv', { 
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
    const response = await api.get('/api/users');
    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  createUser: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/users', data);
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