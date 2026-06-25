import { useEffect, useMemo, useState } from "react";
import type { PedidoResponse } from "../../types/pedido";

interface Props {
  pedido: PedidoResponse;
  className?: string;
}

export function CicloCountdown({ pedido, className }: Props) {
  const info = useMemo(() => restanteCiclo(pedido), [
    pedido.estado,
    pedido.fechaInicioLavado,
    pedido.fechaInicioSecado,
    pedido.plan.duracionLavadoMinutos,
    pedido.plan.duracionSecadoMinutos,
    pedido.sede.toleranciaPreLavadoMinutos,
    pedido.sede.toleranciaPostLavadoMinutos,
  ]);

  const [ahora, setAhora] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!info) return;
    const transcurrido = Date.now() - info.inicioMs;
    if (transcurrido >= info.duracionMs) {
      // Ya termino: un render final con el mensaje "Ciclo cumplido". Sin timer.
      setAhora(Date.now());
      return;
    }
    const id = setInterval(() => {
      const t = Date.now();
      setAhora(t);
      // Auto-detener cuando el ciclo se cumple para no tickear infinitamente.
      if (t - info.inicioMs >= info.duracionMs) {
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [info]);

  if (!info) return null;

  const restanteMs = info.duracionMs - (ahora - info.inicioMs);
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

interface CicloInfo {
  etapa: "lavado" | "secado";
  inicioMs: number;
  duracionMs: number;
}

function restanteCiclo(p: PedidoResponse): CicloInfo | null {
  const tolPre = (p.sede.toleranciaPreLavadoMinutos ?? 0) * 60_000;
  const tolPost = (p.sede.toleranciaPostLavadoMinutos ?? 0) * 60_000;
  if (p.estado === "LAVANDO" && p.fechaInicioLavado) {
    return {
      etapa: "lavado",
      inicioMs: new Date(p.fechaInicioLavado).getTime(),
      duracionMs: p.plan.duracionLavadoMinutos * 60_000 + tolPre,
    };
  }
  if (p.estado === "SECANDO" && p.fechaInicioSecado) {
    return {
      etapa: "secado",
      inicioMs: new Date(p.fechaInicioSecado).getTime(),
      duracionMs: p.plan.duracionSecadoMinutos * 60_000 + tolPost,
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
