import { IUser } from '../types';
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateToken: (user: IUser) => string;
export declare const verifyToken: (token: string) => any;
export declare const extractTokenFromHeader: (authHeader: string) => string;
export declare const hasPermission: (userRole: string, requiredRole: string) => boolean;
export declare const isAdmin: (role: string) => boolean;
export declare const isManager: (role: string) => boolean;
export declare const isUser: (role: string) => boolean;
//# sourceMappingURL=auth.d.ts.map