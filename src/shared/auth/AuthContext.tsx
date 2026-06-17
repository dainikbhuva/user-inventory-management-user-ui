import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { AuthContextType, SignupInput, User } from './types';
import { apiService } from '../../services/api';
import { authService } from '../../services/auth.service';
import { menuService } from '../../services/menu.service';
import { getApiErrorMessage } from '../utils/apiError';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapApiUser = (apiUser: {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  companyName?: string;
  companyCode?: string;
  role?: { id: string; name: string; code: string };
}): User => ({
  id: apiUser.id,
  email: apiUser.email,
  name: apiUser.name,
  companyId: apiUser.companyId,
  companyName: apiUser.companyName,
  companyCode: apiUser.companyCode,
  role: apiUser.role,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else if (storedUser || storedToken) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);

      if (response.success && response.data.user) {
        menuService.clearCache();
        const nextUser = mapApiUser(response.data.user);
        setUser(nextUser);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    setIsLoading(true);
    try {
      const response = await apiService.register(input);

      if (response.success && response.data.user) {
        menuService.clearCache();
        const nextUser = mapApiUser(response.data.user);
        setUser(nextUser);
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(getApiErrorMessage(error, 'Signup failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      menuService.clearCache();
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await authService.forgotPassword(email);
      if (!response.success) {
        throw new Error(response.message || 'Failed to send verification code.');
      }
      return { debugOtp: response.data?.debugOtp };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to send verification code.'));
    }
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    try {
      const response = await authService.verifyOtp(email, otp);
      if (!response.success || !response.data?.resetToken) {
        throw new Error(response.message || 'Invalid verification code.');
      }
      return response.data.resetToken;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid verification code. Please try again.'));
    }
  }, []);

  const resendOTP = useCallback(async (email: string) => {
    try {
      const response = await authService.resendOtp(email);
      if (!response.success) {
        throw new Error(response.message || 'Failed to resend verification code.');
      }
      return { debugOtp: response.data?.debugOtp };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to resend verification code.'));
    }
  }, []);

  const resetPassword = useCallback(async (email: string, resetToken: string, password: string) => {
    try {
      const response = await authService.resetPassword({ email, resetToken, password });
      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password.');
      }
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to reset password. Please try again.'));
    }
  }, []);

  const updateSessionUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    forgotPassword,
    verifyOTP,
    resendOTP,
    resetPassword,
    updateSessionUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
