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
  name: string;
  email: string;
  password: string;
  companyCode: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}
