import { useState } from "react";
import { useReporteClientes, type LineaClienteServicio } from "./useReporteClientes";
import { BotonDescargarExcel } from "./BotonDescargarExcel";

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

export function ClientesReporteSection({ sedeId }: Props = {}) {
  const [desde, setDesde] = useState(primerDiaDelMesISO());
  const [hasta, setHasta] = useState(hoyISO());
  const { data, isLoading, isError, error } = useReporteClientes(desde, hasta, sedeId);

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-medium">Clientes del período</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Nuevos (registrados en el rango) y recurrentes (registrados antes).
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
            url="/reportes/clientes.xlsx"
            params={{ desde, hasta, sedeId }}
            filename={`clientes-${desde}_${hasta}.xlsx`}
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
        <div className="space-y-6">
          <TablaClientes
            titulo="Clientes nuevos"
            descripcion="Se registraron dentro del rango y pidieron servicio."
            lineas={data.nuevos}
            resaltar
          />
          <TablaClientes
            titulo="Clientes recurrentes"
            descripcion="Ya existían antes del rango y pidieron nuevamente."
            lineas={data.recurrentes}
          />
        </div>
      )}
    </section>
  );
}

function TablaClientes({
  titulo,
  descripcion,
  lineas,
  resaltar,
}: {
  titulo: string;
  descripcion: string;
  lineas: LineaClienteServicio[];
  resaltar?: boolean;
}) {
  const clientesUnicos = new Set(lineas.map((l) => l.clienteNombre + "·" + (l.clienteTelefono ?? ""))).size;

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">{titulo}</h3>
          <p className="text-[11px] text-stone-500 mt-0.5">{descripcion}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-stone-500">
            {clientesUnicos} cliente(s) · {lineas.length} servicio(s)
          </p>
        </div>
      </div>
      {lineas.length === 0 ? (
        <p className="p-6 text-sm text-stone-500 text-center">Sin registros en este rango.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs">
              <tr>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-left px-3 py-2">Teléfono</th>
                <th className="text-left px-3 py-2">Fecha servicio</th>
                <th className="text-left px-3 py-2">Código</th>
                <th className="text-left px-3 py-2">Servicio</th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((l) => (
                <tr
                  key={l.pedidoId}
                  className={`border-t border-stone-100 ${resaltar ? "bg-emerald-50/40" : ""}`}
                >
                  <td className="px-3 py-2 text-xs font-medium">{l.clienteNombre}</td>
                  <td className="px-3 py-2 text-xs">{l.clienteTelefono ?? "—"}</td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">
                    {formatoFechaHora.format(new Date(l.fechaServicio))}
                  </td>
                  <td className="px-3 py-2 text-xs">{l.codigoQr}</td>
                  <td className="px-3 py-2 text-xs">{l.planNombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
