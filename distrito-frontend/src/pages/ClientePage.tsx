import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { confirmarCerrarSesion } from "../lib/confirmarSalir";
import { usePageTitle } from "../lib/usePageTitle";
import { useMisPedidos } from "../features/pedidos/misPedidos";
import { PedidoClienteCard } from "../features/pedidos/PedidoClienteCard";
import { HistorialPedidoModal } from "../features/pedidos/HistorialPedidoModal";
import { MiPerfilSection } from "../features/clientes/MiPerfilSection";
import { ESTADOS_CERRADOS, ESTADOS_KANBAN, type PedidoResponse } from "../types/pedido";

type Vista = "pedidos" | "perfil";

export function ClientePage() {
  usePageTitle("Mi cuenta");
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const [vista, setVista] = useState<Vista>("pedidos");
  const [tab, setTab] = useState<"activos" | "cerrados">("activos");
  const [verPedido, setVerPedido] = useState<PedidoResponse | null>(null);

  const estados = tab === "activos" ? ESTADOS_KANBAN : ESTADOS_CERRADOS;
  const { data, isLoading, isError } = useMisPedidos({ estados });

  const cerrarSesion = () => confirmarCerrarSesion(navigate);

  if (!usuario) return null;

  return (
    <div className="min-h-screen flex flex-col bg-distrito-cream">
      <header className="bg-distrito-black text-distrito-cream px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-distrito-gold font-medium tracking-widest text-sm">DL</span>
          <div>
            <p className="text-sm font-medium leading-none">Distrito Loft</p>
            <p className="text-xs text-distrito-gold mt-1">Mi cuenta</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs leading-none">{usuario.nombre}</p>
            <p className="text-[10px] text-distrito-gold mt-1">Cliente</p>
          </div>
          <button
            onClick={cerrarSesion}
            className="text-xs px-3 py-1.5 border border-distrito-gold text-distrito-gold rounded-md"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-stone-200 px-6">
        <div className="flex gap-1 max-w-2xl mx-auto">
          <TopTab active={vista === "pedidos"} onClick={() => setVista("pedidos")}>
            Mis pedidos
          </TopTab>
          <TopTab active={vista === "perfil"} onClick={() => setVista("perfil")}>
            Mi perfil
          </TopTab>
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-2xl w-full mx-auto">
        {vista === "pedidos" && (
          <>
            <h2 className="text-base font-medium mb-3">Mis pedidos</h2>

            <div className="flex gap-1 mb-4 border-b border-stone-200">
              <TabBtn active={tab === "activos"} onClick={() => setTab("activos")}>
                En curso
              </TabBtn>
              <TabBtn active={tab === "cerrados"} onClick={() => setTab("cerrados")}>
                Historial
              </TabBtn>
            </div>

            {isLoading && <p className="text-sm text-stone-500">Cargando pedidos...</p>}
            {isError && (
              <p className="text-sm text-red-600">No se pudieron cargar tus pedidos.</p>
            )}

            {data && data.length === 0 && (
              <div className="border border-dashed border-stone-300 rounded-lg p-10 text-center text-sm text-stone-500">
                {tab === "activos"
                  ? "Aún no tienes pedidos en curso."
                  : "Sin pedidos en tu historial."}
              </div>
            )}

            {data?.map((p) => (
              <PedidoClienteCard key={p.id} pedido={p} onVer={() => setVerPedido(p)} />
            ))}
          </>
        )}

        {vista === "perfil" && <MiPerfilSection />}
      </main>

      {verPedido && (
        <HistorialPedidoModal pedido={verPedido} onClose={() => setVerPedido(null)} />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-4 py-2 -mb-px border-b-2 ${
        active
          ? "border-distrito-gold-dark text-distrito-black font-medium"
          : "border-transparent text-stone-500 hover:text-stone-700"
      }`}
    >
      {children}
    </button>
  );
}

function TopTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-4 py-3 -mb-px border-b-2 ${
        active
          ? "border-distrito-gold-dark text-distrito-black font-medium"
          : "border-transparent text-stone-500 hover:text-stone-700"
      }`}
    >
      {children}
    </button>
  );
}
