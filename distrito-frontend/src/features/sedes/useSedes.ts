import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export interface SedeKpis {
  id: number;
  nombre: string;
  ciudad: string;
  activa: boolean;
  pedidosActivos: number;
  pedidosHoy: number;
  ingresosHoy: number;
  empleadosActivos: number;
  maquinasLibres: number;
  maquinasOcupadas: number;
  maquinasMantenimiento: number;
}

export function useSedesKpis() {
  return useQuery({
    queryKey: ["sedes-kpis"],
    queryFn: async () => {
      const { data } = await api.get<SedeKpis[]>("/sedes/admin");
      return data;
    },
    refetchInterval: 30_000,
  });
}

export interface CrearSedePayload {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono?: string;
}

export function useCrearSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CrearSedePayload) => {
      const { data } = await api.post("/sedes", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sedes-kpis"] }),
  });
}

export function useCambiarActivaSede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, activa }: { id: number; activa: boolean }) => {
      const { data } = await api.patch(`/sedes/${id}/activa`, { activa });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sedes-kpis"] }),
  });
}
