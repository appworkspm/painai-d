import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../types';
export type { IAuthenticatedRequest };
export declare const authenticate: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (requiredRole: string) => (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireManager: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireUser: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAuth: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map