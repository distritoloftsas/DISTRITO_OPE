import { useState } from "react";
import { useConsumoInsumos } from "./useConsumoInsumos";
import { ETIQUETA_UNIDAD } from "../../types/insumo";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoCantidad = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 3 });

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

export function ConsumoInsumosSection({ sedeId }: Props = {}) {
  const [desde, setDesde] = useState(hace30DiasISO());
  const [hasta, setHasta] = useState(hoyISO());

  const { data, isLoading, isError, error } = useConsumoInsumos(desde, hasta, sedeId);

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-base font-medium">Gasto en insumos</h2>
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
            <Tarjeta titulo="Costo total en insumos" valor={formatoCOP.format(data.costoTotal)} />
            <Tarjeta titulo="Pedidos con consumo" valor={data.pedidosAfectados.toString()} />
            <Tarjeta
              titulo="Costo promedio por pedido"
              valor={formatoCOP.format(
                data.pedidosAfectados > 0 ? data.costoTotal / data.pedidosAfectados : 0
              )}
            />
          </div>

          {data.lineas.length === 0 ? (
            <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center text-sm text-stone-500">
              No hubo consumos de insumos en este rango.
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-600 text-xs">
                  <tr>
                    <th className="text-left px-4 py-2">Insumo</th>
                    <th className="text-right px-4 py-2">Cantidad</th>
                    <th className="text-right px-4 py-2">Costo total</th>
                    <th className="text-right px-4 py-2">Movimientos</th>
                    <th className="text-right px-4 py-2">Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lineas.map((l) => (
                    <tr key={l.insumoId} className="border-t border-stone-100">
                      <td className="px-4 py-2 font-medium">{l.insumoNombre}</td>
                      <td className="px-4 py-2 text-xs text-right">
                        {formatoCantidad.format(l.cantidadTotal)} {ETIQUETA_UNIDAD[l.unidad]}
                      </td>
                      <td className="px-4 py-2 text-xs text-right font-medium">
                        {formatoCOP.format(l.costoTotal)}
                      </td>
                      <td className="px-4 py-2 text-xs text-right text-stone-500">
                        {l.movimientos}
                      </td>
                      <td className="px-4 py-2 text-xs text-right text-stone-500">
                        {l.pedidosAfectados}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-stone-50 text-xs">
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-right text-stone-600">
                      Total general
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatoCOP.format(data.costoTotal)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
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
