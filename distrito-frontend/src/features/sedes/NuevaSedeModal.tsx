import { useState } from "react";
import { useCrearSede } from "./useSedes";

interface Props {
  onClose: () => void;
  onCreada: (nombre: string) => void;
}

export function NuevaSedeModal({ onClose, onCreada }: Props) {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [telefono, setTelefono] = useState("");
  const crear = useCrearSede();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crear.mutateAsync({ nombre, direccion, ciudad, telefono: telefono || undefined });
      onCreada(nombre);
    } catch {
      // mostrado abajo
    }
  };

  const errorMsg = errorMensaje(crear.error);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-center">
          <h3 className="text-base font-medium">Nueva sede</h3>
          <button onClick={onClose} className="text-stone-400 text-xl leading-none">×</button>
        </header>

        <form onSubmit={submit} className="p-6 space-y-3">
          <Campo label="Nombre" value={nombre} onChange={setNombre} required />
          <Campo label="Dirección" value={direccion} onChange={setDireccion} required />
          <Campo label="Ciudad" value={ciudad} onChange={setCiudad} required />
          <Campo label="Teléfono (opcional)" value={telefono} onChange={setTelefono} />

          <p className="text-[10px] text-stone-500">
            Se crearán automáticamente 3 lavadoras y 3 secadoras para esta sede.
          </p>

          {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-stone-300 text-sm py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={crear.isPending}
              className="flex-[2] bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
            >
              {crear.isPending ? "Creando..." : "Crear sede"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-stone-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
      />
    </div>
  );
}

function errorMensaje(err: unknown): string | null {
  if (!err) return null;
  const data = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
  return data ?? "Ocurrió un error";
}
