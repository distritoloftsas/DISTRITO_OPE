import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { EstadoPedido, PedidoResponse } from "../../types/pedido";

interface Params {
  estados?: EstadoPedido[];
}

export function useMisPedidos({ estados }: Params = {}) {
  return useQuery({
    queryKey: ["mis-pedidos", estados],
    queryFn: async () => {
      const { data } = await api.get<PedidoResponse[]>("/pedidos", {
        params: estados ? { estado: estados } : undefined,
        paramsSerializer: { indexes: null },
      });
      return data;
    },
    refetchInterval: 1000 * 30,
  });
}
