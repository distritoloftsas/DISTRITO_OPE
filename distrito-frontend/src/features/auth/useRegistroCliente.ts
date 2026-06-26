import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import type { AuthResponse } from "../../types/auth";

export interface RegistroClientePayload {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  aceptaHabeasData: boolean;
}

export function useRegistroCliente() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (payload: RegistroClientePayload): Promise<AuthResponse> => {
      const { data } = await api.post<AuthResponse>("/auth/registro-cliente", payload);
      return data;
    },
    onSuccess: (data) => {
      setSession(data);
    },
  });
}
