import axios from 'axios';
import { ApiResponse, LoginRequest, AuthResponse, Timesheet, CreateTimesheetForm, UpdateTimesheetForm, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: any): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Timesheet API
export const timesheetAPI = {
  getTimesheets: async (params?: any): Promise<ApiResponse<PaginatedResponse<Timesheet>>> => {
    const response = await api.get('/timesheets', { params });
    return response.data;
  },

  getTimesheet: async (id: string): Promise<ApiResponse<Timesheet>> => {
    const response = await api.get(`/timesheets/${id}`);
    return response.data;
  },

  createTimesheet: async (data: CreateTimesheetForm): Promise<ApiResponse<Timesheet>> => {
    const response = await api.post('/timesheets', data);
    return response.data;
  },

  updateTimesheet: async (id: string, data: UpdateTimesheetForm): Promise<ApiResponse<Timesheet>> => {
    const response = await api.put(`/timesheets/${id}`, data);
    return response.data;
  },

  deleteTimesheet: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/timesheets/${id}`);
    return response.data;
  },
};

export default api; 