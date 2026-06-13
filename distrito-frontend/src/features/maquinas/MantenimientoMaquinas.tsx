import { useMaquinas } from "./useMaquinas";
import { useCambiarEstadoMaquina } from "./useCambiarEstadoMaquina";
import type { EstadoMaquina, MaquinaResponse } from "../../types/maquina";

const COLOR: Record<EstadoMaquina, string> = {
  LIBRE: "bg-green-50 border-green-300 text-green-900",
  OCUPADA: "bg-blue-50 border-blue-300 text-blue-900",
  MANTENIMIENTO: "bg-stone-100 border-stone-300 text-stone-600",
};

const ETIQUETA: Record<EstadoMaquina, string> = {
  LIBRE: "Libre",
  OCUPADA: "Ocupada",
  MANTENIMIENTO: "En mantenimiento",
};

export function MantenimientoMaquinas() {
  const { data, isLoading } = useMaquinas();
  const cambiar = useCambiarEstadoMaquina();

  if (isLoading) return <p className="text-sm text-stone-500">Cargando máquinas...</p>;

  const maquinas = data ?? [];
  const lavadoras = maquinas.filter((m) => m.tipo === "LAVADORA");
  const secadoras = maquinas.filter((m) => m.tipo === "SECADORA");

  const toggleMantenimiento = (m: MaquinaResponse) => {
    if (m.estado === "OCUPADA") return;
    const nuevo: EstadoMaquina = m.estado === "MANTENIMIENTO" ? "LIBRE" : "MANTENIMIENTO";
    cambiar.mutate({ id: m.id, estado: nuevo });
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="grid grid-cols-2 gap-6">
        <Grupo titulo="Lavadoras" maquinas={lavadoras} onToggle={toggleMantenimiento} loading={cambiar.isPending} />
        <Grupo titulo="Secadoras" maquinas={secadoras} onToggle={toggleMantenimiento} loading={cambiar.isPending} />
      </div>
      <p className="text-[10px] text-stone-500 mt-3">
        Solo se puede mandar a mantenimiento una máquina libre. Para liberar una ocupada,
        avanza el pedido que la está usando.
      </p>
    </div>
  );
}

function Grupo({
  titulo,
  maquinas,
  onToggle,
  loading,
}: {
  titulo: string;
  maquinas: MaquinaResponse[];
  onToggle: (m: MaquinaResponse) => void;
  loading: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">{titulo}</p>
      <div className="space-y-2">
        {maquinas.map((m) => {
          const ocupada = m.estado === "OCUPADA";
          const enMant = m.estado === "MANTENIMIENTO";
          return (
            <div key={m.id} className={`border rounded-lg p-3 flex items-center justify-between ${COLOR[m.estado]}`}>
              <div>
                <p className="text-sm font-medium">
                  {titulo === "Lavadoras" ? "Lav" : "Sec"} {m.numero}
                </p>
                <p className="text-[10px]">
                  {ETIQUETA[m.estado]}
                  {m.pedido && ` · ${m.pedido.codigoQr}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggle(m)}
                disabled={ocupada || loading}
                className="text-[11px] px-2.5 py-1 rounded border bg-white border-current disabled:opacity-40 disabled:cursor-not-allowed"
                title={ocupada ? "No se puede tocar una máquina ocupada" : undefined}
              >
                {enMant ? "Marcar libre" : "Mandar a mantenimiento"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
