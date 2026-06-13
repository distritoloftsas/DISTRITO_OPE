import { useEmpleados, useCambiarActivoEmpleado } from "./useEmpleados";
import { etiquetaRol } from "../../types/auth";

export function EmpleadosTabla() {
  const { data, isLoading, isError } = useEmpleados();
  const cambiar = useCambiarActivoEmpleado();

  if (isLoading) return <p className="text-sm text-stone-500">Cargando empleados...</p>;
  if (isError) return <p className="text-sm text-red-600">No se pudieron cargar los empleados.</p>;

  const empleados = data ?? [];

  if (empleados.length === 0) {
    return (
      <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center text-sm text-stone-500">
        Aún no hay empleados registrados.
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-stone-600 text-xs">
          <tr>
            <th className="text-left px-4 py-2">Nombre</th>
            <th className="text-left px-4 py-2">Email</th>
            <th className="text-left px-4 py-2">Rol</th>
            <th className="text-left px-4 py-2">Sede</th>
            <th className="text-left px-4 py-2">Estado</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((e) => (
            <tr key={e.id} className="border-t border-stone-100">
              <td className="px-4 py-2">
                <p>{e.nombre}</p>
                {e.cargo && <p className="text-[10px] text-stone-500">{e.cargo}</p>}
              </td>
              <td className="px-4 py-2 text-stone-600">{e.email}</td>
              <td className="px-4 py-2 text-xs">{etiquetaRol(e.rol)}</td>
              <td className="px-4 py-2 text-xs">{e.sede?.nombre ?? "—"}</td>
              <td className="px-4 py-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    e.activo
                      ? "bg-green-100 text-green-800"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {e.activo ? "Activo" : "Inactivo"}
                </span>
                {e.mustChangePassword && (
                  <span className="ml-2 text-[10px] text-amber-700">
                    Pendiente cambio password
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => cambiar.mutate({ id: e.id, activo: !e.activo })}
                  disabled={cambiar.isPending}
                  className={`text-xs px-2 py-1 rounded border ${
                    e.activo
                      ? "border-red-300 text-red-700"
                      : "border-green-300 text-green-700"
                  }`}
                >
                  {e.activo ? "Desactivar" : "Reactivar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
