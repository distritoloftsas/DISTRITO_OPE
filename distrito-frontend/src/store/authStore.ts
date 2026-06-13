import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, Usuario } from "../types/auth";

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  setSession: (auth: AuthResponse) => void;
  setUsuario: (usuario: Usuario) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      setSession: (auth) => set({ token: auth.token, usuario: auth.usuario }),
      setUsuario: (usuario) => set({ usuario }),
      clearSession: () => set({ token: null, usuario: null }),
    }),
    {
      name: "distrito-auth",
    }
  )
);
