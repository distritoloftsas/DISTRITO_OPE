import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export interface LineaPedidoConsolidado {
  id: number;
  codigoQr: string;
  fechaRecepcion: string;
  cliente: string;
  planNombre: string;
  estado: string;
  subtotal: number;
  descuentoCodigo: string | null;
  descuentoEtiqueta: string | null;
  montoDescuento: number;
  costoDomicilio: number;
  total: number;
  pagado: boolean;
  /** "EFECTIVO" | "TRANSFERENCIA" | "DATAFONO" | "MIXTO" | null */
  metodoPago: string | null;
}

export interface LineaDescuentoConsolidado {
  codigo: string;
  etiqueta: string;
  cantidadPedidos: number;
  montoDescontado: number;
}

export interface LineaPagoMetodo {
  metodo: "EFECTIVO" | "TRANSFERENCIA" | "DATAFONO";
  cantidadPagos: number;
  monto: number;
}

export interface LineaReembolso {
  pedidoId: number;
  codigoQr: string;
  fechaCancelacion: string;
  cliente: string;
  planNombre: string;
  montoReembolsado: number;
}

export interface ConsolidadoResponse {
  desde: string;
  hasta: string;
  sedeId: number;
  sedeNombre: string;
  totales: {
    cantidadPedidos: number;
    cantidadPedidosCancelados: number;
    subtotalBruto: number;
    totalDescuentos: number;
    totalDomicilios: number;
    totalFacturado: number;
    ticketPromedio: number;
    totalReembolsos: number;
  };
  pedidos: LineaPedidoConsolidado[];
  descuentosPorTipo: LineaDescuentoConsolidado[];
  pagosPorMetodo: LineaPagoMetodo[];
  reembolsos: LineaReembolso[];
}

export function useConsolidado(desde: string, hasta: string, sedeId?: number) {
  return useQuery<ConsolidadoResponse>({
    queryKey: ["reportes", "consolidado", desde, hasta, sedeId ?? null],
    queryFn: async () => {
      const params = new URLSearchParams({ desde, hasta });
      if (sedeId) params.set("sedeId", String(sedeId));
      const { data } = await api.get<ConsolidadoResponse>(`/reportes/consolidado?${params}`);
      return data;
    },
  });
}
