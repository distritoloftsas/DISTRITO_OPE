import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { EstadoMaquina, MaquinaResponse } from "../../types/maquina";

export function useCambiarEstadoMaquina() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: EstadoMaquina }) => {
      const { data } = await api.patch<MaquinaResponse>(`/maquinas/${id}/estado`, { estado });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maquinas"] }),
  });
}
