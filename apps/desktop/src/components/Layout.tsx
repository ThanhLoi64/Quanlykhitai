import { useState } from "react";
import {
  Home,
  Shield,
  Warehouse,
  Tags,
  ClipboardList,
  Users,
  Activity,
  LogOut,
  Menu,
  ChevronLeft,
  Info,
  ClockAlert,
  ListCheck,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import LoginStatus from "../components/Loginstatus";


export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  }

  const menuClass = ({ isActive }: { isActive: boolean }) => `
  flex
  items-center
  ${collapsed ? "justify-center" : "gap-3"}
  px-4
  py-3
  rounded-lg
  transition-all
  duration-200
  ${
    isActive
      ? "bg-blue-600 text-white"
      : "text-slate-300 hover:bg-slate-700 hover:text-white"
  }
`;

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}

      <aside
        className={`
    ${collapsed ? "w-20" : "w-64"}
    bg-slate-900
    text-white
    px-5
    flex
    flex-col
    transition-all
    duration-300
  `}
      >
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-xl font-bold uppercase">QUẢN LÝ KHÍ TÀI</h2>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded hover:bg-slate-700"
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {!collapsed && (
          <div className="mt-6 border-b border-slate-700 pb-6">
            <LoginStatus />
          </div>
        )}
        <nav
          className="
          flex
          flex-col
          gap-1
          "
        >
          <NavLink to="/dashboard" className={menuClass}>
            <Home size={20} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/categories" className={menuClass}>
            <Tags size={20} />
            {!collapsed && <span>Danh mục</span>}
          </NavLink>
          <NavLink to="/products" className={menuClass}>
            <Shield size={20} />
            {!collapsed && <span>Thống kê vũ khí</span>}
          </NavLink>

          <NavLink to="/inventory" className={menuClass}>
            <Warehouse size={20} />
            {!collapsed && <span>Nhập kho</span>}
          </NavLink>
          <NavLink to="/registrations" className={menuClass}>
            <ClipboardList size={30} />
            {!collapsed && <span>Đăng ký sử dụng vũ khí - khí tài</span>}
          </NavLink>

          <NavLink to="/owners" className={menuClass}>
            <Users size={20} />
            {!collapsed && <span>Danh sách Quân nhân</span>}
          </NavLink>
          <NavLink to="/warehouses" className={menuClass}>
            <ListCheck size={20} />
            {!collapsed && <span>Danh sách kho</span>}
          </NavLink>
          <NavLink to="/broken-watching" className={menuClass}>
            <ClockAlert size={30} />
            {!collapsed && <span>Theo dõi hư hỏng - sửa chữa</span>}
          </NavLink>
          <NavLink to="/logs" className={menuClass}>
            <Activity size={20} />
            {!collapsed && <span>Nhật ký hệ thống</span>}
          </NavLink>
          <NavLink to="/about" className={menuClass}>
            <Info size={20} />
            {!collapsed && <span>Thông tin hệ thống</span>}
          </NavLink>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-1 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition mt-5"
          >
            <LogOut size={20} />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
          {/* <div className=" text-center text-[0.7rem] text-slate-500 ">
            <span>
              {!collapsed && (
                <span> @ 2026 Quan Ly Khi Tai. All rights reserved.</span>
              )}
            </span>
          </div> */}
        </nav>
      </aside>

      {/* CONTENT */}

      <main
        className="
        flex-1
        p-8
        bg-slate-100
        overflow-auto
        "
      >
        <Outlet />
      </main>
    </div>
  );
}
