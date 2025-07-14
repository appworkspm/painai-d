import axios from 'axios';
import { ApiResponse, LoginRequest, AuthResponse, Timesheet, CreateTimesheetForm, UpdateTimesheetForm, PaginatedResponse } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
};

export const usersAPI = {
  updateProfile: (data: { name: string; currentPassword?: string; newPassword?: string }) =>
    api.patch('/api/auth/profile', data),
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
    const response = await api.get('/api/users/activities');
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

  createProject: async (projectData: { name: string; description: string; status: string; managerId: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  },

  updateProject: async (id: string, projectData: { name?: string; description?: string; status?: string; managerId?: string }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/api/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  },
};

// Timesheet API
export const timesheetAPI = {
  getTimesheets: async (params?: any): Promise<ApiResponse<PaginatedResponse<Timesheet>>> => {
    const response = await api.get('/api/timesheets', { params });
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
};

export default api; 