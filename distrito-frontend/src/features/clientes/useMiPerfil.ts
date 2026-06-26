import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { ClienteResponse } from "../../types/cliente";

export function useMiPerfil() {
  return useQuery({
    queryKey: ["mi-perfil"],
    queryFn: async () => {
      const { data } = await api.get<ClienteResponse>("/clientes/me");
      return data;
    },
  });
}

export interface ActualizarMiPerfilPayload {
  nombre: string;
  telefono: string;
  email?: string | null;
  direccionPrincipal?: string | null;
}

export function useActualizarMiPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ActualizarMiPerfilPayload) => {
      const { data } = await api.patch<ClienteResponse>("/clientes/me", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mi-perfil"] });
      qc.invalidateQueries({ queryKey: ["auth-me"] });
    },
  });
}
