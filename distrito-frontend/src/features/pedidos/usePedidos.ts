import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { EstadoPedido, PedidoResponse } from "../../types/pedido";
import { ESTADOS_KANBAN } from "../../types/pedido";

interface Params {
  estados?: EstadoPedido[];
}

export function usePedidos({ estados = ESTADOS_KANBAN }: Params = {}) {
  return useQuery({
    queryKey: ["pedidos", estados],
    queryFn: async () => {
      const { data } = await api.get<PedidoResponse[]>("/pedidos", {
        params: { estado: estados },
        paramsSerializer: { indexes: null },
      });
      return data;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}
