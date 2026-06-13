import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { etiquetaRol } from "../types/auth";

interface Props {
  titulo: string;
  proximo: string;
}

export function RolPlaceholder({ titulo, proximo }: Props) {
  const usuario = useAuthStore((s) => s.usuario);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  const cerrarSesion = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-distrito-black text-distrito-cream px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-distrito-gold font-medium tracking-widest text-sm">DL</span>
          <div>
            <p className="text-sm font-medium leading-none">Distrito Loft</p>
            <p className="text-xs text-distrito-gold mt-1">{titulo}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs leading-none">{usuario.nombre}</p>
            <p className="text-[10px] text-distrito-gold mt-1">
              {etiquetaRol(usuario.rol)}
            </p>
          </div>
          <button
            onClick={cerrarSesion}
            className="text-xs px-3 py-1.5 border border-distrito-gold text-distrito-gold rounded-md"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-lg p-8 text-center">
          <h2 className="text-lg font-medium mb-2">Hola, {usuario.nombre} 👋</h2>
          <p className="text-sm text-stone-600 mb-6">
            Has iniciado sesión como <strong>{etiquetaRol(usuario.rol)}</strong>.
          </p>
          <div className="bg-distrito-cream rounded-lg p-4 text-left">
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Próximamente</p>
            <p className="text-sm">{proximo}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
