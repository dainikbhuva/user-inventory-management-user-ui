import type { User } from '../shared/auth/types';
import type { MenuData } from '../shared/types/menu.types';
import { API_BASE_URL } from '../config/env';

export interface ApiUser extends User {
  status?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: ApiUser;
    token: string;
    refreshToken?: string;
  };
}

export interface MenuResponse {
  success: boolean;
  message: string;
  data: MenuData;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private storeAuth(data: LoginResponse['data']) {
    this.setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/app/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data.token) {
      this.storeAuth(response.data);
    }

    return response;
  }

  async register(input: {
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
  }): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/app/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    if (response.success && response.data.token) {
      this.storeAuth(response.data);
    }

    return response;
  }

  async getProfile(): Promise<{ success: boolean; data: { user: ApiUser } }> {
    return this.request('/app/auth/profile');
  }

  async getMenu(): Promise<MenuResponse> {
    return this.request('/app/menu');
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request('/app/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }
}

export const apiService = new ApiService();
