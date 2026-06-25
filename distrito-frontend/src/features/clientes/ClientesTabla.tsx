import { useState } from "react";
import { useConteoClientes, useListarClientes } from "./useClientes";
import { EditarClienteModal } from "./EditarClienteModal";
import type { ClienteResponse } from "../../types/cliente";

export function ClientesTabla() {
  const [q, setQ] = useState("");
  const [editar, setEditar] = useState<ClienteResponse | null>(null);

  const { data: clientes, isLoading } = useListarClientes(q);
  const { data: total } = useConteoClientes();

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Tarjeta titulo="Total de clientes" valor={total != null ? total.toString() : "—"} />
        <Tarjeta
          titulo="Resultados visibles"
          valor={(clientes?.length ?? 0).toString()}
        />
        <Tarjeta
          titulo="Con cuenta (portal)"
          valor={(clientes?.filter((c) => c.conPortal).length ?? 0).toString()}
        />
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o teléfono..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg mb-3"
      />

      {isLoading && <p className="text-sm text-stone-500">Cargando clientes...</p>}

      {clientes && clientes.length === 0 && (
        <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center text-sm text-stone-500">
          {q ? `No hay clientes que coincidan con "${q}".` : "Aún no tienes clientes registrados."}
        </div>
      )}

      {clientes && clientes.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs">
              <tr>
                <th className="text-left px-4 py-2">Nombre</th>
                <th className="text-left px-4 py-2">Teléfono</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-right px-4 py-2">Lavados</th>
                <th className="text-center px-4 py-2">Cuenta</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-t border-stone-100">
                  <td className="px-4 py-2 font-medium">{c.nombre}</td>
                  <td className="px-4 py-2 text-xs">{c.telefono}</td>
                  <td className="px-4 py-2 text-xs text-stone-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-2 text-xs text-right">{c.lavadosAcumulados}</td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        c.conPortal
                          ? "bg-green-100 text-green-800"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {c.conPortal ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => setEditar(c)}
                      className="text-xs px-2 py-1 border border-stone-300 rounded"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editar && (
        <EditarClienteModal
          cliente={editar}
          onClose={() => setEditar(null)}
          onGuardado={() => setEditar(null)}
        />
      )}
    </section>
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
