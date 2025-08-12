import jwt from 'jsonwebtoken';
import { IUser } from '../types';
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare const generateTokenPair: (user: IUser) => TokenPair;
export declare const generateAccessToken: (user: IUser) => string;
interface TokenPayload extends jwt.JwtPayload {
    id: string;
    email: string;
    role: string;
    name: string;
}
export declare const verifyToken: (token: string) => TokenPayload;
export declare const extractTokenFromHeader: (authHeader: string) => string;
export declare const hasPermission: (userRole: string, requiredRole: string) => boolean;
export declare const isAdmin: (role: string) => boolean;
export declare const isManager: (role: string) => boolean;
export declare const isUser: (role: string) => boolean;
export declare const addToBlacklist: (token: string) => void;
export declare const isTokenBlacklisted: (token: string) => boolean;
export {};
//# sourceMappingURL=auth.d.ts.map