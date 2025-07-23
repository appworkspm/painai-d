import axios from 'axios';

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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface ProjectProgress {
  id: string;
  projectId: string;
  progress: number;
  planned?: number;
  actual?: number;
  status: string;
  milestone?: string;
  description?: string;
  date: string;
  reportedBy: string;
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    status: string;
  };
}

export interface SCurveData {
  date: string;
  planned: number;
  actual: number;
  progress: number;
  status: string;
  milestone?: string;
  description?: string;
}

export interface ProgressFilters {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface BulkUpdateData {
  id: string;
  progress?: number;
  planned?: number;
  actual?: number;
  status?: string;
  milestone?: string;
  description?: string;
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  overallProgress: number;
  taskBasedProgress: number;
  manualProgress: number;
  daysRemaining: number | null;
  isOnTrack: boolean;
}

export interface ProjectWithProgress {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  metrics: ProjectMetrics;
}

export interface ProjectProgressResponse {
  success: boolean;
  data: ProjectProgress[];
  sCurveData: SCurveData[];
  project: ProjectWithProgress;
}

class ProjectProgressAPI {
  // Get all progress data with filters
  async getAllProgress(filters?: ProgressFilters) {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/project-progress?${params.toString()}`);
    return response.data;
  }

  // Get progress data for specific project with enhanced details
  async getProjectProgress(projectId: string, filters?: { startDate?: string; endDate?: string }): Promise<ProjectProgressResponse> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/project-progress/project/${projectId}?${params.toString()}`);
    return response.data;
  }

  // Get S-Curve data for project
  async getSCurveData(projectId: string, filters?: { startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/project-progress/s-curve/${projectId}?${params.toString()}`);
    return response.data;
  }

  // Create new progress entry
  async createProgress(data: {
    projectId: string;
    progress: number;
    planned?: number;
    actual?: number;
    status?: string;
    milestone?: string;
    description?: string;
  }) {
    const response = await api.post('/project-progress', data);
    return response.data;
  }

  // Update progress entry
  async updateProgress(id: string, data: {
    progress?: number;
    planned?: number;
    actual?: number;
    status?: string;
    milestone?: string;
    description?: string;
  }) {
    const response = await api.put(`/project-progress/${id}`, data);
    return response.data;
  }

  // Delete progress entry
  async deleteProgress(id: string) {
    const response = await api.delete(`/project-progress/${id}`);
    return response.data;
  }

  // Bulk update progress entries
  async bulkUpdateProgress(projectId: string, updates: BulkUpdateData[]) {
    const response = await api.put(`/project-progress/bulk/${projectId}`, { updates });
    return response.data;
  }

  // Import progress data from CSV
  async importProgress(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/project-progress/import/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Export progress data to CSV
  async exportProgress(projectId: string, filters?: { startDate?: string; endDate?: string }, format: 'json' | 'csv' = 'json') {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (format === 'csv') params.append('format', 'csv');

    const response = await api.get(`/project-progress/export/${projectId}?${params.toString()}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });

    if (format === 'csv') {
      // Create download link for CSV
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `progress_${projectId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true, message: 'File downloaded successfully' };
    }

    return response.data;
  }

  // Generate CSV template for import
  generateCSVTemplate() {
    const headers = ['date', 'progress', 'planned', 'actual', 'status', 'milestone', 'description'];
    const csvContent = headers.join(',') + '\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'progress_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // Calculate S-Curve data locally (for real-time updates)
  calculateSCurveData(progressData: ProjectProgress[]): SCurveData[] {
    if (progressData.length === 0) return [];

    const sortedData = progressData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulativePlanned = 0;
    let cumulativeActual = 0;

    return sortedData.map((entry) => {
      const planned = entry.planned || 0;
      const actual = entry.actual || entry.progress || 0;
      
      cumulativePlanned += planned;
      cumulativeActual += actual;

      return {
        date: entry.date,
        planned: Math.min(cumulativePlanned, 100),
        actual: Math.min(cumulativeActual, 100),
        progress: entry.progress,
        status: entry.status,
        milestone: entry.milestone,
        description: entry.description
      };
    });
  }
}

export const projectProgressAPI = new ProjectProgressAPI(); 