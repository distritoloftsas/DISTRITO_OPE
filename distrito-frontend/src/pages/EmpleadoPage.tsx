import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { etiquetaRol } from "../types/auth";
import { KanbanBoard } from "../features/pedidos/KanbanBoard";
import { NuevoPedidoModal } from "../features/pedidos/NuevoPedidoModal";
import { PanelMaquinas } from "../features/maquinas/PanelMaquinas";

export function EmpleadoPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [ultimoQr, setUltimoQr] = useState<string | null>(null);

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
            onClick={() => setMostrarNuevo(true)}
            className="text-xs px-3 py-2 bg-distrito-black text-distrito-cream rounded-md"
          >
            + Nuevo pedido
          </button>
        </div>

        {ultimoQr && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3 mb-4 flex justify-between items-center">
            <span>
              ✓ Pedido <strong>{ultimoQr}</strong> creado.
            </span>
            <button
              onClick={() => setUltimoQr(null)}
              className="text-green-700 text-xs"
            >
              cerrar
            </button>
          </div>
        )}

        <PanelMaquinas />

        <KanbanBoard />
      </main>

      {mostrarNuevo && (
        <NuevoPedidoModal
          onClose={() => setMostrarNuevo(false)}
          onCreado={(qr) => {
            setUltimoQr(qr);
            setMostrarNuevo(false);
          }}
        />
      )}
    </div>
  );
}
