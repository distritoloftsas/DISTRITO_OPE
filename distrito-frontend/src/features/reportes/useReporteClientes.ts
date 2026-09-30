import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export interface LineaClienteServicio {
  pedidoId: number;
  codigoQr: string;
  clienteNombre: string;
  clienteTelefono: string | null;
  fechaServicio: string;
  planNombre: string;
  fechaRegistroCliente: string | null;
}

export interface ClientesReporteResponse {
  desde: string;
  hasta: string;
  sedeId: number;
  sedeNombre: string;
  nuevos: LineaClienteServicio[];
  recurrentes: LineaClienteServicio[];
}

export function useReporteClientes(desde: string, hasta: string, sedeId?: number) {
  return useQuery<ClientesReporteResponse>({
    queryKey: ["reportes", "clientes", desde, hasta, sedeId ?? null],
    queryFn: async () => {
      const params = new URLSearchParams({ desde, hasta });
      if (sedeId) params.set("sedeId", String(sedeId));
      const { data } = await api.get<ClientesReporteResponse>(`/reportes/clientes?${params}`);
      return data;
    },
  });
}
