import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { etiquetaRol } from "../types/auth";
import { KanbanBoard } from "../features/pedidos/KanbanBoard";

export function EmpleadoPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

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
            <p className="text-xs text-distrito-gold mt-1">Operación de sede</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs leading-none">{usuario.nombre}</p>
            <p className="text-[10px] text-distrito-gold mt-1">
              {etiquetaRol(usuario.rol)}
            </p>
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
          <h2 className="text-base font-medium">Tablero de pedidos</h2>
          <button
            disabled
            className="text-xs px-3 py-2 bg-distrito-black text-distrito-cream rounded-md opacity-50 cursor-not-allowed"
          >
            + Nuevo pedido (próximamente)
          </button>
        </div>
        <KanbanBoard />
      </main>
    </div>
  );
}
