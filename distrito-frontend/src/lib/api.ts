import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Usa "||" (no "??") para que un VITE_API_URL vacio caiga al default y no quede baseURL = "".
const baseURL = import.meta.env.VITE_API_URL || "/api";

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

      // Tanto 401 (no autenticado) como 403 sobre /auth/me indican que el token
      // guardado ya no sirve. Limpiamos la sesion para evitar bucles de redireccion.
      const reqUrl = (error.config?.url as string | undefined) ?? "";
      const sesionInvalidada =
        error.response.status === 401 ||
        (error.response.status === 403 && reqUrl.includes("/auth/me"));

      if (sesionInvalidada) {
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
