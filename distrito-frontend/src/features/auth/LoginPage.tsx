import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Navigate } from "react-router-dom";
import { useLogin } from "./useLogin";
import { useAuthStore } from "../../store/authStore";
import { rutaInicialPorRol } from "../../types/auth";

const schema = z.object({
  email: z.string().min(1, "Requerido").email("Email inválido"),
  password: z.string().min(1, "Requerido"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (usuario) {
    return <Navigate to={rutaInicialPorRol(usuario.rol)} replace />;
  }

  const onSubmit = (values: FormValues) => {
    login.mutate(values, {
      onSuccess: (data) => {
        navigate(rutaInicialPorRol(data.usuario.rol), { replace: true });
      },
    });
  };

  const errorMsg =
    login.isError &&
    ((login.error as { response?: { data?: { mensaje?: string } } })?.response
      ?.data?.mensaje ?? "Error al ingresar");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-lg p-8"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-distrito-black text-distrito-gold flex items-center justify-center text-xl font-medium tracking-widest mx-auto mb-3">
            DL
          </div>
          <h1 className="text-xl font-medium">Distrito Loft</h1>
          <p className="text-xs text-stone-500 mt-1">Plataforma operativa</p>
        </div>

        <label className="block text-xs text-stone-600 mb-1">Correo</label>
        <input
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          className="w-full mb-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-distrito-gold-dark"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-600 mb-2">{errors.email.message}</p>
        )}
        <div className="h-3" />

        <label className="block text-xs text-stone-600 mb-1">Contraseña</label>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full mb-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-distrito-gold-dark"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-600 mb-2">{errors.password.message}</p>
        )}
        <div className="h-4" />

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md px-3 py-2 mb-4">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full bg-distrito-black text-distrito-cream py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {login.isPending ? "Ingresando..." : "Ingresar"}
        </button>

        <div className="flex items-center gap-2 my-5 text-xs text-stone-400">
          <div className="flex-1 h-px bg-stone-200" />
          <span>o</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <button
          type="button"
          disabled
          className="w-full border border-stone-300 text-stone-400 py-2 rounded-lg text-xs cursor-not-allowed"
        >
          Ingresar con código por WhatsApp (próximamente)
        </button>

        <p className="text-center text-xs text-stone-500 mt-5">
          ¿Eres nuevo?{" "}
          <span className="text-distrito-gold-dark">Crear cuenta (próximamente)</span>
        </p>
      </form>
    </div>
  );
}
