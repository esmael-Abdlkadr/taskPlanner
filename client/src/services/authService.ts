import { apiRequest } from './api';
import { AuthResponse, LoginData, SignupData, User } from '../types/auth.type';

export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>({
      method: 'POST',
      url: '/auth/login',
      data,
    });
  },

  signup: async (data: SignupData): Promise<{ status: string; message: string }> => {
    return apiRequest<{ status: string; message: string }>({
      method: 'POST',
      url: '/auth/signup',
      data,
    });
  },

  verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>({
      method: 'POST',
      url: '/auth/verify-otp',
      data: { email, otp },
    });
  },

  requestNewOtp: async (email: string): Promise<{ status: string; message: string }> => {
    return apiRequest<{ status: string; message: string }>({
      method: 'POST',
      url: '/auth/request-new-otp',
      data: { email },
    });
  },

  forgotPassword: async (email: string): Promise<{ status: string; message: string }> => {
    return apiRequest<{ status: string; message: string }>({
      method: 'POST',
      url: '/auth/forgot-password',
      data: { email },
    });
  },

  resetPassword: async (token: string, password: string): Promise<{ status: string; message: string }> => {
    return apiRequest<{ status: string; message: string }>({
      method: 'POST',
      url: `/auth/reset-password/${token}`,
      data: { password },
    });
  },

  updateProfile: async (data: { firstName?: string; lastName?: string }): Promise<{ status: string; message: string; data: { user:User } }> => {
    return apiRequest<{ status: string; message: string; data: { user:User   } }>({
      method: 'PATCH',
      url: '/auth/profile',
      data,
    });
  },

  updatePreferences: async (preferences: { theme?: 'light' | 'dark'; notifications?: boolean }): Promise<{ status: string; message: string; data: { user:User } }> => {
    return apiRequest<{ status: string; message: string; data: { user:User } }>({
      method: 'PATCH',
      url: '/auth/preferences',
      data: preferences,
    });
  },
};