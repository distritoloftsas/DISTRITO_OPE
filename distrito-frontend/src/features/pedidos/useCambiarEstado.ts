import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { EstadoPedido, PedidoResponse, TipoCicloLavadora } from "../../types/pedido";

interface Payload {
  pedidoId: number;
  nuevoEstado: EstadoPedido;
  observacion?: string;
  maquinaId?: number;
  tipoCicloLavadora?: TipoCicloLavadora;
}

export function useCambiarEstado() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pedidoId,
      nuevoEstado,
      observacion,
      maquinaId,
      tipoCicloLavadora,
    }: Payload) => {
      const { data } = await api.patch<PedidoResponse>(`/pedidos/${pedidoId}/estado`, {
        nuevoEstado,
        observacion,
        maquinaId,
        tipoCicloLavadora,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      qc.invalidateQueries({ queryKey: ["maquinas"] });
    },
  });
}
