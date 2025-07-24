import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync token/user state เฉพาะครั้งแรกที่ mount
    const syncAuth = () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      console.log('AuthContext syncAuth:', { 
        hasStoredToken: !!storedToken, 
        hasStoredUser: !!storedUser,
        tokenLength: storedToken?.length,
        currentToken: !!token
      });
      
      if (storedToken && storedUser && !token) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('AuthContext: Token and user restored from storage');
      } else if (!storedToken && !storedUser && token) {
        setToken(null);
        setUser(null);
        console.log('AuthContext: Token and user cleared from state');
      }
      setLoading(false);
    };
    
    // ตรวจสอบ token ทุก 5 วินาที
    const tokenCheckInterval = setInterval(() => {
      const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token && !currentToken) {
        console.warn('Token disappeared from storage! Current state token:', !!token, 'Storage token:', !!currentToken);
        // ไม่ clear state ทันที ให้รอสักครู่
      }
    }, 5000);
    
    window.addEventListener('storage', syncAuth);
    syncAuth();
    
    return () => {
      window.removeEventListener('storage', syncAuth);
      clearInterval(tokenCheckInterval);
    };
  }, []); // ไม่ใส่ token ใน dependency

  const login = async (email: string, password: string, remember: boolean = false) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        console.log('Login successful:', { 
          user: user.name, 
          userRole: user.role,
          tokenLength: token.length, 
          remember,
          fullUserData: user
        });
        
        setUser(user);
        setToken(token);
        
        // บันทึกตาม remember option
        if (remember) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          console.log('Token saved to localStorage');
        } else {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('user', JSON.stringify(user));
          console.log('Token saved to sessionStorage');
        }
        
        // ตรวจสอบว่า token ถูกเก็บจริงหรือไม่
        setTimeout(() => {
          const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
          console.log('Token verification after save:', { 
            hasStoredToken: !!storedToken, 
            storedTokenLength: storedToken?.length 
          });
        }, 100);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out - clearing tokens and user data');
    setUser(null);
    setToken(null);
    // ลบจากทั้ง sessionStorage และ localStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 