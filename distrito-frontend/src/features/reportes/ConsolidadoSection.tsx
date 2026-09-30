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
import { useConsolidado, type ConsolidadoResponse } from "./useConsolidado";
import { BotonDescargarExcel } from "./BotonDescargarExcel";
import { bgPlan, badgeDescuento, badgeMetodo, etiquetaMetodo, COLORES } from "./colores";
import { etiquetaEstado } from "../../types/pedido";

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

function primerDiaDelMesISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

interface Props {
  sedeId?: number;
}

export function ConsolidadoSection({ sedeId }: Props = {}) {
  const [desde, setDesde] = useState(primerDiaDelMesISO());
  const [hasta, setHasta] = useState(hoyISO());

  const { data, isLoading, isError, error } = useConsolidado(desde, hasta, sedeId);

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-medium">Consolidado del período</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Ventas, descuentos, pagos y reembolsos en un solo reporte.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
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
            url="/reportes/consolidado.xlsx"
            params={{ desde, hasta, sedeId }}
            filename={`consolidado-${desde}_${hasta}.xlsx`}
          />
        </div>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Cargando reporte...</p>}
      {isError && (
        <p className="text-sm text-red-600">
          {(error as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ??
            "No se pudo cargar el consolidado."}
        </p>
      )}

      {data && (
        <div className="space-y-6">
          <KpiConsolidado data={data} />
          <PatronSemanal data={data} />
          <TablaPedidos data={data} />
          <BloqueDescuentos data={data} />
          <BloquePagos data={data} />
          <BloqueReembolsos data={data} />
        </div>
      )}
    </section>
  );
}

// Dias en orden lunes → domingo (America/Bogota, sin timezone extra).
const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

