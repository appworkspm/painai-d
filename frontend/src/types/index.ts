// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string; // 'ADMIN' | 'MANAGER' | 'USER'
  isActive: boolean;
  position?: string;
  employeeCode?: string;
  createdAt: string;
  updatedAt: string;
}

export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
} as const;

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string; // 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
  managerId: string;
  jobCode?: string;
  customerName?: string;
  paymentTerm?: string;
  paymentCondition?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
  manager?: User;
}

export const ProjectStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
  CANCELLED: 'CANCELLED'
} as const;

// Timesheet types
export interface Timesheet {
  id: string;
  userId: string;
  projectId?: string;
  activityType: string; // 'PROJECT_WORK' | 'NON_PROJECT_WORK' | 'MEETING' | 'BREAK' | 'OTHER'
  description: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  project?: Project;
}

export const ActivityType = {
  PROJECT_WORK: 'PROJECT_WORK',
  NON_PROJECT_WORK: 'NON_PROJECT_WORK',
  MEETING: 'MEETING',
  BREAK: 'BREAK',
  OTHER: 'OTHER'
} as const;

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CreateTimesheetForm {
  projectId?: string;
  activityType: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface UpdateTimesheetForm {
  projectId?: string;
  activityType?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  isActive?: boolean;
}

// Timesheet Approval types
export interface TimesheetApproval {
  id: string;
  timesheetId: string;
  approverId: string;
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
  timesheet?: Timesheet;
  approver?: User;
}

export interface ApproveTimesheetRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface RejectTimesheetRequest {
  reason: string;
}

// Enhanced Timesheet interface with approval fields
export interface TimesheetWithApproval extends Timesheet {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  submittedAt?: string;
  hours_worked?: number;
  overtime_hours?: number;
  work_type?: 'PROJECT' | 'NON_PROJECT' | 'LEAVE';
  date?: string;
} 