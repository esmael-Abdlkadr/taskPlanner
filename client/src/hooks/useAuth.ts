import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { LoginData, SignupData } from "../types/auth.type";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginData) => authService.login(credentials),
    onSuccess: (data) => {
      console.log("data", data.data.accessToken);
      localStorage.setItem("token", data.data.accessToken);
      setUser(data.data.user);
      setToken(data.data.accessToken);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to login");
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: (userData: SignupData) => authService.signup(userData),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create account");
    },
  });
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyOtp(email, otp),
    onSuccess: (data) => {
      setUser(data.data.user);
      setToken(data.data.accessToken);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Email verified successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify OTP");
    },
  });
};

export const useRequestNewOtp = () => {
  return useMutation({
    mutationFn: (email: string) => authService.requestNewOtp(email),
    onSuccess: () => {
      toast.success("New verification code sent to your email");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send new verification code");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success("Password reset instructions sent to your email");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reset instructions");
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
    onSuccess: () => {
      toast.success("Password reset successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (profileData: { firstName?: string; lastName?: string }) =>
      authService.updateProfile(profileData),
    onSuccess: (data) => {
      updateUser(data.data.user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (preferences: {
      theme?: "light" | "dark";
      notifications?: boolean;
    }) => authService.updatePreferences(preferences),
    onSuccess: (data) => {
      updateUser(data.data.user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Preferences updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update preferences");
    },
  });
};

// Get current user  (for session persistence)
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading: false,
  };
};
