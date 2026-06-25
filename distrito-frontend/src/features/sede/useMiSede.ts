import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export interface MiSedeResponse {
  id: number;
  nombre: string;
  toleranciaPreLavadoMinutos: number;
  toleranciaPostLavadoMinutos: number;
}

export function useMiSede() {
  return useQuery({
    queryKey: ["mi-sede"],
    queryFn: async () => {
      const { data } = await api.get<MiSedeResponse>("/sedes/mi-sede");
      return data;
    },
  });
}

export function useActualizarTolerancia(sedeId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pre: number; post: number }) => {
      if (!sedeId) throw new Error("Sede no identificada");
      const { data } = await api.patch<MiSedeResponse>(
        `/sedes/${sedeId}/tolerancia`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mi-sede"] });
      qc.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}
