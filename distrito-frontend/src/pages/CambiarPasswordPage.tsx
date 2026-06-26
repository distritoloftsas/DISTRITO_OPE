import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { rutaInicialPorRol, type Usuario } from "../types/auth";
import { PasswordInput } from "../components/PasswordInput";
import { usePageTitle } from "../lib/usePageTitle";

export function CambiarPasswordPage() {
  usePageTitle("Cambiar contraseña");
  const usuario = useAuthStore((s) => s.usuario);
  const setUsuario = useAuthStore((s) => s.setUsuario);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<Usuario>("/auth/cambiar-password", {
        passwordActual: actual,
        passwordNueva: nueva,
      });
      return data;
    },
    onSuccess: (data) => {
      setUsuario(data);
      qc.invalidateQueries({ queryKey: ["currentUser"] });
      navigate(rutaInicialPorRol(data.rol), { replace: true });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
      setError(msg ?? "No se pudo cambiar la contraseña.");
    },
  });

  const obligatorio = usuario?.mustChangePassword ?? false;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (nueva.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (nueva !== confirmar) {
      setError("La confirmación no coincide.");
      return;
    }
    mutation.mutate();
  };

  const cerrarSesion = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-distrito-cream flex items-center justify-center p-6">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md">
        <header className="px-6 py-4 border-b border-stone-200">
          <h1 className="text-base font-medium">Cambia tu contraseña</h1>
          {obligatorio && (
            <p className="text-xs text-amber-700 mt-1">
              Por seguridad debes definir una contraseña propia antes de continuar.
            </p>
          )}
        </header>

        <form onSubmit={submit} className="p-6 space-y-3">
          <div>
            <label className="block text-xs text-stone-600 mb-1">Contraseña actual</label>
            <PasswordInput
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-600 mb-1">Nueva contraseña</label>
            <PasswordInput
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-xs text-stone-600 mb-1">Confirmar nueva contraseña</label>
            <PasswordInput
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-distrito-black text-distrito-cream text-sm py-2 rounded-lg disabled:opacity-50"
          >
            {mutation.isPending ? "Guardando..." : "Cambiar contraseña"}
          </button>

          {obligatorio && (
            <button
              type="button"
              onClick={cerrarSesion}
              className="w-full text-xs text-stone-500 py-1"
            >
              Cerrar sesión
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

