import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { clearStoredAuth } from "../utils/storage";

const getApiBaseUrl = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  const isProduction = import.meta.env.MODE === "production";
  if (envApiUrl) {
    console.log(`Using API URL from environment: ${envApiUrl}`);
    return envApiUrl;
  } else if (isProduction) {
    console.log("Using production API URL");
    return "https://taskplanner-api.up.railway.app/api";
  } else {
    console.log("Using development API URL");
    return "http://localhost:5000/api";
  }
};

const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearStoredAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await api(config);
    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export default api;
