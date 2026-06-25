import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useVentas, type LineaVenta, type VentasResponse } from "./useVentas";
import { etiquetaEstado } from "../../types/pedido";
import { BotonDescargarExcel } from "./BotonDescargarExcel";
import { COLORES, colorPorIndex } from "./colores";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoCOPCorto = new Intl.NumberFormat("es-CO", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatoFechaHora = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "short",
  timeStyle: "short",
});

const formatoDiaCorto = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
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
          <BotonDescargarExcel
            url="/reportes/ventas.xlsx"
            params={{ desde, hasta, sedeId }}
            filename={`ventas-${desde}_${hasta}.xlsx`}
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
          <KpiVentas data={data} />
          <AlertaVentas data={data} />
          <Graficas data={data} />
          <Detalle data={data} />
        </>
      )}
    </section>
  );
}

function KpiVentas({ data }: { data: VentasResponse }) {
  const ticket =
    data.totalLavadas > 0 ? data.totalVentas / data.totalLavadas : 0;
  const sinPago = data.lineas.filter((l) => !l.pagado).length;
  const sinPagoTotal = data.lineas
    .filter((l) => !l.pagado)
    .reduce((s, l) => s + l.total, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <Tarjeta
        titulo="Total ventas"
        valor={formatoCOP.format(data.totalVentas)}
        acento="dorado"
      />
      <Tarjeta titulo="# Lavadas" valor={data.totalLavadas.toString()} />
      <Tarjeta titulo="Ticket promedio" valor={formatoCOP.format(ticket)} />
      <Tarjeta
        titulo="Pendientes de pago"
        valor={sinPago.toString()}
        sub={sinPago > 0 ? formatoCOP.format(sinPagoTotal) : "todo cobrado"}
        acento={sinPago > 0 ? "ambar" : "verde"}
      />
    </div>
  );
}

function AlertaVentas({ data }: { data: VentasResponse }) {
  const sinPago = data.lineas.filter((l) => !l.pagado);
  if (sinPago.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg px-4 py-2 mb-4">
        Todos los pedidos del rango fueron cobrados.
      </div>
    );
  }
  const total = sinPago.reduce((s, l) => s + l.total, 0);
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-4 py-2 mb-4">
      Hay <strong>{sinPago.length}</strong> pedido(s) sin pago en el rango por{" "}
      <strong>{formatoCOP.format(total)}</strong>. Revísalos en el detalle abajo.
    </div>
  );
}

function Graficas({ data }: { data: VentasResponse }) {
  const porDia = useMemo(() => agruparPorDia(data.lineas), [data.lineas]);
  const porPlan = useMemo(() => agruparPorPlan(data.lineas), [data.lineas]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
      <div className="bg-white border border-stone-200 rounded-xl p-4 lg:col-span-2">
        <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">
          Ventas por día
        </p>
        {porDia.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-sm text-stone-400">
            Sin ventas en el rango
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={porDia} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => formatoCOPCorto.format(Number(v))}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(v: number) => formatoCOP.format(v)}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="total" fill={COLORES.dorado} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">
          Mix por plan
        </p>
        {porPlan.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-sm text-stone-400">
            —
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={porPlan}
                dataKey="total"
                nameKey="plan"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={75}
                paddingAngle={2}
              >
                {porPlan.map((_, i) => (
                  <Cell key={i} fill={colorPorIndex(i)} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatoCOP.format(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-4 lg:col-span-3">
        <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">
          Tendencia (acumulado)
        </p>
        {porDia.length === 0 ? (
          <div className="h-[160px] flex items-center justify-center text-sm text-stone-400">
            —
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={acumulado(porDia)}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => formatoCOPCorto.format(Number(v))}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v: number) => formatoCOP.format(v)} />
              <Line
                type="monotone"
                dataKey="acumulado"
                stroke={COLORES.doradoOscuro}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function Detalle({ data }: { data: VentasResponse }) {
  if (data.lineas.length === 0) {
    return (
      <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center text-sm text-stone-500">
        No hay ventas en este rango.
      </div>
    );
  }
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <h3 className="text-sm font-medium">Detalle por pedido</h3>
        <span className="text-[11px] text-stone-500">{data.lineas.length} registros</span>
      </div>
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
            <tr
              key={l.pedidoId}
              className={`border-t border-stone-100 ${!l.pagado ? "bg-amber-50/40" : ""}`}
            >
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
                {l.pagado ? (
                  <span className="text-green-700">Sí</span>
                ) : (
                  <span className="text-amber-700 font-medium">No</span>
                )}
              </td>
              <td className="px-4 py-2 text-xs">{etiquetaEstado(l.estado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// helpers ------------------------------------------------------------

function agruparPorDia(lineas: LineaVenta[]): { dia: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number; fecha: Date }>();
  for (const l of lineas) {
    const f = new Date(l.fechaRecepcion);
    const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(
      f.getDate()
    ).padStart(2, "0")}`;
    const prev = map.get(key);
    if (prev) {
      prev.total += l.total;
      prev.count++;
    } else {
      map.set(key, { total: l.total, count: 1, fecha: new Date(f.getFullYear(), f.getMonth(), f.getDate()) });
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => ({ dia: formatoDiaCorto.format(v.fecha), total: v.total, count: v.count }));
}

function agruparPorPlan(lineas: LineaVenta[]): { plan: string; total: number }[] {
  const map = new Map<string, number>();
  for (const l of lineas) {
    map.set(l.planNombre, (map.get(l.planNombre) ?? 0) + l.total);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([plan, total]) => ({ plan, total }));
}

function acumulado(
  porDia: { dia: string; total: number }[]
): { dia: string; acumulado: number }[] {
  let acc = 0;
  return porDia.map((d) => {
    acc += d.total;
    return { dia: d.dia, acumulado: acc };
  });
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
  acento?: "dorado" | "verde" | "ambar";
}) {
  const border =
    acento === "dorado"
      ? "border-distrito-gold-dark"
      : acento === "verde"
      ? "border-green-500"
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
