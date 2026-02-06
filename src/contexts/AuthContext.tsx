import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService } from '@/api/services/auth.service';
import { IdentityUserDto, LoginRequest, RegisterCommand } from '@/api/types/auth.types';

interface AuthContextType {
  user: IdentityUserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterCommand) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IdentityUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = authService.getStoredUser();
      const isAuth = authService.isAuthenticated();
      
      if (isAuth && storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login(credentials);
      
      if (response.isSuccess && response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }
      
      // Handle validation errors
      if (response.validationErrors) {
        const errorMessages = Object.values(response.validationErrors).join(', ');
        return { success: false, error: errorMessages };
      }
      
      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const register = useCallback(async (data: RegisterCommand): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.register(data);
      
      if (response.isSuccess) {
        return { success: true };
      }
      
      // Handle validation errors
      if (response.validationErrors) {
        const errorMessages = Object.values(response.validationErrors).join(', ');
        return { success: false, error: errorMessages };
      }
      
      return { success: false, error: response.message || 'Registration failed' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
