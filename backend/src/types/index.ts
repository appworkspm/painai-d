import { Request } from 'express';

// User types
export interface IUser {
  id: string;
  email: string;
  name: string;
  role: string; // 'VP' | 'ADMIN' | 'MANAGER' | 'USER'
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUser {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface IUpdateUser {
  email?: string;
  name?: string;
  role?: string;
  isActive?: boolean;
}

export const UserRole = {
  VP: 'VP',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
} as const;

// Project types
export interface IProject {
  id: string;
  name: string;
  description?: string;
  status: string; // 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
  managerId: string;
  createdAt: Date;
  updatedAt: Date;
  manager?: IUser;
}

export interface ICreateProject {
  name: string;
  description?: string;
  managerId: string;
  status?: string;
}

export interface IUpdateProject {
  name?: string;
  description?: string;
  status?: string;
  managerId?: string;
}

export const ProjectStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
  CANCELLED: 'CANCELLED'
} as const;

// Timesheet types
export interface ITimesheet {
  id: string;
  userId: string;
  projectId?: string;
  activityType: string; // 'PROJECT_WORK' | 'NON_PROJECT_WORK' | 'MEETING' | 'BREAK' | 'OTHER'
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: IUser;
  project?: IProject;
}

export interface ICreateTimesheet {
  userId: string;
  projectId?: string;
  activityType: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface IUpdateTimesheet {
  projectId?: string;
  activityType?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  isActive?: boolean;
}

export const ActivityType = {
  PROJECT_WORK: 'PROJECT_WORK',
  NON_PROJECT_WORK: 'NON_PROJECT_WORK',
  MEETING: 'MEETING',
  BREAK: 'BREAK',
  OTHER: 'OTHER'
} as const;

// Auth types
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}

// Request with user
export interface IAuthenticatedRequest extends Request {
  user?: IUser;
}

// API Response types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query parameters
export interface IQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  userId?: string;
  projectId?: string;
  activityType?: string;
}

// Dashboard types
export interface IDashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTimesheets: number;
  activeTimesheets: number;
  totalHours: number;
  projectHours: number;
  nonProjectHours: number;
}

export interface IUserStats {
  userId: string;
  userName: string;
  totalHours: number;
  projectHours: number;
  nonProjectHours: number;
  timesheetCount: number;
}

export interface IProjectStats {
  projectId: string;
  projectName: string;
  totalHours: number;
  timesheetCount: number;
  managerName: string;
} 