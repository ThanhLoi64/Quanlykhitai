import { useState } from "react";
import {
  Home,
  Shield,
  Warehouse,
  Send,
  Tags,
  ClipboardList,
  Users,
  Activity,
  Menu,
  ChevronLeft,
  ClockAlert,
  ListCheck,
  UserPlus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const canManageChildren = ["SYSADMIN", "ADMIN", "STAFF"].includes(user?.role);

  const menuClass = ({ isActive }: { isActive: boolean }) => `
  group relative flex items-center ${collapsed ? "justify-center" : "gap-3"}
  rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200
  ${
    isActive
      ? "bg-cyan-400/12 text-white shadow-[inset_0_0_0_1px_rgba(103,232,249,0.16)]"
      : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
  }
`;

  const displayName = user?.fullName || user?.username || "Người dùng";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}

      <aside
        className={`
    ${collapsed ? "w-[76px]" : "w-[276px]"}
    relative flex flex-col overflow-hidden border-r border-slate-800/80
    bg-[#101923] px-3 text-white shadow-2xl shadow-slate-950/20 transition-all duration-300
  `}
      >
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} border-b border-white/[0.07] px-2 py-5`}>
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-300/20">
              <ShieldCheck size={22} strokeWidth={2.4} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/70">Quản lý hệ thống</p>
                <h2 className="truncate text-[14px] font-extrabold tracking-[0.12em] text-white">KHÍ TÀI</h2>
                
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Thu gọn thanh điều hướng"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Mở rộng thanh điều hướng"
            className="mx-auto mt-4 rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Menu size={19} />
          </button>
        )}

        {!collapsed && (
          <div className="mx-2 mt-5 flex items-center gap-2 rounded-lg bg-emerald-400/[0.08] px-3 py-2 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]" />
            Hệ thống đang hoạt động
          </div>
        )}
        <nav
          className="
          min-h-0
          flex-1
          flex
          flex-col
          gap-1.5
          overflow-y-auto
          px-1
          pb-4
          pt-5
          sidebar-scrollbar
          "
        >
          {!collapsed && <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Điều hành</p>}
          <NavLink to="/dashboard" className={menuClass}>
            <Home size={20} />
            {!collapsed && <span>Trang chủ</span>}
          </NavLink>
          <NavLink to="/weapon-search" className={menuClass}>
            <Search size={20} />
            {!collapsed && <span>Tra cứu khí tài</span>}
          </NavLink>

          <NavLink to="/categories" className={menuClass}>
            <Tags size={20} />
            {!collapsed && <span>Danh mục</span>}
          </NavLink>
          <NavLink to="/products" className={menuClass}>
            <Shield size={20} />
            {!collapsed && <span>Thống kê vũ khí</span>}
          </NavLink>

          <div className="space-y-1">
            <NavLink to="/inventory" end className={menuClass}>
              <Warehouse size={20} />
              {!collapsed && <span>Nhập kho</span>}
            </NavLink>
            {!collapsed && (
              <div className="ml-8 space-y-1 border-l border-slate-700 pl-2">
                <NavLink to="/inventory" end className={menuClass}>
                  <span>Khí tài, vũ khí</span>
                </NavLink>
                <NavLink to="/inventory/ammunition" className={menuClass}>
                  <span>Đạn dược</span>
                </NavLink>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <NavLink to="/exports" end className={menuClass}>
              <Send size={20} />
              {!collapsed && <span>Xuất kho</span>}
            </NavLink>
            {!collapsed && (
              <div className="ml-8 space-y-1 border-l border-slate-700 pl-2">
                <NavLink to="/exports" end className={menuClass}>
                  <span>Khí tài, vũ khí</span>
                </NavLink>
                <NavLink to="/exports/ammunition" className={menuClass}>
                  <span>Đạn dược</span>
                </NavLink>
              </div>
            )}
          </div>
          <NavLink to="/registrations" className={menuClass}>
            <ClipboardList size={30} />
            {!collapsed && <span>Biên chế cá nhân</span>}
          </NavLink>
          <NavLink to="/warehouses" className={menuClass}>
            <ListCheck size={20} />
            {!collapsed && <span>Danh sách kho</span>}
          </NavLink>
          <NavLink to="/broken-watching" className={menuClass}>
            <ClockAlert size={30} />
            {!collapsed && <span>Theo dõi hư hỏng - sửa chữa</span>}
          </NavLink>
          <NavLink to="/owners" className={menuClass}>
            <Users size={20} />
            {!collapsed && <span>Danh sách Quân nhân</span>}
          </NavLink>
          <NavLink to="/logs" className={menuClass}>
            <Activity size={20} />
            {!collapsed && <span>Nhật ký hệ thống</span>}
          </NavLink>
          {canManageChildren && (
            <NavLink to="/child-accounts" className={menuClass}>
              <UserPlus size={20} />
              {!collapsed && <span>Tài khoản cấp dưới</span>}
            </NavLink>
          )}
          {/* <NavLink to="/about" className={menuClass}>
            <Info size={20} />
            {!collapsed && <span>Thông tin hệ thống</span>}
          </NavLink> */}
          {/* <div className=" text-center text-[0.7rem] text-slate-500 ">
            <span>
              {!collapsed && (
                <span> @ 2026 Quan Ly Khi Tai. All rights reserved.</span>
              )}
            </span>
          </div> */}
        </nav>
        <div className={`mt-auto border-t border-white/[0.07] py-4 ${collapsed ? "px-1" : "px-2"}`}>
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl bg-white/[0.045] p-2.5`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-sm font-bold text-cyan-200">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-100">{displayName}</p>
                <p className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-slate-500">{user?.role || "Tài khoản"}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CONTENT */}

      <main
        className="
        flex-1
        px-8
        pb-8
        bg-slate-100
        overflow-auto
        "
      >
        <Outlet />
      </main>
    </div>
  );
}