function PatronSemanal({ data }: { data: ConsolidadoResponse }) {
  const stats = useMemo(() => {
    const buckets = DIAS_SEMANA.map((dia) => ({
      dia,
      cantidad: 0,
      total: 0,
    }));
    for (const p of data.pedidos) {
      if (p.estado === "CANCELADO") continue;
      const d = new Date(p.fechaRecepcion);
      // getDay(): 0=domingo, 1=lunes, ..., 6=sabado. Convertir a 0=lunes.
      const idx = (d.getDay() + 6) % 7;
      buckets[idx].cantidad += 1;
      buckets[idx].total += p.total;
    }
    return buckets;
  }, [data.pedidos]);

  const total = stats.reduce((s, b) => s + b.cantidad, 0);
  const maxCantidad = Math.max(...stats.map((b) => b.cantidad));
  const mejorDia = stats.reduce((m, b) => (b.cantidad > m.cantidad ? b : m), stats[0]);

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Servicios por día de la semana</h3>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Solo pedidos no cancelados del rango. Ayuda a identificar picos de demanda.
          </p>
        </div>
        {total > 0 && (
          <div className="text-right text-[11px] text-stone-500">
            Día más fuerte: <strong className="text-distrito-black">{mejorDia.dia}</strong> ({mejorDia.cantidad})
          </div>
        )}
      </div>
      <div className="p-4">
        {total === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-stone-400">
            Sin servicios en el rango
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                formatter={(v: any) => [`${v} servicio(s)`, "Cantidad"]}
              />
              <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                {stats.map((b, i) => (
                  <Cell
                    key={i}
                    fill={b.cantidad === maxCantidad ? COLORES.doradoOscuro : COLORES.dorado}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function KpiConsolidado({ data }: { data: ConsolidadoResponse }) {
  const t = data.totales;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Tarjeta titulo="Total facturado" valor={formatoCOP.format(t.totalFacturado)} acento="dorado" />
      <Tarjeta titulo="Ticket promedio" valor={formatoCOP.format(t.ticketPromedio)} />
      <Tarjeta
        titulo="Descuentos aplicados"
        valor={formatoCOP.format(t.totalDescuentos)}
        sub={`sobre subtotal ${formatoCOP.format(t.subtotalBruto)}`}
        acento={t.totalDescuentos > 0 ? "verde" : undefined}
      />
      <Tarjeta
        titulo="Reembolsos"
        valor={formatoCOP.format(t.totalReembolsos)}
        sub={`${t.cantidadPedidosCancelados} cancelados`}
        acento={t.totalReembolsos > 0 ? "rojo" : undefined}
      />
    </div>
  );
}

function TablaPedidos({ data }: { data: ConsolidadoResponse }) {
  if (data.pedidos.length === 0) {
    return (
      <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center text-sm text-stone-500">
        No hay pedidos en este rango.
      </div>
    );
  }
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <h3 className="text-sm font-medium">Detalle por pedido</h3>
        <span className="text-[11px] text-stone-500">{data.pedidos.length} registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600 text-xs">
            <tr>
              <th className="text-left px-3 py-2">Fecha</th>
              <th className="text-left px-3 py-2">Pedido</th>
              <th className="text-left px-3 py-2">Cliente</th>
              <th className="text-left px-3 py-2">Plan</th>
              <th className="text-right px-3 py-2">Subtotal</th>
              <th className="text-left px-3 py-2">Descuento</th>
              <th className="text-right px-3 py-2">−$ Desc</th>
              <th className="text-right px-3 py-2">Domicilio</th>
              <th className="text-right px-3 py-2">Total</th>
              <th className="text-center px-3 py-2">Pago</th>
              <th className="text-left px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.pedidos.map((l) => {
              const cancelado = l.estado === "CANCELADO";
              const fondo = cancelado ? "bg-red-50" : bgPlan(l.planNombre);
              return (
                <tr key={l.id} className={`border-t border-stone-100 ${fondo}`}>
                  <td className="px-3 py-2 text-xs text-stone-600 whitespace-nowrap">
                    {formatoFechaHora.format(new Date(l.fechaRecepcion))}
                  </td>
                  <td className="px-3 py-2 text-xs font-medium">{l.codigoQr}</td>
                  <td className="px-3 py-2 text-xs">{l.cliente}</td>
                  <td className="px-3 py-2 text-xs">{l.planNombre}</td>
                  <td className="px-3 py-2 text-xs text-right">{formatoCOP.format(l.subtotal)}</td>
                  <td className="px-3 py-2 text-xs">
                    {l.descuentoCodigo ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeDescuento(l.descuentoCodigo)}`}>
                        {l.descuentoEtiqueta}
                      </span>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-right text-emerald-700">
                    {l.montoDescuento > 0 ? `−${formatoCOP.format(l.montoDescuento)}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-right">
                    {l.costoDomicilio > 0 ? formatoCOP.format(l.costoDomicilio) : "—"}
                  </td>
                  <td className={`px-3 py-2 text-xs text-right font-medium ${cancelado ? "line-through text-stone-400" : ""}`}>
                    {formatoCOP.format(l.total)}
                  </td>
                  <td className="px-3 py-2 text-xs text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeMetodo(l.metodoPago)}`}>
                      {etiquetaMetodo(l.metodoPago)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{etiquetaEstado(l.estado as never)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BloqueDescuentos({ data }: { data: ConsolidadoResponse }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <h3 className="text-sm font-medium">Descuentos por tipo</h3>
        <span className="text-[11px] text-stone-500">
          Total: {formatoCOP.format(data.totales.totalDescuentos)}
        </span>
      </div>
      {data.descuentosPorTipo.length === 0 ? (
        <p className="p-6 text-sm text-stone-500 text-center">
          Sin descuentos aplicados en el período.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600 text-xs">
            <tr>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-right px-4 py-2">Cantidad</th>
              <th className="text-right px-4 py-2">Total descontado</th>
            </tr>
          </thead>
          <tbody>
            {data.descuentosPorTipo.map((d) => (
              <tr key={d.codigo} className="border-t border-stone-100">
                <td className="px-4 py-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeDescuento(d.codigo)}`}>
                    {d.etiqueta}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-right">{d.cantidadPedidos}</td>
                <td className="px-4 py-2 text-xs text-right font-medium">
                  {formatoCOP.format(d.montoDescontado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function BloquePagos({ data }: { data: ConsolidadoResponse }) {
  const total = data.pagosPorMetodo.reduce((s, p) => s + p.monto, 0);
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <h3 className="text-sm font-medium">Pagos por método</h3>
        <span className="text-[11px] text-stone-500">
          Total: {formatoCOP.format(total)}
        </span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-stone-600 text-xs">
          <tr>
            <th className="text-left px-4 py-2">Método</th>
            <th className="text-right px-4 py-2">Cantidad de pagos</th>
            <th className="text-right px-4 py-2">Monto</th>
          </tr>
        </thead>
        <tbody>
          {data.pagosPorMetodo.map((p) => (
            <tr key={p.metodo} className="border-t border-stone-100">
              <td className="px-4 py-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeMetodo(p.metodo)}`}>
                  {etiquetaMetodo(p.metodo)}
                </span>
              </td>
              <td className="px-4 py-2 text-xs text-right">{p.cantidadPagos}</td>
              <td className="px-4 py-2 text-xs text-right font-medium">
                {formatoCOP.format(p.monto)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BloqueReembolsos({ data }: { data: ConsolidadoResponse }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <h3 className="text-sm font-medium">Reembolsos (pedidos cancelados que estaban pagados)</h3>
        <span className="text-[11px] text-stone-500">
          Total: {formatoCOP.format(data.totales.totalReembolsos)}
        </span>
      </div>
      {data.reembolsos.length === 0 ? (
        <p className="p-6 text-sm text-stone-500 text-center">
          Sin reembolsos en el período.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600 text-xs">
            <tr>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-left px-4 py-2">Pedido</th>
              <th className="text-left px-4 py-2">Cliente</th>
              <th className="text-left px-4 py-2">Plan</th>
              <th className="text-right px-4 py-2">Monto</th>
            </tr>
          </thead>
          <tbody>
            {data.reembolsos.map((r) => (
              <tr key={r.pedidoId} className="border-t border-stone-100 bg-red-50">
                <td className="px-4 py-2 text-xs text-stone-600">
                  {formatoFechaHora.format(new Date(r.fechaCancelacion))}
                </td>
                <td className="px-4 py-2 text-xs font-medium">{r.codigoQr}</td>
                <td className="px-4 py-2 text-xs">{r.cliente}</td>
                <td className="px-4 py-2 text-xs">{r.planNombre}</td>
                <td className="px-4 py-2 text-xs text-right font-medium text-red-700">
                  {formatoCOP.format(r.montoReembolsado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
  acento?: "dorado" | "verde" | "rojo";
}) {
  const border =
    acento === "dorado"
      ? "border-distrito-gold-dark"
      : acento === "verde"
      ? "border-green-500"
      : acento === "rojo"
      ? "border-red-500"
      : "border-stone-200";
  return (
    <div className={`bg-white border-l-4 ${border} border-y border-r border-stone-200 rounded-xl p-4`}>
      <p className="text-[10px] uppercase tracking-wider text-stone-500">{titulo}</p>
      <p className="text-lg font-medium mt-1">{valor}</p>
      {sub && <p className="text-[10px] text-stone-500 mt-0.5">{sub}</p>}
    </div>
  );
}
