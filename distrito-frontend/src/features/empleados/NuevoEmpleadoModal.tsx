import { useState } from "react";
import { useCrearEmpleado } from "./useEmpleados";
import { useAuthStore } from "../../store/authStore";
import { PasswordInput } from "../../components/PasswordInput";
import type { RolUsuario } from "../../types/auth";

interface Props {
  onClose: () => void;
  onCreado: (nombre: string) => void;
  sedeIdInicial?: number;
}

export function NuevoEmpleadoModal({ onClose, onCreado, sedeIdInicial }: Props) {
  const usuario = useAuthStore((s) => s.usuario);
  const esSuper = usuario?.rol === "SUPER_ADMIN";

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargo, setCargo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<RolUsuario>("EMPLEADO");
  const [sedeId, setSedeId] = useState<string>(sedeIdInicial ? String(sedeIdInicial) : "");

  const crear = useCrearEmpleado();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crear.mutateAsync({
        email,
        nombre,
        telefono: telefono || undefined,
        cargo: cargo || undefined,
        password,
        rol,
        sedeId: esSuper && sedeId ? Number(sedeId) : undefined,
      });
      onCreado(nombre);
    } catch {
      // mostrado abajo
    }
  };

  const errorMsg = errorMensaje(crear.error);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-lg">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-center">
          <h3 className="text-base font-medium">Nuevo empleado</h3>
          <button onClick={onClose} className="text-stone-400 text-xl leading-none">×</button>
        </header>

        <form onSubmit={submit} className="p-6 space-y-3">
          <Campo label="Nombre completo" value={nombre} onChange={setNombre} required />
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Email" type="email" value={email} onChange={setEmail} required />
            <Campo label="Teléfono" value={telefono} onChange={setTelefono} />
          </div>
          <Campo label="Cargo (opcional)" value={cargo} onChange={setCargo} />
          <div>
            <label className="block text-xs text-stone-600 mb-1">Contraseña inicial</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-[10px] text-stone-500 mt-1">
              El empleado deberá cambiarla en su primer ingreso (mín. 8 caracteres).
            </p>
          </div>

          {esSuper && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-600 mb-1">Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as RolUsuario)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                >
                  <option value="EMPLEADO">Empleado</option>
                  <option value="GERENTE_SEDE">Gerente de sede</option>
                </select>
              </div>
              <Campo label="Sede ID" value={sedeId} onChange={setSedeId} required />
            </div>
          )}

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
              {crear.isPending ? "Creando..." : "Crear empleado"}
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
  type = "text",
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-stone-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
      />
      {hint && <p className="text-[10px] text-stone-500 mt-1">{hint}</p>}
    </div>
  );
}

function errorMensaje(err: unknown): string | null {
  if (!err) return null;
  const data = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
  return data ?? "Ocurrió un error";
}
