import { useState } from "react";
import { useEscape } from "../../lib/useEscape";
import { useActualizarPermisos } from "./useEmpleados";
import { ETIQUETA_PERMISO, TODOS_PERMISOS, type Permiso } from "../../types/permiso";
import type { EmpleadoResponse } from "../../types/empleado";

interface Props {
  empleado: EmpleadoResponse;
  onClose: () => void;
}

export function PermisosModal({ empleado, onClose }: Props) {
  useEscape(onClose);
  const [seleccion, setSeleccion] = useState<Set<Permiso>>(
    new Set(empleado.permisos ?? [])
  );
  const actualizar = useActualizarPermisos();

  const toggle = (p: Permiso) => {
    const nuevo = new Set(seleccion);
    if (nuevo.has(p)) nuevo.delete(p);
    else nuevo.add(p);
    setSeleccion(nuevo);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await actualizar.mutateAsync({
      id: empleado.id,
      permisos: Array.from(seleccion),
    });
    onClose();
  };

  const err = (actualizar.error as { response?: { data?: { mensaje?: string } } })
    ?.response?.data?.mensaje;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl border border-stone-200 w-full max-w-md max-h-[90vh] flex flex-col"
      >
        <header className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-base font-medium">Permisos · {empleado.nombre}</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Marca solo las vistas y acciones que este usuario debe usar.
          </p>
        </header>

        <div className="p-6 space-y-2 overflow-y-auto flex-1">
          {TODOS_PERMISOS.map((p) => (
            <label
              key={p}
              className="flex items-center gap-3 cursor-pointer text-sm hover:bg-stone-50 rounded px-2 py-1.5"
            >
              <input
                type="checkbox"
                checked={seleccion.has(p)}
                onChange={() => toggle(p)}
                className="w-4 h-4 accent-distrito-gold-dark"
              />
              <span>{ETIQUETA_PERMISO[p]}</span>
            </label>
          ))}
        </div>

        {err && <p className="text-xs text-red-600 px-6 pb-2">{err}</p>}

        <footer className="px-6 py-4 border-t border-stone-200 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-stone-300 text-sm py-2 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={actualizar.isPending}
            className="flex-[2] bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
          >
            {actualizar.isPending ? "Guardando..." : `Guardar (${seleccion.size})`}
          </button>
        </footer>
      </form>
    </div>
  );
}
