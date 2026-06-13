import { useState } from "react";
import { useBuscarClientes } from "../clientes/useBuscarClientes";
import { useCrearCliente } from "../clientes/useCrearCliente";
import { useCrearPedido } from "./useCrearPedido";
import { usePlanes } from "../planes/usePlanes";
import type { ClienteResponse } from "../../types/cliente";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

interface Props {
  onClose: () => void;
  onCreado: (codigoQr: string) => void;
}

export function NuevoPedidoModal({ onClose, onCreado }: Props) {
  const [modo, setModo] = useState<"buscar" | "nuevo">("buscar");
  const [busqueda, setBusqueda] = useState("");
  const [cliente, setCliente] = useState<ClienteResponse | null>(null);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccionPrincipal: "",
  });
  const [planId, setPlanId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState("");

  const { data: resultados, isFetching } = useBuscarClientes(busqueda);
  const { data: planes } = usePlanes();
  const crearCliente = useCrearCliente();
  const crearPedido = useCrearPedido();

  const planSeleccionado = planes?.find((p) => p.id === planId);
  const total = planSeleccionado?.precio ?? 0;

  const submit = async () => {
    let clienteId = cliente?.id;

    if (modo === "nuevo") {
      if (!nuevoCliente.nombre || !nuevoCliente.telefono) return;
      try {
        const creado = await crearCliente.mutateAsync({
          nombre: nuevoCliente.nombre,
          telefono: nuevoCliente.telefono,
          email: nuevoCliente.email || undefined,
          direccionPrincipal: nuevoCliente.direccionPrincipal || undefined,
        });
        clienteId = creado.id;
      } catch {
        return;
      }
    }

    if (!clienteId || !planId) return;

    try {
      const pedido = await crearPedido.mutateAsync({
        clienteId,
        planId,
        observaciones: observaciones || undefined,
      });
      onCreado(pedido.codigoQr);
    } catch {
      // error mostrado abajo
    }
  };

  const errorClienteMsg = errorMensaje(crearCliente.error);
  const errorPedidoMsg = errorMensaje(crearPedido.error);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h3 className="text-base font-medium">Nuevo pedido</h3>
            <p className="text-xs text-stone-500 mt-0.5">Sede Bambú</p>
          </div>
          <button onClick={onClose} className="text-stone-400 text-xl leading-none">×</button>
        </header>

        <div className="p-6 space-y-5">
          <Section titulo="Cliente">
            <div className="flex gap-2 mb-3">
              <Tab activa={modo === "buscar"} onClick={() => setModo("buscar")}>
                Buscar existente
              </Tab>
              <Tab activa={modo === "nuevo"} onClick={() => setModo("nuevo")}>
                Crear nuevo
              </Tab>
            </div>

            {modo === "buscar" ? (
              <div>
                <input
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  placeholder="Buscar por nombre o teléfono (mínimo 2 letras)"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setCliente(null);
                  }}
                />
                {isFetching && (
                  <p className="text-xs text-stone-400 mt-2">Buscando...</p>
                )}
                {resultados && resultados.length > 0 && (
                  <ul className="mt-2 border border-stone-200 rounded-lg divide-y divide-stone-100 max-h-44 overflow-y-auto">
                    {resultados.map((c) => (
                      <li
                        key={c.id}
                        onClick={() => setCliente(c)}
                        className={`px-3 py-2 text-sm cursor-pointer ${
                          cliente?.id === c.id ? "bg-distrito-cream" : "hover:bg-stone-50"
                        }`}
                      >
                        <p className="font-medium">{c.nombre}</p>
                        <p className="text-xs text-stone-500">
                          {c.telefono} · {c.lavadosAcumulados} lavados
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                {resultados && resultados.length === 0 && busqueda.length >= 2 && (
                  <p className="text-xs text-stone-500 mt-2">
                    Sin resultados.{" "}
                    <button
                      onClick={() => setModo("nuevo")}
                      className="text-distrito-gold-dark underline"
                    >
                      Crear nuevo cliente
                    </button>
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nombre *" value={nuevoCliente.nombre}
                  onChange={(v) => setNuevoCliente({ ...nuevoCliente, nombre: v })}/>
                <Input label="Teléfono *" value={nuevoCliente.telefono}
                  onChange={(v) => setNuevoCliente({ ...nuevoCliente, telefono: v })}/>
                <Input label="Email (opcional)" value={nuevoCliente.email}
                  onChange={(v) => setNuevoCliente({ ...nuevoCliente, email: v })}/>
                <Input label="Dirección (opcional)" value={nuevoCliente.direccionPrincipal}
                  onChange={(v) => setNuevoCliente({ ...nuevoCliente, direccionPrincipal: v })}/>
              </div>
            )}
            {errorClienteMsg && (
              <p className="text-xs text-red-600 mt-2">{errorClienteMsg}</p>
            )}
          </Section>

          <Section titulo="Plan">
            <div className="grid grid-cols-3 gap-2">
              {planes?.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanId(p.id)}
                  className={`border rounded-lg p-3 text-left ${
                    planId === p.id
                      ? "border-distrito-gold-dark bg-distrito-cream"
                      : "border-stone-200"
                  }`}
                >
                  <p className="text-xs font-medium">{p.nombre}</p>
                  <p className="text-sm mt-1">{formatoCOP.format(p.precio)}</p>
                </button>
              ))}
            </div>
          </Section>

          <Section titulo="Observaciones (opcional)">
            <textarea
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              rows={3}
              placeholder="Manchas, prendas frágiles, instrucciones..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </Section>

          <div className="bg-distrito-cream rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Total</span>
              <span className="font-medium">{formatoCOP.format(total)}</span>
            </div>
          </div>

          {errorPedidoMsg && (
            <p className="text-xs text-red-600">{errorPedidoMsg}</p>
          )}
        </div>

        <footer className="px-6 py-4 border-t border-stone-200 flex gap-2 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 border border-stone-300 text-sm py-2 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={
              !planId ||
              (modo === "buscar" && !cliente) ||
              (modo === "nuevo" && (!nuevoCliente.nombre || !nuevoCliente.telefono)) ||
              crearCliente.isPending ||
              crearPedido.isPending
            }
            className="flex-[2] bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
          >
            {crearCliente.isPending || crearPedido.isPending
              ? "Creando..."
              : "Crear pedido"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-stone-500 mb-2">{titulo}</p>
      {children}
    </div>
  );
}

function Tab({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`text-xs px-3 py-1.5 rounded-full border ${
        activa
          ? "bg-distrito-black text-distrito-cream border-distrito-black"
          : "border-stone-300 text-stone-600"
      }`}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-stone-600 mb-1">{label}</label>
      <input
        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function errorMensaje(err: unknown): string | null {
  if (!err) return null;
  const data = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
  return data ?? "Ocurrió un error";
}
