import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { UnidadInsumo } from "../../types/insumo";

export interface ConsumoInsumosResponse {
  desde: string;
  hasta: string;
  sedeId: number;
  sedeNombre: string;
  costoTotal: number;
  pedidosAfectados: number;
  lineas: LineaConsumo[];
}

export interface LineaConsumo {
  insumoId: number;
  insumoNombre: string;
  unidad: UnidadInsumo;
  cantidadTotal: number;
  costoTotal: number;
  movimientos: number;
  pedidosAfectados: number;
}

export function useConsumoInsumos(desde: string, hasta: string, sedeId?: number) {
  return useQuery({
    queryKey: ["consumo-insumos", desde, hasta, sedeId],
    queryFn: async () => {
      const { data } = await api.get<ConsumoInsumosResponse>("/reportes/consumo-insumos", {
        params: { desde, hasta, sedeId },
      });
      return data;
    },
  });
}
