import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { AuthContextType, SignupInput, User } from './types';
import { apiService } from '../../services/api';

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
        const nextUser = mapApiUser(response.data.user);
        setUser(nextUser);
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
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
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      if (otp !== '123456') {
        throw new Error('Invalid verification code. Please try again.');
      }
      console.log('OTP verified for:', email);
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendOTP = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    setIsLoading(true);
    try {
      if (!token || !password || password.length < 6) {
        throw new Error('Invalid reset token or password.');
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
