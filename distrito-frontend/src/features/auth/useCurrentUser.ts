import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import type { Usuario } from "../../types/auth";

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);
  const setUsuario = useAuthStore((s) => s.setUsuario);

  return useQuery({
    queryKey: ["me", token],
    queryFn: async () => {
      const { data } = await api.get<Usuario>("/auth/me");
      setUsuario(data);
      return data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
