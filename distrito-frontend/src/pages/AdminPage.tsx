import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { etiquetaRol } from "../types/auth";
import { useSedesKpis, useCambiarActivaSede, type SedeKpis } from "../features/sedes/useSedes";
import { NuevaSedeModal } from "../features/sedes/NuevaSedeModal";
import { CierreCajaSection } from "../features/reportes/CierreCajaSection";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function AdminPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  const { data, isLoading, isError } = useSedesKpis();
  const cambiarActiva = useCambiarActivaSede();

  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [creada, setCreada] = useState<string | null>(null);
  const [sedeDetalle, setSedeDetalle] = useState<SedeKpis | null>(null);

  const cerrarSesion = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  if (!usuario) return null;

  const sedes = data ?? [];
  const totalIngresos = sedes.reduce((acc, s) => acc + s.ingresosHoy, 0);
  const totalActivos = sedes.reduce((acc, s) => acc + s.pedidosActivos, 0);
  const totalEmpleados = sedes.reduce((acc, s) => acc + s.empleadosActivos, 0);

  return (
    <div className="min-h-screen flex flex-col bg-distrito-cream">
      <header className="bg-distrito-black text-distrito-cream px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-distrito-gold font-medium tracking-widest text-sm">DL</span>
          <div>
            <p className="text-sm font-medium leading-none">Distrito Loft</p>
            <p className="text-xs text-distrito-gold mt-1">Administración nacional</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs leading-none">{usuario.nombre}</p>
            <p className="text-[10px] text-distrito-gold mt-1">{etiquetaRol(usuario.rol)}</p>
          </div>
          <button
            onClick={cerrarSesion}
            className="text-xs px-3 py-1.5 border border-distrito-gold text-distrito-gold rounded-md"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Tarjeta titulo="Sedes" valor={sedes.length.toString()} />
          <Tarjeta titulo="Pedidos activos" valor={totalActivos.toString()} />
          <Tarjeta titulo="Ingresos hoy (todas)" valor={formatoCOP.format(totalIngresos)} />
          <Tarjeta titulo="Empleados activos" valor={totalEmpleados.toString()} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">Sedes</h2>
          <button
            onClick={() => setMostrarNueva(true)}
            className="text-xs px-3 py-2 bg-distrito-black text-distrito-cream rounded-md"
          >
            + Nueva sede
          </button>
        </div>

        {creada && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3 mb-4 flex justify-between items-center">
            <span>
              ✓ Sede <strong>{creada}</strong> creada con 3 lavadoras y 3 secadoras.
            </span>
            <button onClick={() => setCreada(null)} className="text-green-700 text-xs">
              cerrar
            </button>
          </div>
        )}

        {isLoading && <p className="text-sm text-stone-500">Cargando sedes...</p>}
        {isError && <p className="text-sm text-red-600">No se pudieron cargar las sedes.</p>}

        {sedes.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs">
                <tr>
                  <th className="text-left px-4 py-2">Sede</th>
                  <th className="text-left px-4 py-2">Activos</th>
                  <th className="text-left px-4 py-2">Hoy</th>
                  <th className="text-right px-4 py-2">Ingresos hoy</th>
                  <th className="text-left px-4 py-2">Empleados</th>
                  <th className="text-left px-4 py-2">Máquinas</th>
                  <th className="text-left px-4 py-2">Estado</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {sedes.map((s) => (
                  <tr key={s.id} className="border-t border-stone-100">
                    <td className="px-4 py-2">
                      <p className="font-medium">{s.nombre}</p>
                      <p className="text-[10px] text-stone-500">{s.ciudad}</p>
                    </td>
                    <td className="px-4 py-2 text-xs">{s.pedidosActivos}</td>
                    <td className="px-4 py-2 text-xs">{s.pedidosHoy}</td>
                    <td className="px-4 py-2 text-xs text-right font-medium">
                      {formatoCOP.format(s.ingresosHoy)}
                    </td>
                    <td className="px-4 py-2 text-xs">{s.empleadosActivos}</td>
                    <td className="px-4 py-2 text-xs">
                      <span className="text-green-700">{s.maquinasLibres}</span> /
                      <span className="text-blue-700"> {s.maquinasOcupadas}</span> /
                      <span className="text-stone-500"> {s.maquinasMantenimiento}</span>
                      <p className="text-[9px] text-stone-400">libre / uso / mant.</p>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          s.activa ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {s.activa ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-1">
                      <button
                        onClick={() => setSedeDetalle(s)}
                        className="text-xs px-2 py-1 border border-stone-300 rounded"
                      >
                        Cierre
                      </button>
                      <button
                        onClick={() => cambiarActiva.mutate({ id: s.id, activa: !s.activa })}
                        disabled={cambiarActiva.isPending}
                        className={`text-xs px-2 py-1 rounded border ${
                          s.activa
                            ? "border-red-300 text-red-700"
                            : "border-green-300 text-green-700"
                        }`}
                      >
                        {s.activa ? "Desactivar" : "Reactivar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sedeDetalle && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium">
                Cierre de caja — {sedeDetalle.nombre}
              </h2>
              <button
                onClick={() => setSedeDetalle(null)}
                className="text-xs text-stone-500"
              >
                Ocultar
              </button>
            </div>
            <CierreCajaSection
              sedeId={sedeDetalle.id}
              titulo={`Cierre · ${sedeDetalle.nombre}`}
            />
          </div>
        )}
      </main>

      {mostrarNueva && (
        <NuevaSedeModal
          onClose={() => setMostrarNueva(false)}
          onCreada={(nombre) => {
            setCreada(nombre);
            setMostrarNueva(false);
          }}
        />
      )}
    </div>
  );
}

function Tarjeta({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-wider text-stone-500">{titulo}</p>
      <p className="text-lg font-medium mt-1">{valor}</p>
    </div>
  );
}
