import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { etiquetaRol, tienePermiso } from "../types/auth";
import type { Permiso } from "../types/permiso";
import { confirmarCerrarSesion } from "../lib/confirmarSalir";
import { usePageTitle } from "../lib/usePageTitle";
import { EmpleadosTabla } from "../features/empleados/EmpleadosTabla";
import { NuevoEmpleadoModal } from "../features/empleados/NuevoEmpleadoModal";
import { MantenimientoMaquinas } from "../features/maquinas/MantenimientoMaquinas";
import { PanelMaquinas } from "../features/maquinas/PanelMaquinas";
import { CierreCajaSection } from "../features/reportes/CierreCajaSection";
import { ConsumoInsumosSection } from "../features/reportes/ConsumoInsumosSection";
import { VentasSection } from "../features/reportes/VentasSection";
import { KanbanBoard } from "../features/pedidos/KanbanBoard";
import { NuevoPedidoModal } from "../features/pedidos/NuevoPedidoModal";
import { InsumosTabla } from "../features/insumos/InsumosTabla";
import { NuevoInsumoModal } from "../features/insumos/NuevoInsumoModal";
import { AlertaStockBajo } from "../features/insumos/AlertaStockBajo";
import { AlertaSinRecoger } from "../features/pedidos/AlertaSinRecoger";
import { TurnoSection } from "../features/turno/TurnoSection";
import { RecetaPlanSection } from "../features/planes/RecetaPlanSection";
import { ToleranciaSection } from "../features/sede/ToleranciaSection";
import { ClientesTabla } from "../features/clientes/ClientesTabla";
import { ESTADOS_CERRADOS, ESTADOS_KANBAN } from "../types/pedido";

type Vista = "operacion" | "clientes" | "equipo" | "inventario" | "maquinas" | "reportes";

const VISTAS: { id: Vista; label: string; permiso: Permiso }[] = [
  { id: "operacion", label: "Operación", permiso: "VER_OPERACION" },
  { id: "clientes", label: "Clientes", permiso: "VER_CLIENTES" },
  { id: "equipo", label: "Equipo", permiso: "VER_EQUIPO" },
  { id: "inventario", label: "Inventario", permiso: "VER_INVENTARIO" },
  { id: "maquinas", label: "Máquinas", permiso: "GESTIONAR_MAQUINAS" },
  { id: "reportes", label: "Reportes", permiso: "VER_CIERRE_CAJA" },
];

