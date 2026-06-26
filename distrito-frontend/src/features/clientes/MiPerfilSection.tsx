import { useEffect, useState } from "react";
import { useActualizarMiPerfil, useMiPerfil } from "./useMiPerfil";

export function MiPerfilSection() {
  const { data, isLoading } = useMiPerfil();
  const actualizar = useActualizarMiPerfil();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setNombre(data.nombre);
      setTelefono(data.telefono);
      setEmail(data.email ?? "");
      setDireccion(data.direccionPrincipal ?? "");
    }
  }, [data]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg(null);
    await actualizar.mutateAsync({
      nombre,
      telefono,
      email: email.trim() ? email.trim() : null,
      direccionPrincipal: direccion.trim() ? direccion.trim() : null,
    });
    setOkMsg("Datos actualizados.");
  };

  if (isLoading) return <p className="text-sm text-stone-500">Cargando perfil...</p>;
  if (!data) return null;

  const errorMsg =
    (actualizar.error as { response?: { data?: { mensaje?: string } } })?.response?.data
      ?.mensaje;

  return (
    <section className="bg-white border border-stone-200 rounded-xl p-5">
      <h3 className="text-base font-medium mb-1">Mis datos</h3>
      <p className="text-xs text-stone-500 mb-4">
        Mantén tus datos al día para que la lavandería pueda contactarte.
      </p>

      <form onSubmit={submit} className="space-y-3">
        <Campo label="Nombre" value={nombre} onChange={setNombre} required />
        <Campo label="Teléfono" value={telefono} onChange={setTelefono} required />
        <Campo label="Email" value={email} onChange={setEmail} type="email" />
        <Campo label="Dirección principal" value={direccion} onChange={setDireccion} />

        {okMsg && <p className="text-xs text-green-700">{okMsg}</p>}
        {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

        <button
          type="submit"
          disabled={actualizar.isPending}
          className="w-full bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
        >
          {actualizar.isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-stone-200 text-xs text-stone-600 space-y-1">
        <p>
          <strong>Lavados acumulados:</strong> {data.lavadosAcumulados}
        </p>
        <p>
          <strong>Cuenta del portal:</strong>{" "}
          {data.conPortal ? "activa" : "sin contraseña"}
        </p>
      </div>
    </section>
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
