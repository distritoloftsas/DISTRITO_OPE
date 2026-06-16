import axios from "axios";
import { useAuthStore } from "../store/authStore";

const baseURL = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `[API] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response.data
      );

      if (error.response.status === 401) {
        const wasAuthenticated = !!useAuthStore.getState().token;
        useAuthStore.getState().clearSession();
        if (wasAuthenticated && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    } else {
      console.error("[API] Network or unknown error:", error.message);
    }
    return Promise.reject(error);
  }
);
