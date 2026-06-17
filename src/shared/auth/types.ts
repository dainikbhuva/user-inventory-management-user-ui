export interface UserRole {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  companyName?: string;
  companyCode?: string;
  role?: UserRole;
}

export interface SignupInput {
  company: {
    name: string;
    code: string;
    email: string;
    phone?: string;
    address?: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ debugOtp?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<string>;
  resendOTP: (email: string) => Promise<{ debugOtp?: string }>;
  resetPassword: (email: string, resetToken: string, password: string) => Promise<void>;
  updateSessionUser: (patch: Partial<User>) => void;
}
