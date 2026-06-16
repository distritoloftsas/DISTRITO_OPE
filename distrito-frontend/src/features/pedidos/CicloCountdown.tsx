import { useEffect, useState } from "react";
import type { PedidoResponse } from "../../types/pedido";

interface Props {
  pedido: PedidoResponse;
  className?: string;
}

export function CicloCountdown({ pedido, className }: Props) {
  const info = restanteCiclo(pedido);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!info) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [info?.inicio]);

  if (!info) return null;

  const ahora = Date.now() + tick * 0; // tick fuerza el re-render
  void tick;
  const transcurridoMs = ahora - info.inicio.getTime();
  const restanteMs = info.duracionMs - transcurridoMs;
  const terminado = restanteMs <= 0;

  return (
    <p
      className={`text-[10px] font-medium ${
        terminado ? "text-amber-700" : "opacity-90"
      } ${className ?? ""}`}
    >
      {terminado
        ? "Ciclo cumplido — listo para avanzar"
        : `Faltan ${formatoMmSs(restanteMs)} (${info.etapa})`}
    </p>
  );
}

function restanteCiclo(p: PedidoResponse) {
  if (p.estado === "LAVANDO" && p.fechaInicioLavado) {
    return {
      etapa: "lavado",
      inicio: new Date(p.fechaInicioLavado),
      duracionMs: p.plan.duracionLavadoMinutos * 60_000,
    };
  }
  if (p.estado === "SECANDO" && p.fechaInicioSecado) {
    return {
      etapa: "secado",
      inicio: new Date(p.fechaInicioSecado),
      duracionMs: p.plan.duracionSecadoMinutos * 60_000,
    };
  }
  return null;
}

function formatoMmSs(ms: number): string {
  const totalSeg = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeg / 60);
  const s = totalSeg % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
