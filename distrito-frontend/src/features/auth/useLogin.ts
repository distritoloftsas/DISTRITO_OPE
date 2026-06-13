import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import type { AuthResponse } from "../../types/auth";

interface LoginPayload {
  email: string;
  password: string;
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (payload: LoginPayload): Promise<AuthResponse> => {
      const { data } = await api.post<AuthResponse>("/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      setSession(data);
    },
  });
}
