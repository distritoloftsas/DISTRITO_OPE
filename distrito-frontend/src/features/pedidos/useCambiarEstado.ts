import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { EstadoPedido, PedidoResponse } from "../../types/pedido";

interface Payload {
  pedidoId: number;
  nuevoEstado: EstadoPedido;
  observacion?: string;
  maquinaId?: number;
}

export function useCambiarEstado() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ pedidoId, nuevoEstado, observacion, maquinaId }: Payload) => {
      const { data } = await api.patch<PedidoResponse>(`/pedidos/${pedidoId}/estado`, {
        nuevoEstado,
        observacion,
        maquinaId,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      qc.invalidateQueries({ queryKey: ["maquinas"] });
    },
  });
}
