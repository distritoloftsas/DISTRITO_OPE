import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type {
  InsumoResponse,
  MovimientoResponse,
  TipoMovimientoInsumo,
  UnidadInsumo,
} from "../../types/insumo";

export function useInsumos() {
  return useQuery({
    queryKey: ["insumos"],
    queryFn: async () => {
      const { data } = await api.get<InsumoResponse[]>("/insumos");
      return data;
    },
  });
}

import { useAuthStore } from "../../store/authStore";
import { tienePermiso } from "../../types/auth";

export function useInsumosStockBajo() {
  const usuario = useAuthStore((s) => s.usuario);
  const habilitado = tienePermiso(usuario, "VER_INVENTARIO");
  return useQuery({
    queryKey: ["insumos-stock-bajo"],
    enabled: habilitado,
    queryFn: async () => {
      const { data } = await api.get<InsumoResponse[]>("/insumos/stock-bajo");
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useHistorialInsumo(insumoId: number | null) {
  return useQuery({
    queryKey: ["insumo-historial", insumoId],
    queryFn: async () => {
      const { data } = await api.get<MovimientoResponse[]>(`/insumos/${insumoId}/historial`);
      return data;
    },
    enabled: insumoId !== null,
  });
}

export interface CrearInsumoPayload {
  nombre: string;
  unidad: UnidadInsumo;
  stockInicial: number;
  stockMinimo: number;
  costoUnitario: number;
  sedeId?: number;
}

export function useCrearInsumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CrearInsumoPayload) => {
      const { data } = await api.post<InsumoResponse>("/insumos", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insumos"] }),
  });
}

export interface MovimientoPayload {
  tipo: TipoMovimientoInsumo;
  cantidad: number;
  costoUnitario?: number;
  motivo?: string;
}

export function useRegistrarMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ insumoId, ...payload }: MovimientoPayload & { insumoId: number }) => {
      const { data } = await api.post<InsumoResponse>(
        `/insumos/${insumoId}/movimientos`,
        payload
      );
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["insumos"] });
      qc.invalidateQueries({ queryKey: ["insumos-stock-bajo"] });
      qc.invalidateQueries({ queryKey: ["insumo-historial", vars.insumoId] });
    },
  });
}

export function useActualizarInsumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      insumoId,
      stockMinimo,
      costoUnitario,
      activo,
    }: {
      insumoId: number;
      stockMinimo?: number;
      costoUnitario?: number;
      activo?: boolean;
    }) => {
      const { data } = await api.patch<InsumoResponse>(`/insumos/${insumoId}`, {
        stockMinimo,
        costoUnitario,
        activo,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insumos"] }),
  });
}
