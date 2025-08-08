import { Request } from 'express';
export interface IUser {
    id: string;
    email: string;
    name: string;
    role: string;
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
export declare const UserRole: {
    readonly VP: "VP";
    readonly ADMIN: "ADMIN";
    readonly MANAGER: "MANAGER";
    readonly USER: "USER";
};
export interface IProject {
    id: string;
    name: string;
    description?: string;
    status: string;
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
export declare const ProjectStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly COMPLETED: "COMPLETED";
    readonly ON_HOLD: "ON_HOLD";
    readonly CANCELLED: "CANCELLED";
};
export interface ITimesheet {
    id: string;
    userId: string;
    projectId?: string;
    activityType: string;
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
export declare const ActivityType: {
    readonly PROJECT_WORK: "PROJECT_WORK";
    readonly NON_PROJECT_WORK: "NON_PROJECT_WORK";
    readonly MEETING: "MEETING";
    readonly BREAK: "BREAK";
    readonly OTHER: "OTHER";
};
export interface ILoginRequest {
    email: string;
    password: string;
}
export interface IAuthResponse {
    user: IUser;
    token: string;
}
export interface IAuthenticatedRequest extends Request {
    user?: IUser;
}
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
//# sourceMappingURL=index.d.ts.map