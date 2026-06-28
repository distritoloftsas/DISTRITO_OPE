import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { UnidadInsumo } from "../../types/insumo";

export type FaseConsumo = "LAVADO" | "SECADO";

export interface PlanConsumoResponse {
  id: number;
  planId: number;
  insumoId: number;
  insumoNombre: string;
  insumoUnidad: UnidadInsumo;
  sedeId: number;
  sedeNombre: string;
  fase: FaseConsumo;
  cantidad: number;
  unidad: UnidadInsumo;
}

export function usePlanConsumos(planId: number | null) {
  return useQuery({
    queryKey: ["plan-consumo", planId],
    queryFn: async () => {
      const { data } = await api.get<PlanConsumoResponse[]>(`/planes/${planId}/consumos`);
      return data;
    },
    enabled: planId !== null,
  });
}

export interface CrearPlanConsumoPayload {
  planId: number;
  insumoId: number;
  fase: FaseConsumo;
  cantidad: number;
  unidad: UnidadInsumo;
}

export function useCrearPlanConsumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, insumoId, fase, cantidad, unidad }: CrearPlanConsumoPayload) => {
      const { data } = await api.post<PlanConsumoResponse>(
        `/planes/${planId}/consumos`,
        { insumoId, fase, cantidad, unidad }
      );
      return data;
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["plan-consumo", vars.planId] }),
  });
}

export function useEliminarPlanConsumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number; planId: number }) => {
      await api.delete(`/planes/consumos/${id}`);
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["plan-consumo", vars.planId] }),
  });
}
