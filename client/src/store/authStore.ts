import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/auth.type";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;

  login: (email: string, password: string) => Promise<void>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) => set({ token }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      // These are now handled by the TanStack hooks but kept for backward compatibility
      login: async () => {
        // Implementation is now in useLogin hook
        console.warn(
          "Using deprecated authStore.login - please use useLogin hook instead"
        );
      },

      signup: async () => {
        // Implementation is now in useSignup hook
        console.warn(
          "Using deprecated authStore.signup - please use useSignup hook instead"
        );
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
