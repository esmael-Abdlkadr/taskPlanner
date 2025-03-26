import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '../types/auth.type';
import { authService } from '../services/authservice';
import { storeAuthData, clearStoredAuth } from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        
        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login({ email, password });
            const { user, accessToken } = response.data;
            
            storeAuthData(accessToken, user);
            
            set({
              user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to login';
            set({ 
              isLoading: false, 
              error: errorMessage
            });
            throw error;
          }
        },
        signup: async (firstName: string, lastName: string, email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            await authService.signup({ firstName, lastName, email, password });
            set({ isLoading: false });
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to signup';
            set({ 
              isLoading: false, 
              error: errorMessage
            });
            throw error;
          }
        },
        verifyOtp: async (email: string, otp: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.verifyOtp(email, otp);
            const { user, accessToken } = response.data;
            
            storeAuthData(accessToken, user);
            
            set({
              user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
            set({ 
              isLoading: false, 
              error: errorMessage
            });
            throw error;
          }
        },
        
        logout: () => {
          clearStoredAuth();
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
        },
        
        updateUser: (userData) => {
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            set({ user: updatedUser });
          }
        }
      }),
      {
        name: 'tasknest-auth-storage',
        partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      }
    )
  )
);