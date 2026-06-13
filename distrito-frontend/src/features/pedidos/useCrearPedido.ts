import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { PedidoResponse } from "../../types/pedido";

interface CrearPedidoPayload {
  clienteId: number;
  planId: number;
  observaciones?: string;
  fechaEntregaEstimada?: string;
}

export function useCrearPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CrearPedidoPayload) => {
      const { data } = await api.post<PedidoResponse>("/pedidos", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}
