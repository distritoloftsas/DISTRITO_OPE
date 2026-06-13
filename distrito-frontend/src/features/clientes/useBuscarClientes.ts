import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { ClienteResponse } from "../../types/cliente";

export function useBuscarClientes(query: string) {
  const enabled = query.trim().length >= 2;

  return useQuery({
    queryKey: ["clientes", "buscar", query],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<ClienteResponse[]>("/clientes", {
        params: { q: query.trim() },
      });
      return data;
    },
    staleTime: 1000 * 30,
  });
}
