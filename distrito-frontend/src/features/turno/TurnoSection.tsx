import { useState } from "react";
import {
  useAbrirTurno,
  useCerrarTurno,
  useRegistrarGasto,
  useTurnoActual,
  type TurnoResponse,
} from "./useTurno";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoHora = new Intl.DateTimeFormat("es-CO", { timeStyle: "short" });

export function TurnoSection() {
  const { data: turno, isLoading } = useTurnoActual();

  if (isLoading) {
    return <p className="text-xs text-stone-500 mb-3">Cargando turno...</p>;
  }

  if (!turno) {
    return <AbrirTurnoCard />;
  }

  return <TurnoAbiertoCard turno={turno} />;
}

function AbrirTurnoCard() {
  const [base, setBase] = useState("0");
  const abrir = useAbrirTurno();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await abrir.mutateAsync(Number(base) || 0);
  };

  const errorMsg = (abrir.error as { response?: { data?: { mensaje?: string } } })
    ?.response?.data?.mensaje;

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-stone-200 rounded-xl p-4 mb-4 flex items-end gap-3 flex-wrap"
    >
      <div className="flex-1 min-w-[180px]">
        <p className="text-sm font-medium">Abrir turno</p>
        <p className="text-[11px] text-stone-500">
          Declara el efectivo con el que arrancas en caja.
        </p>
      </div>
      <div>
        <label className="block text-[10px] text-stone-600 mb-1">
          Efectivo base (COP)
        </label>
        <input
          type="number"
          min="0"
          step="1000"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="w-32 px-3 py-2 text-sm border border-stone-300 rounded-lg"
        />
      </div>
      <button
        type="submit"
        disabled={abrir.isPending}
        className="bg-distrito-black text-distrito-cream text-sm py-2 px-4 rounded-lg disabled:opacity-50"
      >
        {abrir.isPending ? "Abriendo..." : "Abrir turno"}
      </button>
      {errorMsg && (
        <p className="w-full text-xs text-red-600">{errorMsg}</p>
      )}
    </form>
  );
}

