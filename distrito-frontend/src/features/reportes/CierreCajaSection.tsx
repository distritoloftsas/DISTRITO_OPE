import { useState } from "react";
import { useCierreCaja } from "./useCierreCaja";
import type { MetodoPago } from "../../types/pedido";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoHora = new Intl.DateTimeFormat("es-CO", { timeStyle: "short" });

const METODO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  DATAFONO: "Datáfono",
};

function hoyISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function CierreCajaSection() {
  const [fecha, setFecha] = useState<string>(hoyISO());
  const { data, isLoading, isError, error } = useCierreCaja(fecha);

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-base font-medium">Cierre de caja</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-600">Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            max={hoyISO()}
            className="text-xs px-2 py-1.5 border border-stone-300 rounded-md"
          />
        </div>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Cargando reporte...</p>}
      {isError && (
        <p className="text-sm text-red-600">
          {(error as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ??
            "No se pudo cargar el reporte."}
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Tarjeta titulo="Ingresos del día" valor={formatoCOP.format(data.totalIngresos)} />
            <Tarjeta titulo="Pagos registrados" valor={data.totalPagos.toString()} />
            <Tarjeta titulo="Pedidos recibidos" valor={(data.pedidosPorEstado.RECIBIDO ?? 0).toString()} />
            <Tarjeta titulo="Lavados entregados" valor={data.lavadosEntregados.toString()} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {(Object.keys(METODO_LABEL) as MetodoPago[]).map((m) => (
              <div key={m} className="bg-white border border-stone-200 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-stone-500">
                  {METODO_LABEL[m]}
                </p>
                <p className="text-lg font-medium mt-1">
                  {formatoCOP.format(data.porMetodo[m]?.total ?? 0)}
                </p>
                <p className="text-[10px] text-stone-500">
                  {data.porMetodo[m]?.cantidad ?? 0} pagos
                </p>
              </div>
            ))}
          </div>

          {data.pagos.length === 0 ? (
            <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center text-sm text-stone-500">
              No hubo pagos en esta fecha.
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-600 text-xs">
                  <tr>
                    <th className="text-left px-4 py-2">Hora</th>
                    <th className="text-left px-4 py-2">Pedido</th>
                    <th className="text-left px-4 py-2">Cliente</th>
                    <th className="text-left px-4 py-2">Método</th>
                    <th className="text-right px-4 py-2">Monto</th>
                    <th className="text-left px-4 py-2">Empleado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pagos.map((p) => (
                    <tr key={p.id} className="border-t border-stone-100">
                      <td className="px-4 py-2 text-xs text-stone-600">
                        {formatoHora.format(new Date(p.fecha))}
                      </td>
                      <td className="px-4 py-2 text-xs font-medium">{p.pedidoCodigo}</td>
                      <td className="px-4 py-2 text-xs">{p.clienteNombre}</td>
                      <td className="px-4 py-2 text-xs">
                        {METODO_LABEL[p.metodo]}
                        {p.referencia && (
                          <span className="text-[10px] text-stone-500 block">
                            ref: {p.referencia}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs text-right font-medium">
                        {formatoCOP.format(p.monto)}
                      </td>
                      <td className="px-4 py-2 text-xs text-stone-600">
                        {p.empleadoNombre ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
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
