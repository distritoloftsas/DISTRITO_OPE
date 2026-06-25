import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCierreCaja } from "./useCierreCaja";
import type { MetodoPago } from "../../types/pedido";
import { COLORES } from "./colores";
import { BotonDescargarExcel } from "./BotonDescargarExcel";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoCOPCorto = new Intl.NumberFormat("es-CO", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatoHora = new Intl.DateTimeFormat("es-CO", { timeStyle: "short" });

const METODO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  DATAFONO: "Datáfono",
};

const COLOR_METODO: Record<MetodoPago, string> = {
  EFECTIVO: COLORES.verde,
  TRANSFERENCIA: COLORES.azul,
  DATAFONO: COLORES.dorado,
};

function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

interface Props {
  sedeId?: number;
  titulo?: string;
}

export function CierreCajaSection({ sedeId, titulo = "Cierre de caja" }: Props = {}) {
  const [fecha, setFecha] = useState<string>(hoyISO());
  const { data, isLoading, isError, error } = useCierreCaja(fecha, sedeId);

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-base font-medium">{titulo}</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-600">Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            max={hoyISO()}
            className="text-xs px-2 py-1.5 border border-stone-300 rounded-md"
          />
          <BotonDescargarExcel
            url="/reportes/cierre-caja.xlsx"
            params={{ fecha, sedeId }}
            filename={`cierre-caja-${fecha}.xlsx`}
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
          <KpiCards data={data} />
          <AlertaCuadre data={data} />
          <GraficasMetodos data={data} />
          <DetallePagos data={data} />
        </>
      )}
    </section>
  );
}

type CierreData = NonNullable<ReturnType<typeof useCierreCaja>["data"]>;

function KpiCards({ data }: { data: CierreData }) {
  const ticketPromedio = data.totalPagos > 0 ? data.totalIngresos / data.totalPagos : 0;
  const recibidos = data.pedidosPorEstado.RECIBIDO ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <Tarjeta
        titulo="Ingresos del día"
        valor={formatoCOP.format(data.totalIngresos)}
        acento="dorado"
      />
      <Tarjeta titulo="Ticket promedio" valor={formatoCOP.format(ticketPromedio)} />
      <Tarjeta
        titulo="Lavados entregados"
        valor={data.lavadosEntregados.toString()}
        acento="verde"
      />
      <Tarjeta
        titulo="Pedidos recibidos hoy"
        valor={recibidos.toString()}
        sub={`${data.totalPagos} pago(s) cobrados`}
      />
    </div>
  );
}

function AlertaCuadre({ data }: { data: CierreData }) {
  // Idea: ningún pago debería tener monto = 0 ni venir sin método.
  const pagosSospechosos = data.pagos.filter((p) => !p.monto || p.monto <= 0);
  const sinEmpleado = data.pagos.filter((p) => !p.empleadoNombre).length;
  const ingresosPorMetodo = Object.values(data.porMetodo).reduce(
    (s, m) => s + (m?.total ?? 0),
    0
  );
  const diferencia = Math.abs(ingresosPorMetodo - data.totalIngresos);

  const items: { tipo: "ok" | "alerta"; texto: string }[] = [];

  if (data.totalPagos === 0) {
    items.push({ tipo: "alerta", texto: "No hay pagos registrados en esta fecha." });
  } else {
    items.push({
      tipo: "ok",
      texto: `${data.totalPagos} pago(s) por ${formatoCOP.format(data.totalIngresos)}`,
    });
  }

  if (diferencia > 1) {
    items.push({
      tipo: "alerta",
      texto: `La suma por método (${formatoCOP.format(
        ingresosPorMetodo
      )}) no coincide con el total. Diferencia: ${formatoCOP.format(diferencia)}.`,
    });
  } else if (data.totalPagos > 0) {
    items.push({ tipo: "ok", texto: "Suma por método cuadra con el total." });
  }

  if (pagosSospechosos.length > 0) {
    items.push({
      tipo: "alerta",
      texto: `${pagosSospechosos.length} pago(s) con monto en 0. Revisa el detalle.`,
    });
  }

  if (sinEmpleado > 0) {
    items.push({
      tipo: "alerta",
      texto: `${sinEmpleado} pago(s) sin empleado responsable.`,
    });
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-3">
        Verificación de cuadre
      </p>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <span
              className={`mt-1 inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                it.tipo === "ok" ? "bg-green-500" : "bg-amber-500"
              }`}
            />
            <span className={it.tipo === "ok" ? "text-stone-700" : "text-amber-800"}>
              {it.texto}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GraficasMetodos({ data }: { data: CierreData }) {
  const datosBarras = (Object.keys(METODO_LABEL) as MetodoPago[]).map((m) => ({
    metodo: METODO_LABEL[m],
    total: data.porMetodo[m]?.total ?? 0,
    cantidad: data.porMetodo[m]?.cantidad ?? 0,
    fill: COLOR_METODO[m],
  }));

  const totalGeneral = datosBarras.reduce((s, x) => s + x.total, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">
          Ingresos por método
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={datosBarras} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="metodo" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(v) => formatoCOPCorto.format(Number(v))}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(v: number) => formatoCOP.format(v)}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {datosBarras.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">
          Participación
        </p>
        {totalGeneral === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-sm text-stone-400">
            Sin pagos en esta fecha
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={datosBarras}
                dataKey="total"
                nameKey="metodo"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
              >
                {datosBarras.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatoCOP.format(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function DetallePagos({ data }: { data: CierreData }) {
  if (data.pagos.length === 0) {
    return (
      <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center text-sm text-stone-500">
        No hubo pagos en esta fecha.
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <h3 className="text-sm font-medium">Detalle de pagos</h3>
        <span className="text-[11px] text-stone-500">{data.pagos.length} registros</span>
      </div>
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
          {data.pagos.map((p) => {
            const sospechoso = !p.monto || p.monto <= 0 || !p.empleadoNombre;
            return (
              <tr
                key={p.id}
                className={`border-t border-stone-100 ${
                  sospechoso ? "bg-amber-50/40" : ""
                }`}
              >
                <td className="px-4 py-2 text-xs text-stone-600">
                  {formatoHora.format(new Date(p.fecha))}
                </td>
                <td className="px-4 py-2 text-xs font-medium">{p.pedidoCodigo}</td>
                <td className="px-4 py-2 text-xs">{p.clienteNombre}</td>
                <td className="px-4 py-2 text-xs">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: COLOR_METODO[p.metodo] }}
                  />
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
                  {p.empleadoNombre ?? <span className="text-amber-700">sin empleado</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
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
  acento?: "dorado" | "verde";
}) {
  const borderClass =
    acento === "dorado"
      ? "border-distrito-gold-dark"
      : acento === "verde"
      ? "border-green-500"
      : "border-stone-200";
  return (
    <div className={`bg-white border-l-4 ${borderClass} border-y border-r border-stone-200 rounded-xl p-4`}>
      <p className="text-[10px] uppercase tracking-wider text-stone-500">{titulo}</p>
      <p className="text-lg font-medium mt-1">{valor}</p>
      {sub && <p className="text-[10px] text-stone-500 mt-0.5">{sub}</p>}
    </div>
  );
}

