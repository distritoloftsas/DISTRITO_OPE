import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { etiquetaRol } from "../types/auth";
import { EmpleadosTabla } from "../features/empleados/EmpleadosTabla";
import { NuevoEmpleadoModal } from "../features/empleados/NuevoEmpleadoModal";
import { MantenimientoMaquinas } from "../features/maquinas/MantenimientoMaquinas";
import { CierreCajaSection } from "../features/reportes/CierreCajaSection";

export function GerentePage() {
  const usuario = useAuthStore((s) => s.usuario);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [creado, setCreado] = useState<string | null>(null);

  const cerrarSesion = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen flex flex-col bg-distrito-cream">
      <header className="bg-distrito-black text-distrito-cream px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-distrito-gold font-medium tracking-widest text-sm">DL</span>
          <div>
            <p className="text-sm font-medium leading-none">Distrito Loft</p>
            <p className="text-xs text-distrito-gold mt-1">
              Gerencia de sede{usuario.sedeNombre ? ` · ${usuario.sedeNombre}` : ""}
            </p>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">Equipo de la sede</h2>
          <button
            onClick={() => setMostrarNuevo(true)}
            className="text-xs px-3 py-2 bg-distrito-black text-distrito-cream rounded-md"
          >
            + Nuevo empleado
          </button>
        </div>

        {creado && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3 mb-4 flex justify-between items-center">
            <span>
              ✓ Empleado <strong>{creado}</strong> creado. Entrégale su contraseña inicial.
            </span>
            <button onClick={() => setCreado(null)} className="text-green-700 text-xs">
              cerrar
            </button>
          </div>
        )}

        <EmpleadosTabla />

        <h2 className="text-base font-medium mt-8 mb-4">Máquinas</h2>
        <MantenimientoMaquinas />

        <div className="mt-8">
          <CierreCajaSection />
        </div>
      </main>

      {mostrarNuevo && (
        <NuevoEmpleadoModal
          onClose={() => setMostrarNuevo(false)}
          onCreado={(nombre) => {
            setCreado(nombre);
            setMostrarNuevo(false);
          }}
        />
      )}
    </div>
  );
}
