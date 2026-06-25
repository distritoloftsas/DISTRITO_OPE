import { useState } from "react";
import { useVentas } from "./useVentas";
import { etiquetaEstado } from "../../types/pedido";
import { descargarXlsx } from "../../lib/descargarBlob";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoFechaHora = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "short",
  timeStyle: "short",
});

function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function hace30DiasISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

interface Props {
  sedeId?: number;
}

export function VentasSection({ sedeId }: Props = {}) {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());

  const { data, isLoading, isError, error } = useVentas(desde, hasta, sedeId);

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-base font-medium">Ventas de lavadas</h2>
        <div className="flex items-center gap-2 text-xs">
          <label className="text-stone-600">Desde:</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            max={hoyISO()}
            className="px-2 py-1.5 border border-stone-300 rounded-md"
          />
          <label className="text-stone-600">Hasta:</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            max={hoyISO()}
            min={desde}
            className="px-2 py-1.5 border border-stone-300 rounded-md"
          />
          <button
            type="button"
            onClick={() =>
              descargarXlsx(
                "/reportes/ventas.xlsx",
                { desde, hasta, sedeId },
                `ventas-${desde}_${hasta}.xlsx`
              )
            }
            className="text-xs px-3 py-1.5 border border-distrito-gold-dark text-distrito-black rounded-md hover:bg-distrito-cream"
          >
            ↓ Excel
          </button>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <Tarjeta titulo="Total ventas" valor={formatoCOP.format(data.totalVentas)} />
            <Tarjeta titulo="# Lavadas" valor={data.totalLavadas.toString()} />
            <Tarjeta
              titulo="Ticket promedio"
              valor={formatoCOP.format(
                data.totalLavadas > 0 ? data.totalVentas / data.totalLavadas : 0
              )}
            />
          </div>

          {data.lineas.length === 0 ? (
            <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center text-sm text-stone-500">
              No hay ventas en este rango.
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-600 text-xs">
                  <tr>
                    <th className="text-left px-4 py-2">Fecha</th>
                    <th className="text-left px-4 py-2">Pedido</th>
                    <th className="text-left px-4 py-2">Cliente</th>
                    <th className="text-left px-4 py-2">Plan</th>
                    <th className="text-right px-4 py-2">Total</th>
                    <th className="text-center px-4 py-2">Pagado</th>
                    <th className="text-left px-4 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lineas.map((l) => (
                    <tr key={l.pedidoId} className="border-t border-stone-100">
                      <td className="px-4 py-2 text-xs text-stone-600">
                        {formatoFechaHora.format(new Date(l.fechaRecepcion))}
                      </td>
                      <td className="px-4 py-2 text-xs font-medium">{l.codigoQr}</td>
                      <td className="px-4 py-2 text-xs">{l.clienteNombre}</td>
                      <td className="px-4 py-2 text-xs">{l.planNombre}</td>
                      <td className="px-4 py-2 text-xs text-right font-medium">
                        {formatoCOP.format(l.total)}
                      </td>
                      <td className="px-4 py-2 text-xs text-center">
                        {l.pagado ? "Sí" : "No"}
                      </td>
                      <td className="px-4 py-2 text-xs">{etiquetaEstado(l.estado)}</td>
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
