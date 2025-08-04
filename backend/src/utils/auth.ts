import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IUser } from '../types';

// Configuration
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'b7e2c1a4e8f3d9b6c2a7e4f1b3d8c6a1e9f2b4c7d1a6e3f8b2c5d7e1a3f6b9c4';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const REFRESH_TOKEN_BYTES = 32; // 256 bits

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate a secure random refresh token
const generateRefreshToken = (): string => {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
};

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const generateTokenPair = (user: IUser): TokenPair => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 // 15 minutes in seconds
  };
};

export const generateAccessToken = (user: IUser): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  
  const options: SignOptions = { 
    expiresIn: JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] 
  };
  
  return jwt.sign(payload, JWT_SECRET, options);
};

interface TokenPayload extends jwt.JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string' || !('id' in decoded)) {
      throw new Error('Invalid token payload');
    }
    return decoded as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
};

export const extractTokenFromHeader = (authHeader: string): string => {
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    throw new Error('Invalid authorization header format');
  }
  
  const token = parts[1];
  if (!token) {
    throw new Error('No token provided');
  }
  
  return token;
};

export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'VP': 4,
    'ADMIN': 3,
    'MANAGER': 2,
    'USER': 1
  };
  
  const userRank = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredRank = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  
  return userRank >= requiredRank;
};

export const isAdmin = (role: string): boolean => role === 'ADMIN' || role === 'VP';
export const isManager = (role: string): boolean => ['ADMIN', 'MANAGER', 'VP'].includes(role);
export const isUser = (role: string): boolean => !!role; // Any valid role is a user

// Token blacklist for logout functionality
const tokenBlacklist = new Set<string>();

export const addToBlacklist = (token: string): void => {
  tokenBlacklist.add(token);
};

export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};