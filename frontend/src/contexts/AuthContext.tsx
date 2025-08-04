import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';
import api from '../services/api';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshAuth: () => Promise<boolean>;
  isRefreshing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check both storages for tokens
        const getStoredTokens = (storage: Storage): { tokens: AuthTokens | null; user: User | null } => {
          const authData = storage.getItem('auth');
          const userData = storage.getItem('user');
          return {
            tokens: authData ? JSON.parse(authData) : null,
            user: userData ? JSON.parse(userData) : null
          };
        };

        // Check both localStorage and sessionStorage
        const localData = getStoredTokens(localStorage);
        const sessionData = getStoredTokens(sessionStorage);
        const { tokens: storedTokens, user: storedUser } = localData.tokens ? localData : sessionData;

        if (storedTokens && storedUser) {
          // Set tokens and user from storage
          setTokens(storedTokens);
          setUser(storedUser);
          
          // Set up API client with the stored token
          api.defaults.headers.common['Authorization'] = `Bearer ${storedTokens.accessToken}`;
          
          console.log('Auth initialized from storage:', { 
            user: storedUser.email,
            hasRefreshToken: !!storedTokens.refreshToken
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid auth data
        localStorage.removeItem('auth');
        sessionStorage.removeItem('auth');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, remember: boolean = false) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.data) {
        const { user, accessToken, refreshToken, expiresIn } = response.data;
        
        if (!accessToken || !refreshToken) {
          throw new Error('Missing authentication tokens in response');
        }
        
        const authTokens: AuthTokens = {
          accessToken,
          refreshToken,
          expiresIn: expiresIn || 60 * 15, // Default 15 minutes if not provided
          tokenType: 'Bearer'
        };
        
        console.log('Login successful:', { 
          user: user.name, 
          userRole: user.role,
          remember
        });
        
        // Update state
        setUser(user);
        setTokens(authTokens);
        
        // Store tokens and user data in the appropriate storage
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('auth', JSON.stringify(authTokens));
        storage.setItem('user', JSON.stringify(user));
        
        // Set default auth header for API calls
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // For backward compatibility during migration
        if (remember) {
          localStorage.setItem('token', accessToken);
        } else {
          sessionStorage.setItem('token', accessToken);
        }
        
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial auth state on error
      logout();
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out - clearing all auth data');
    
    // Clear state
    setUser(null);
    setTokens(null);
    
    // Clear all storage
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('auth');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
  };
  
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) {
      console.log('Refresh already in progress');
      return false;
    }
    
    try {
      setIsRefreshing(true);
      
      // Get refresh token from storage
      const storedAuth = 
        JSON.parse(localStorage.getItem('auth') || 'null') || 
        JSON.parse(sessionStorage.getItem('auth') || 'null');
      
      if (!storedAuth?.refreshToken) {
        console.warn('No refresh token available');
        return false;
      }

      // Call refresh token endpoint
      const response = await authAPI.refreshToken(storedAuth.refreshToken);

      if (response.success && response.data) {
        const { accessToken, refreshToken, expiresIn } = response.data;
        const newTokens: AuthTokens = { 
          accessToken, 
          refreshToken, 
          expiresIn: expiresIn || 60 * 15, // Default 15 minutes
          tokenType: 'Bearer' 
        };
        
        // Update tokens in state and storage
        setTokens(newTokens);
        
        // Update storage where the original tokens were stored
        const storage = localStorage.getItem('auth') ? localStorage : sessionStorage;
        storage.setItem('auth', JSON.stringify(newTokens));
        
        // Update API client with new token
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        console.log('Token refresh successful');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const value: AuthContextType = {
    user,
    tokens,
    login,
    logout,
    loading,
    setUser,
    refreshAuth,
    isRefreshing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 