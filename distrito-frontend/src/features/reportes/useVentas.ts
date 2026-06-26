import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { EstadoPedido } from "../../types/pedido";

export interface VentasResponse {
  desde: string;
  hasta: string;
  sedeId: number;
  sedeNombre: string;
  totalVentas: number;
  totalLavadas: number;
  lineas: LineaVenta[];
}

export interface LineaVenta {
  pedidoId: number;
  codigoQr: string;
  fechaRecepcion: string;
  clienteNombre: string;
  planNombre: string;
  total: number;
  pagado: boolean;
  estado: EstadoPedido;
}

export function useVentas(desde: string, hasta: string, sedeId?: number) {
  return useQuery({
    queryKey: ["ventas", desde, hasta, sedeId],
    queryFn: async () => {
      const { data } = await api.get<VentasResponse>("/reportes/ventas", {
        params: { desde, hasta, sedeId },
      });
      return data;
    },
  });
}
