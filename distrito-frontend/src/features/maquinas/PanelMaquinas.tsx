import { useMaquinas } from "./useMaquinas";
import type { EstadoMaquina, MaquinaResponse } from "../../types/maquina";

const COLOR: Record<EstadoMaquina, string> = {
  LIBRE: "bg-green-50 border-green-300 text-green-900",
  OCUPADA: "bg-blue-50 border-blue-300 text-blue-900",
  MANTENIMIENTO: "bg-stone-100 border-stone-300 text-stone-500",
};

export function PanelMaquinas() {
  const { data, isLoading } = useMaquinas();

  if (isLoading) return null;

  const lavadoras = (data ?? []).filter((m) => m.tipo === "LAVADORA");
  const secadoras = (data ?? []).filter((m) => m.tipo === "SECADORA");

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 mb-4">
      <div className="grid grid-cols-2 gap-4">
        <Grupo titulo="Lavadoras" maquinas={lavadoras} />
        <Grupo titulo="Secadoras" maquinas={secadoras} />
      </div>
    </div>
  );
}

function Grupo({ titulo, maquinas }: { titulo: string; maquinas: MaquinaResponse[] }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">{titulo}</p>
      <div className="grid grid-cols-3 gap-2">
        {maquinas.map((m) => (
          <div
            key={m.id}
            className={`border rounded-lg px-2 py-1.5 text-center ${COLOR[m.estado]}`}
            title={m.pedido ? `${m.pedido.codigoQr} · ${m.pedido.cliente}` : m.estado}
          >
            <p className="text-[10px]">{titulo === "Lavadoras" ? "Lav" : "Sec"} {m.numero}</p>
            <p className="text-[10px] font-medium truncate">
              {m.estado === "LIBRE"
                ? "Libre"
                : m.estado === "OCUPADA"
                ? m.pedido?.codigoQr ?? "Ocupada"
                : "Mant."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
