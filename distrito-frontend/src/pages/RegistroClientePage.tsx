import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useRegistroCliente } from "../features/auth/useRegistroCliente";
import { useAuthStore } from "../store/authStore";
import { rutaInicialPorRol } from "../types/auth";
import { PasswordInput } from "../components/PasswordInput";

export function RegistroClientePage() {
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const registro = useRegistroCliente();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (usuario) {
    return <Navigate to={rutaInicialPorRol(usuario.rol)} replace />;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("La confirmación no coincide.");
      return;
    }
    registro.mutate(
      { nombre, telefono, email, password },
      {
        onSuccess: (data) => navigate(rutaInicialPorRol(data.usuario.rol), { replace: true }),
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
          setError(msg ?? "No se pudo crear la cuenta.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-distrito-cream">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-lg p-8"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-distrito-black text-distrito-gold flex items-center justify-center text-xl font-medium tracking-widest mx-auto mb-3">
            DL
          </div>
          <h1 className="text-xl font-medium">Crear cuenta</h1>
          <p className="text-xs text-stone-500 mt-1">Sigue tus pedidos en tiempo real</p>
        </div>

        <Campo label="Nombre completo" value={nombre} onChange={setNombre} required />
        <Campo label="Teléfono" value={telefono} onChange={setTelefono} required type="tel" />
        <Campo label="Email" value={email} onChange={setEmail} required type="email" />

        <label className="block text-xs text-stone-600 mb-1 mt-3">Contraseña</label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />

        <label className="block text-xs text-stone-600 mb-1 mt-3">Confirmar contraseña</label>
        <PasswordInput
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          required
          autoComplete="new-password"
        />

        {error && (
          <p className="text-xs text-red-600 mt-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={registro.isPending}
          className="w-full bg-distrito-black text-distrito-cream py-2.5 rounded-lg text-sm font-medium mt-5 disabled:opacity-50"
        >
          {registro.isPending ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="text-center text-xs text-stone-500 mt-5">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-distrito-gold-dark">
            Ingresa aquí
          </Link>
        </p>
      </form>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-stone-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-distrito-gold-dark"
      />
    </div>
  );
}
