import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { EmpleadoResponse } from "../../types/empleado";
import type { RolUsuario } from "../../types/auth";

export function useEmpleados() {
  return useQuery({
    queryKey: ["empleados"],
    queryFn: async () => {
      const { data } = await api.get<EmpleadoResponse[]>("/empleados");
      return data;
    },
  });
}

export interface CrearEmpleadoPayload {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  cargo?: string;
  rol: RolUsuario;
  sedeId?: number;
}

export function useCrearEmpleado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CrearEmpleadoPayload) => {
      const { data } = await api.post<EmpleadoResponse>("/empleados", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empleados"] }),
  });
}

export function useCambiarActivoEmpleado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, activo }: { id: number; activo: boolean }) => {
      const { data } = await api.patch<EmpleadoResponse>(`/empleados/${id}/activo`, { activo });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empleados"] }),
  });
}
