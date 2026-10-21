import { Home, LayoutDashboard, LogOut, Shield, Users } from "lucide-react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const adminNavigation = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/accounts", label: "Quản lý tài khoản", icon: Users },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (user?.role !== "SYSADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const pageTitle = location.pathname === "/admin/accounts"
    ? "Quản lý tài khoản"
    : "Tổng quan hệ thống";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="sticky top-0 hidden h-screen max-h-screen w-64 shrink-0 flex-col overflow-y-auto bg-slate-950 text-slate-100 md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 text-slate-950">
            <Shield size={22} />
          </span>
          <div>
            <p className="text-sm font-bold">QUẢN TRỊ HỆ THỐNG</p>
            <p className="mt-0.5 text-xs text-slate-400">Quản lý khí tài</p>
          </div>
        </div>

        <nav aria-label="Điều hướng quản trị" className="flex-1 space-y-1 px-3 py-6">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Không gian quản trị
          </p>
          {adminNavigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-800 text-sm font-bold text-cyan-300">
              {(user?.fullName || user?.username || "A").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.fullName || user?.username || "Quản trị viên"}</p>
              <p className="text-xs text-slate-400">SYSADMIN</p>
            </div>
          </div>
          <NavLink
            to="/dashboard"
            className="mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Home size={18} />
            Về trang chủ
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-cyan-300 md:hidden">
                <Shield size={19} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{pageTitle}</p>
                <p className="hidden text-xs text-slate-500 sm:block">Trung tâm quản trị hệ thống</p>
              </div>
            </div>
            <span className="rounded border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-cyan-800">
              SYSADMIN
            </span>
          </div>
          <nav aria-label="Điều hướng quản trị trên thiết bị nhỏ" className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 md:hidden">
            {adminNavigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded px-3 py-2 text-xs font-semibold ${
                    isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/dashboard"
              className="flex shrink-0 items-center gap-2 rounded px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <Home size={16} />
              Trang chủ
            </NavLink>
            <button
              type="button"
              onClick={logout}
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="ml-auto flex shrink-0 items-center justify-center rounded px-3 py-2 text-slate-600 hover:bg-slate-100"
            >
              <LogOut size={17} />
            </button>
          </nav>
        </header>

        <main className="min-w-0 flex-1 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}