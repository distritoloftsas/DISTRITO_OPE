import { useState } from "react";
import { useEscape } from "../../lib/useEscape";
import { useActivarCuentaCliente, useActualizarCliente } from "./useClientes";
import { PasswordInput } from "../../components/PasswordInput";
import type { ClienteResponse } from "../../types/cliente";

interface Props {
  cliente: ClienteResponse;
  onClose: () => void;
  onGuardado: () => void;
}

export function EditarClienteModal({ cliente, onClose, onGuardado }: Props) {
  useEscape(onClose);
  const [nombre, setNombre] = useState(cliente.nombre);
  const [telefono, setTelefono] = useState(cliente.telefono);
  const [email, setEmail] = useState(cliente.email ?? "");
  const [direccion, setDireccion] = useState(cliente.direccionPrincipal ?? "");

  const actualizar = useActualizarCliente();
  const activar = useActivarCuentaCliente();
  const [mostrarActivar, setMostrarActivar] = useState(false);
  const [emailActivar, setEmailActivar] = useState(cliente.email ?? "");
  const [passwordActivar, setPasswordActivar] = useState("");
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await actualizar.mutateAsync({
        id: cliente.id,
        payload: {
          nombre,
          telefono,
          email: email.trim() ? email.trim() : null,
          direccionPrincipal: direccion.trim() ? direccion.trim() : null,
        },
      });
      onGuardado();
    } catch {
      // se muestra abajo
    }
  };

  const errorMsg =
    (actualizar.error as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
  const errorActivar =
    (activar.error as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;

  const submitActivar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg(null);
    await activar.mutateAsync({
      id: cliente.id,
      payload: { email: emailActivar.trim(), password: passwordActivar },
    });
    setOkMsg(
      `Cuenta creada. Entrégale al cliente la contraseña temporal — se le pedirá cambiarla en el primer ingreso.`
    );
    setPasswordActivar("");
    setMostrarActivar(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md">
        <header className="px-6 py-4 border-b border-stone-200 flex justify-between items-start">
          <div>
            <h3 className="text-base font-medium">Editar cliente</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {cliente.lavadosAcumulados} lavado(s) acumulado(s)
              {cliente.conPortal ? " · Con cuenta" : " · Sin cuenta"}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 text-xl leading-none">
            ×
          </button>
        </header>

        <form onSubmit={submit} className="p-6 space-y-3">
          <Campo label="Nombre" value={nombre} onChange={setNombre} required />
          <Campo label="Teléfono" value={telefono} onChange={setTelefono} required />
          <Campo label="Email (opcional)" value={email} onChange={setEmail} type="email" />
          <Campo label="Dirección principal (opcional)" value={direccion} onChange={setDireccion} />

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
              disabled={actualizar.isPending}
              className="flex-[2] bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
            >
              {actualizar.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>

        <div className="border-t border-stone-200 px-6 py-4 bg-stone-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">
                {cliente.conPortal ? "Cuenta activa" : "Sin cuenta"}
              </p>
              <p className="text-[11px] text-stone-500">
                {cliente.conPortal
                  ? "El cliente puede iniciar sesión con su email."
                  : "El cliente aún no puede entrar al portal."}
              </p>
            </div>
            {!mostrarActivar && (
              <button
                type="button"
                onClick={() => setMostrarActivar(true)}
                className="text-xs px-3 py-1.5 border border-distrito-gold-dark text-distrito-black rounded-md"
              >
                {cliente.conPortal ? "Resetear contraseña" : "Activar cuenta"}
              </button>
            )}
          </div>

          {okMsg && (
            <p className="text-[11px] text-green-700 mt-2">{okMsg}</p>
          )}

          {mostrarActivar && (
            <form onSubmit={submitActivar} className="mt-3 space-y-2">
              <Campo
                label="Email del cliente"
                value={emailActivar}
                onChange={setEmailActivar}
                type="email"
                required
              />
              <div>
                <label className="block text-xs text-stone-600 mb-1">
                  Contraseña temporal (mín. 8 caracteres)
                </label>
                <PasswordInput
                  value={passwordActivar}
                  onChange={(e) => setPasswordActivar(e.target.value)}
                  minLength={8}
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              {errorActivar && <p className="text-xs text-red-600">{errorActivar}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMostrarActivar(false)}
                  className="flex-1 border border-stone-300 text-xs py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={activar.isPending}
                  className="flex-[2] bg-distrito-black text-distrito-cream text-xs py-2 rounded-lg disabled:opacity-50"
                >
                  {activar.isPending ? "Guardando..." : "Crear cuenta"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
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
    </div>
  );
}
