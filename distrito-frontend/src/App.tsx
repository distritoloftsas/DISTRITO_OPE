import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ClientePage } from "./pages/ClientePage";
import { EmpleadoPage } from "./pages/EmpleadoPage";
import { GerentePage } from "./pages/GerentePage";
import { AdminPage } from "./pages/AdminPage";
import { CambiarPasswordPage } from "./pages/CambiarPasswordPage";
import { RegistroClientePage } from "./pages/RegistroClientePage";
import { SeguimientoPublicoPage } from "./pages/SeguimientoPublicoPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useAuthStore } from "./store/authStore";
import { rutaInicialPorRol } from "./types/auth";

function Home() {
  const usuario = useAuthStore((s) => s.usuario);
  if (usuario) {
    return <Navigate to={rutaInicialPorRol(usuario.rol)} replace />;
  }
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroClientePage />} />
        <Route path="/p/:codigo" element={<SeguimientoPublicoPage />} />
        <Route
          path="/cambiar-password"
          element={
            <ProtectedRoute roles={["CLIENTE", "EMPLEADO", "GERENTE_SEDE", "SUPER_ADMIN"]}>
              <CambiarPasswordPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente"
          element={
            <ProtectedRoute roles={["CLIENTE"]}>
              <ClientePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/empleado"
          element={
            <ProtectedRoute roles={["EMPLEADO"]}>
              <EmpleadoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gerente"
          element={
            <ProtectedRoute roles={["GERENTE_SEDE"]}>
              <GerentePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