function TurnoAbiertoCard({ turno }: { turno: TurnoResponse }) {
  const [showGasto, setShowGasto] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);

  const esperado =
    turno.efectivoApertura + turno.efectivoCobradoEnTurno - turno.totalGastosEnTurno;

  return (
    <div className="bg-white border-l-4 border-distrito-gold-dark border-y border-r border-stone-200 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-stone-500">
            Turno abierto · {turno.empleadoNombre}
          </p>
          <p className="text-xs text-stone-600 mt-0.5">
            Desde {formatoHora.format(new Date(turno.fechaApertura))} · base{" "}
            <strong>{formatoCOP.format(turno.efectivoApertura)}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGasto(true)}
            className="text-xs px-3 py-1.5 border border-stone-300 rounded-md"
          >
            + Gasto
          </button>
          <button
            onClick={() => setShowCerrar(true)}
            className="text-xs px-3 py-1.5 bg-distrito-black text-distrito-cream rounded-md"
          >
            Cerrar turno
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
        <Mini etiqueta="Cobrado en efectivo" valor={formatoCOP.format(turno.efectivoCobradoEnTurno)} />
        <Mini etiqueta="Gastos del turno" valor={formatoCOP.format(turno.totalGastosEnTurno)} />
        <Mini
          etiqueta="Efectivo esperado"
          valor={formatoCOP.format(esperado)}
          fuerte
        />
        <Mini etiqueta="Gastos #" valor={turno.gastos.length.toString()} />
      </div>

      {turno.gastos.length > 0 && (
        <details className="mt-3">
          <summary className="text-[11px] text-stone-600 cursor-pointer">
            Ver gastos del turno
          </summary>
          <ul className="mt-2 space-y-1">
            {turno.gastos.map((g) => (
              <li
                key={g.id}
                className="text-[11px] flex justify-between border-b border-stone-100 py-1"
              >
                <span>
                  <span className="text-stone-500">
                    {formatoHora.format(new Date(g.fecha))}
                  </span>{" "}
                  · {g.concepto}
                </span>
                <span className="font-medium">- {formatoCOP.format(g.monto)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {showGasto && (
        <GastoModal turnoId={turno.id} onClose={() => setShowGasto(false)} />
      )}
      {showCerrar && (
        <CerrarTurnoModal
          turno={turno}
          esperado={esperado}
          onClose={() => setShowCerrar(false)}
        />
      )}
    </div>
  );
}

function Mini({
  etiqueta,
  valor,
  fuerte,
}: {
  etiqueta: string;
  valor: string;
  fuerte?: boolean;
}) {
  return (
    <div className="bg-stone-50 rounded-md px-2 py-1.5">
      <p className="text-[10px] text-stone-500">{etiqueta}</p>
      <p className={`text-sm mt-0.5 ${fuerte ? "font-medium" : ""}`}>{valor}</p>
    </div>
  );
}

function GastoModal({ turnoId, onClose }: { turnoId: number; onClose: () => void }) {
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const registrar = useRegistrarGasto();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registrar.mutateAsync({
      turnoId,
      concepto,
      monto: Number(monto),
    });
    onClose();
  };

  const err = (registrar.error as { response?: { data?: { mensaje?: string } } })?.response
    ?.data?.mensaje;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl border border-stone-200 w-full max-w-sm p-6 space-y-3"
      >
        <h3 className="text-base font-medium">Registrar gasto</h3>
        <p className="text-xs text-stone-500">
          Cualquier salida de efectivo del turno (domiciliario, propina, compra menor).
        </p>
        <div>
          <label className="block text-xs text-stone-600 mb-1">Concepto</label>
          <input
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            required
            minLength={2}
            placeholder="Ej: Domiciliario, mecánico, compra de jabón"
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-600 mb-1">Monto (COP)</label>
          <input
            type="number"
            min="100"
            step="100"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
          />
        </div>
        {err && <p className="text-xs text-red-600">{err}</p>}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-stone-300 text-sm py-2 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={registrar.isPending}
            className="flex-[2] bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
          >
            {registrar.isPending ? "Guardando..." : "Guardar gasto"}
          </button>
        </div>
      </form>
    </div>
  );
}

function CerrarTurnoModal({
  turno,
  esperado,
  onClose,
}: {
  turno: TurnoResponse;
  esperado: number;
  onClose: () => void;
}) {
  const [declarado, setDeclarado] = useState(esperado.toFixed(0));
  const [observaciones, setObservaciones] = useState("");
  const cerrar = useCerrarTurno();

  const diferencia = Number(declarado) - esperado;
  const diferenciaColor =
    Math.abs(diferencia) < 1
      ? "text-stone-600"
      : diferencia < 0
      ? "text-red-700"
      : "text-amber-700";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await cerrar.mutateAsync({
      id: turno.id,
      efectivoCierreDeclarado: Number(declarado),
      observaciones: observaciones.trim() || undefined,
    });
    onClose();
  };

  const err = (cerrar.error as { response?: { data?: { mensaje?: string } } })?.response
    ?.data?.mensaje;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl border border-stone-200 w-full max-w-sm p-6 space-y-3"
      >
        <h3 className="text-base font-medium">Cerrar turno</h3>

        <div className="bg-distrito-cream/60 rounded-lg p-3 text-xs space-y-1">
          <Linea etiqueta="Base de apertura" valor={formatoCOP.format(turno.efectivoApertura)} />
          <Linea etiqueta="+ Cobrado en efectivo" valor={formatoCOP.format(turno.efectivoCobradoEnTurno)} />
          <Linea etiqueta="− Gastos del turno" valor={formatoCOP.format(turno.totalGastosEnTurno)} />
          <div className="border-t border-stone-300 mt-1 pt-1">
            <Linea etiqueta="Esperado en caja" valor={formatoCOP.format(esperado)} fuerte />
          </div>
        </div>

        <div>
          <label className="block text-xs text-stone-600 mb-1">
            Efectivo real en caja (cuéntalo y escríbelo)
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={declarado}
            onChange={(e) => setDeclarado(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
          />
          <p className={`text-xs mt-1 ${diferenciaColor}`}>
            Diferencia: {formatoCOP.format(diferencia)}{" "}
            {Math.abs(diferencia) < 1
              ? "(cuadra)"
              : diferencia < 0
              ? "(faltante)"
              : "(sobrante)"}
          </p>
        </div>

        <div>
          <label className="block text-xs text-stone-600 mb-1">
            Observaciones (opcional)
          </label>
          <input
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ej: descuadre por moneda menor"
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
          />
        </div>

        {err && <p className="text-xs text-red-600">{err}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-stone-300 text-sm py-2 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cerrar.isPending}
            className="flex-[2] bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
          >
            {cerrar.isPending ? "Cerrando..." : "Cerrar turno"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Linea({
  etiqueta,
  valor,
  fuerte,
}: {
  etiqueta: string;
  valor: string;
  fuerte?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-stone-600">{etiqueta}</span>
      <span className={fuerte ? "font-medium" : ""}>{valor}</span>
    </div>
  );
}
