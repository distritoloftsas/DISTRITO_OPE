import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { notify, mensajeDeError } from "../../lib/notify";
import type { EmpleadoResponse } from "../../types/empleado";
import type { RolUsuario } from "../../types/auth";

export function useEmpleados(sedeId?: number) {
  return useQuery({
    queryKey: ["empleados", sedeId ?? "mia"],
    queryFn: async () => {
      const { data } = await api.get<EmpleadoResponse[]>("/empleados", {
        params: sedeId ? { sedeId } : undefined,
      });
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
    onSuccess: (e) => {
      qc.invalidateQueries({ queryKey: ["empleados"] });
      notify.exito(`${e.nombre} creado. Entrégale su contraseña inicial.`, "Empleado registrado");
    },
    onError: (err) => notify.error(mensajeDeError(err, "No se pudo crear el empleado.")),
  });
}

export function useCambiarActivoEmpleado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, activo }: { id: number; activo: boolean }) => {
      const { data } = await api.patch<EmpleadoResponse>(`/empleados/${id}/activo`, { activo });
      return data;
    },
    onSuccess: (e) => {
      qc.invalidateQueries({ queryKey: ["empleados"] });
      notify.exito(`${e.nombre} ${e.activo ? "reactivado" : "desactivado"}.`);
    },
    onError: (err) => notify.error(mensajeDeError(err, "No se pudo cambiar el estado.")),
  });
}

import type { Permiso } from "../../types/permiso";

export function useActualizarPermisos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, permisos }: { id: number; permisos: Permiso[] }) => {
      const { data } = await api.patch<EmpleadoResponse>(
        `/empleados/${id}/permisos`,
        { permisos }
      );
      return data;
    },
    onSuccess: (e) => {
      qc.invalidateQueries({ queryKey: ["empleados"] });
      notify.exito(`Permisos de ${e.nombre} actualizados.`);
    },
    onError: (err) => notify.error(mensajeDeError(err, "No se pudieron guardar los permisos.")),
  });
}
