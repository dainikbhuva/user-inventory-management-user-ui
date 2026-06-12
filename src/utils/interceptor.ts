// API interceptor for handling authentication and error responses
import { apiService } from '../services/api';

// Function to set up global fetch interceptor
export const setupApiInterceptor = () => {
  // Store the original fetch function
  const originalFetch = window.fetch;

  // Override fetch with our interceptor
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Only intercept requests to our API
    if (typeof input === 'string' && input.includes('/api/')) {
      // Get the current token
      const token = apiService.getToken();
      
      // Add authorization header if token exists
      if (token) {
        const headers = new Headers(init?.headers);
        headers.set('Authorization', `Bearer ${token}`);
        
        init = {
          ...init,
          headers,
        };
      }
    }

    // Make the original request
    try {
      const response = await originalFetch(input, init);

      // Handle 401 Unauthorized responses
      if (response.status === 401) {
        // Clear token and redirect to login
        apiService.clearToken();
        window.location.href = '/login';
        return response;
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.clone().json().catch(() => ({}));
        console.error('API Error:', errorData);
      }

      return response;
    } catch (error) {
      console.error('Network Error:', error);
      throw error;
    }
  };
};

// Function to handle API errors globally
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!apiService.getToken();
};

// Function to get stored user data
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    return null;
  }
};

// Function to handle logout globally
export const handleLogout = async () => {
  try {
    await apiService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Force redirect to login page
    window.location.href = '/login';
  }
};
