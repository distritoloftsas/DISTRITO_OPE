import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { EstadoPedido } from "../../types/pedido";

export interface HistorialEvento {
  id: number;
  estado: EstadoPedido;
  fecha: string;
  empleadoNombre: string | null;
  observacion: string | null;
}

export function useHistorialPedido(pedidoId: number | null) {
  return useQuery({
    queryKey: ["pedido-historial", pedidoId],
    queryFn: async () => {
      const { data } = await api.get<HistorialEvento[]>(`/pedidos/${pedidoId}/historial`);
      return data;
    },
    enabled: pedidoId !== null,
  });
}
