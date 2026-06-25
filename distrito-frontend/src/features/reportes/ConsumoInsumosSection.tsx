import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useConsumoInsumos } from "./useConsumoInsumos";
import { ETIQUETA_UNIDAD } from "../../types/insumo";
import { descargarXlsx } from "../../lib/descargarBlob";
import { colorPorIndex, COLORES } from "./colores";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoCOPCorto = new Intl.NumberFormat("es-CO", {
  notation: "compact",
  maximumFractionDigits: 1,
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

  const ranking = useMemo(() => {
    if (!data) return [];
    return [...data.lineas]
      .sort((a, b) => b.costoTotal - a.costoTotal)
      .map((l, i) => ({
        nombre: l.insumoNombre,
        costo: l.costoTotal,
        cantidad: l.cantidadTotal,
        unidad: ETIQUETA_UNIDAD[l.unidad],
        movimientos: l.movimientos,
        pedidos: l.pedidosAfectados,
        fill: colorPorIndex(i),
      }));
  }, [data]);

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
          <button
            type="button"
            onClick={() =>
              descargarXlsx(
                "/reportes/consumo-insumos.xlsx",
                { desde, hasta, sedeId },
                `gasto-insumos-${desde}_${hasta}.xlsx`
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
          <Kpis data={data} ranking={ranking} />

          {data.lineas.length === 0 ? (
            <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center text-sm text-stone-500">
              No hubo consumos de insumos en este rango.
            </div>
          ) : (
            <>
              <Grafica ranking={ranking} />
              <Tabla ranking={ranking} costoTotal={data.costoTotal} />
            </>
          )}
        </>
      )}
    </section>
  );
}

interface RankingItem {
  nombre: string;
  costo: number;
  cantidad: number;
  unidad: string;
  movimientos: number;
  pedidos: number;
  fill: string;
}

function Kpis({
  data,
  ranking,
}: {
  data: NonNullable<ReturnType<typeof useConsumoInsumos>["data"]>;
  ranking: RankingItem[];
}) {
  const peor = ranking[0];
  const costoPedido =
    data.pedidosAfectados > 0 ? data.costoTotal / data.pedidosAfectados : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <Tarjeta
        titulo="Costo total en insumos"
        valor={formatoCOP.format(data.costoTotal)}
        acento="dorado"
      />
      <Tarjeta titulo="Pedidos con consumo" valor={data.pedidosAfectados.toString()} />
      <Tarjeta titulo="Costo promedio por pedido" valor={formatoCOP.format(costoPedido)} />
      <Tarjeta
        titulo="Insumo más costoso"
        valor={peor ? peor.nombre : "—"}
        sub={peor ? formatoCOP.format(peor.costo) : undefined}
        acento="ambar"
      />
    </div>
  );
}

function Grafica({ ranking }: { ranking: RankingItem[] }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">
        Costo por insumo
      </p>
      <ResponsiveContainer
        width="100%"
        height={Math.max(140, ranking.length * 36)}
      >
        <BarChart
          data={ranking}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis
            type="number"
            tickFormatter={(v) => formatoCOPCorto.format(Number(v))}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="nombre"
            tick={{ fontSize: 11 }}
            width={110}
          />
          <Tooltip
            formatter={(v: number) => formatoCOP.format(v)}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Bar dataKey="costo" radius={[0, 6, 6, 0]}>
            {ranking.map((r, i) => (
              <Cell key={i} fill={r.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Tabla({
  ranking,
  costoTotal,
}: {
  ranking: RankingItem[];
  costoTotal: number;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <h3 className="text-sm font-medium">Detalle por insumo</h3>
        <span className="text-[11px] text-stone-500">{ranking.length} insumos</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-stone-600 text-xs">
          <tr>
            <th className="text-left px-4 py-2">Insumo</th>
            <th className="text-right px-4 py-2">Cantidad</th>
            <th className="text-right px-4 py-2">Costo total</th>
            <th className="text-right px-4 py-2">% del total</th>
            <th className="text-right px-4 py-2">Movs.</th>
            <th className="text-right px-4 py-2">Pedidos</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((l) => {
            const pct = costoTotal > 0 ? (l.costo / costoTotal) * 100 : 0;
            return (
              <tr key={l.nombre} className="border-t border-stone-100">
                <td className="px-4 py-2 font-medium">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: l.fill }}
                  />
                  {l.nombre}
                </td>
                <td className="px-4 py-2 text-xs text-right">
                  {formatoCantidad.format(l.cantidad)} {l.unidad}
                </td>
                <td className="px-4 py-2 text-xs text-right font-medium">
                  {formatoCOP.format(l.costo)}
                </td>
                <td className="px-4 py-2 text-xs text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-stone-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: COLORES.doradoOscuro }}
                      />
                    </div>
                    <span className="w-9 text-right">{pct.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-xs text-right text-stone-500">
                  {l.movimientos}
                </td>
                <td className="px-4 py-2 text-xs text-right text-stone-500">{l.pedidos}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-stone-50 text-xs">
          <tr>
            <td colSpan={2} className="px-4 py-2 text-right text-stone-600">
              Total general
            </td>
            <td className="px-4 py-2 text-right font-medium">
              {formatoCOP.format(costoTotal)}
            </td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Tarjeta({
  titulo,
  valor,
  sub,
  acento,
}: {
  titulo: string;
  valor: string;
  sub?: string;
  acento?: "dorado" | "ambar";
}) {
  const border =
    acento === "dorado"
      ? "border-distrito-gold-dark"
      : acento === "ambar"
      ? "border-amber-500"
      : "border-stone-200";
  return (
    <div className={`bg-white border-l-4 ${border} border-y border-r border-stone-200 rounded-xl p-4`}>
      <p className="text-[10px] uppercase tracking-wider text-stone-500">{titulo}</p>
      <p className="text-lg font-medium mt-1">{valor}</p>
      {sub && <p className="text-[10px] text-stone-500 mt-0.5">{sub}</p>}
    </div>
  );
}
