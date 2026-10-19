import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null") as {
        role?: string;
        mustChangePassword?: boolean;
      } | null;
    } catch {
      return null;
    }
  })();

  if (!token) return <Navigate to="/" replace />;
  if (user?.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }
  if (!user?.mustChangePassword && location.pathname === "/change-password") {
    return <Navigate to={user?.role === "SYSADMIN" ? "/admin" : "/dashboard"} replace />;
  }

  return <Outlet />;
}