export function GerentePage() {
  usePageTitle("Gerencia");
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();

  const [vista, setVista] = useState<Vista>("operacion");
  const [tabPedidos, setTabPedidos] = useState<"activos" | "cerrados">("activos");
  const [mostrarNuevoPedido, setMostrarNuevoPedido] = useState(false);
  const [mostrarNuevoEmpleado, setMostrarNuevoEmpleado] = useState(false);
  const [mostrarNuevoInsumo, setMostrarNuevoInsumo] = useState(false);
  const [ultimoQr, setUltimoQr] = useState<string | null>(null);
  const [empleadoCreado, setEmpleadoCreado] = useState<string | null>(null);
  const [insumoCreado, setInsumoCreado] = useState<string | null>(null);

  const cerrarSesion = () => confirmarCerrarSesion(navigate);

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

      <nav className="bg-white border-b border-stone-200 px-6 sticky top-0 z-30">
        <div className="flex gap-1 overflow-x-auto">
          {VISTAS.filter((v) => tienePermiso(usuario, v.permiso)).map((v) => (
            <NavTab key={v.id} active={vista === v.id} onClick={() => setVista(v.id)}>
              {v.label}
            </NavTab>
          ))}
        </div>
      </nav>

      <main className="flex-1 p-6">
        {vista === "operacion" && (
          <>
            <TurnoSection />
            {tienePermiso(usuario, "VER_INVENTARIO") && <AlertaStockBajo />}
            <AlertaSinRecoger />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">Tablero de pedidos</h2>
              <button
                onClick={() => setMostrarNuevoPedido(true)}
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
                <button onClick={() => setUltimoQr(null)} className="text-green-700 text-xs">
                  cerrar
                </button>
              </div>
            )}

            <PanelMaquinas />

            <div className="flex gap-1 mb-3 border-b border-stone-200">
              <SubTab active={tabPedidos === "activos"} onClick={() => setTabPedidos("activos")}>
                En curso
              </SubTab>
              <SubTab active={tabPedidos === "cerrados"} onClick={() => setTabPedidos("cerrados")}>
                Cerrados
              </SubTab>
            </div>

            <KanbanBoard estados={tabPedidos === "activos" ? ESTADOS_KANBAN : ESTADOS_CERRADOS} />
          </>
        )}

        {vista === "clientes" && (
          <>
            <h2 className="text-base font-medium mb-4">Clientes</h2>
            <ClientesTabla />
          </>
        )}

        {vista === "equipo" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">Equipo de la sede</h2>
              <button
                onClick={() => setMostrarNuevoEmpleado(true)}
                className="text-xs px-3 py-2 bg-distrito-black text-distrito-cream rounded-md"
              >
                + Nuevo empleado
              </button>
            </div>

            {empleadoCreado && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3 mb-4 flex justify-between items-center">
                <span>
                  ✓ Empleado <strong>{empleadoCreado}</strong> creado. Entrégale su contraseña inicial.
                </span>
                <button onClick={() => setEmpleadoCreado(null)} className="text-green-700 text-xs">
                  cerrar
                </button>
              </div>
            )}

            <EmpleadosTabla />
          </>
        )}

        {vista === "inventario" && (
          <>
            <AlertaStockBajo />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">Inventario de insumos</h2>
              <button
                onClick={() => setMostrarNuevoInsumo(true)}
                className="text-xs px-3 py-2 bg-distrito-black text-distrito-cream rounded-md"
              >
                + Nuevo insumo
              </button>
            </div>

            {insumoCreado && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3 mb-4 flex justify-between items-center">
                <span>
                  ✓ Insumo <strong>{insumoCreado}</strong> registrado.
                </span>
                <button onClick={() => setInsumoCreado(null)} className="text-green-700 text-xs">
                  cerrar
                </button>
              </div>
            )}

            <InsumosTabla />

            {tienePermiso(usuario, "GESTIONAR_RECETAS") && (
              <div className="mt-8">
                <RecetaPlanSection />
              </div>
            )}
          </>
        )}

        {vista === "maquinas" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-base font-medium mb-4">Mantenimiento de máquinas</h2>
              <MantenimientoMaquinas />
            </div>
            {tienePermiso(usuario, "GESTIONAR_TOLERANCIA") && <ToleranciaSection />}
          </div>
        )}

        {vista === "reportes" && (
          <div className="space-y-8">
            {tienePermiso(usuario, "VER_CIERRE_CAJA") && <CierreCajaSection />}
            {tienePermiso(usuario, "VER_REPORTES_VENTAS") && <VentasSection />}
            {tienePermiso(usuario, "VER_REPORTES_INSUMOS") && <ConsumoInsumosSection />}
          </div>
        )}
      </main>

      {mostrarNuevoPedido && (
        <NuevoPedidoModal
          onClose={() => setMostrarNuevoPedido(false)}
          onCreado={(qr) => {
            setUltimoQr(qr);
            setMostrarNuevoPedido(false);
          }}
        />
      )}

      {mostrarNuevoEmpleado && (
        <NuevoEmpleadoModal
          onClose={() => setMostrarNuevoEmpleado(false)}
          onCreado={(nombre) => {
            setEmpleadoCreado(nombre);
            setMostrarNuevoEmpleado(false);
          }}
        />
      )}

      {mostrarNuevoInsumo && (
        <NuevoInsumoModal
          onClose={() => setMostrarNuevoInsumo(false)}
          onCreado={(nombre) => {
            setInsumoCreado(nombre);
            setMostrarNuevoInsumo(false);
          }}
        />
      )}
    </div>
  );
}

function NavTab({
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
      className={`text-sm px-4 py-3 -mb-px border-b-2 whitespace-nowrap ${
        active
          ? "border-distrito-gold-dark text-distrito-black font-medium"
          : "border-transparent text-stone-500 hover:text-stone-700"
      }`}
    >
      {children}
    </button>
  );
}

function SubTab({
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
