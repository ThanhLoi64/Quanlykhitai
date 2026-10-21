import { useEffect, useRef, useState, type FormEvent } from "react";
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
  Bell,
  LogOut,
} from "lucide-react";
import { Badge, IconButton, Menu as MuiMenu, MenuItem } from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import api from "../api/api";
import TransferReceipt from "./TransferReceipt";
import ThemeToggle from "./ThemeToggle";

type ConnectionState =
  | "checking"
  | "online"
  | "slow"
  | "offline"
  | "server-unreachable";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("checking");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const [receiptTransfer, setReceiptTransfer] = useState<any | null>(null);
  const viewedNotificationIds = useRef(new Set<string>());
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const canManageChildren = ["SYSADMIN", "ADMIN", "STAFF"].includes(user?.role);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/weapon-search?field=product&q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  async function loadNotifications() {
    try {
      const [logsRes, transfersRes] = await Promise.all([
        api.get("/logs"),
        api.get("/inventory/transfer/incoming"),
      ]);
      const latest = logsRes.data
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);
      const transfers = transfersRes.data;

      setNotifications(latest);
      setIncomingTransfers(transfers);
      const notificationIds = [
        ...latest.map((log: any) => `log-${log.id}`),
        ...transfers.map((transfer: any) => `transfer-${transfer.id}`),
      ];
      setUnreadCount(
        notificationIds.filter((id) => !viewedNotificationIds.current.has(id))
          .length,
      );
      return { latest, transfers };
    } catch {
      return null;
    }
  }

  const respondToTransfer = async (id: number, accepted: boolean) => {
    try {
      await api.patch(`/inventory/transfer/${id}/respond`, { accepted });
      setIncomingTransfers((current) =>
        current.filter((transfer) => transfer.id !== id),
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể xử lý phiếu chuyển");
    }
  };

  const handleNotificationOpen = async (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setNotificationAnchor(event.currentTarget);
    const loaded = await loadNotifications();
    loaded?.latest.forEach((log: any) =>
      viewedNotificationIds.current.add(`log-${log.id}`),
    );
    loaded?.transfers.forEach((transfer: any) =>
      viewedNotificationIds.current.add(`transfer-${transfer.id}`),
    );
    setUnreadCount(0);
  };

  useEffect(() => {
    let active = true;
    let checking = false;

    const checkConnection = async () => {
      if (!navigator.onLine) {
        setConnectionState("offline");
        return;
      }
      if (checking) return;

      checking = true;
      const startedAt = performance.now();
      try {
        await api.get("/health", { timeout: 8000 });
        if (active) {
          setConnectionState(
            performance.now() - startedAt > 2500 ? "slow" : "online",
          );
        }
      } catch {
        if (active) {
          setConnectionState(
            navigator.onLine ? "server-unreachable" : "offline",
          );
        }
      } finally {
        checking = false;
      }
    };

    const handleOffline = () => setConnectionState("offline");
    const handleOnline = () => {
      setConnectionState("checking");
      void checkConnection();
    };

    void checkConnection();
    const intervalId = window.setInterval(checkConnection, 15000);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    void loadNotifications();
    const intervalId = window.setInterval(
      () => void loadNotifications(),
      10000,
    );
    return () => window.clearInterval(intervalId);
  }, []);

  const connectionStatus = {
    checking: {
      label: "Đang kiểm tra kết nối",
      color: "text-amber-300",
      dot: "bg-amber-300 animate-pulse",
      background: "bg-amber-400/[0.08]",
    },
    online: {
      label: "Hệ thống đang hoạt động",
      color: "text-emerald-300",
      dot: "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]",
      background: "bg-emerald-400/[0.08]",
    },
    slow: {
      label: "Mạng yếu, phản hồi chậm",
      color: "text-amber-300",
      dot: "bg-amber-300",
      background: "bg-amber-400/[0.08]",
    },
    offline: {
      label: "Mất kết nối mạng",
      color: "text-rose-300",
      dot: "bg-rose-400",
      background: "bg-rose-400/[0.08]",
    },
    "server-unreachable": {
      label: "Không kết nối được máy chủ",
      color: "text-rose-300",
      dot: "bg-rose-400",
      background: "bg-rose-400/[0.08]",
    },
  }[connectionState];

  const menuClass = ({ isActive }: { isActive: boolean }) => `
  group relative flex items-center ${collapsed ? "justify-center" : "gap-3"}
  rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200
  ${isActive ? "theme-nav-active" : "theme-nav-item"}
`;

  const navIconSize = collapsed ? 24 : 20;
  const displayName = user?.fullName || user?.username || "Người dùng";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}

      <aside
        className={`
    ${collapsed ? "w-[76px]" : "w-[276px]"}
    theme-chrome relative flex flex-col overflow-hidden border-r theme-chrome-divider
    px-3 shadow-2xl shadow-slate-950/20 transition-all duration-300
  `}
      >
        <div
          className={`theme-chrome-divider flex items-center ${collapsed ? "justify-center" : "justify-between"} border-b px-2 py-5`}
        >
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-300/20">
              <ShieldCheck size={22} strokeWidth={2.4} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="theme-chrome-accent mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  Hệ thống quản lý
                </p>
                <h2 className="theme-chrome-text truncate text-[14px] font-extrabold tracking-[0.12em]">
                  KHÍ TÀI - TRANG BỊ
                </h2>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Thu gọn thanh điều hướng"
              className="theme-chrome-control rounded-lg p-2 transition hover:text-current"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Mở rộng thanh điều hướng"
            className="theme-chrome-control mx-auto mt-4 rounded-lg p-2 transition hover:text-current"
          >
            <Menu size={19} />
          </button>
        )}

        {!collapsed && (
          <div className="mx-2 mt-5">
            <div
              role="status"
              aria-live="polite"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold ${connectionStatus.background} ${connectionStatus.color}`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${connectionStatus.dot}`}
              />
              {connectionStatus.label}
            </div>
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
          {!collapsed && (
            <p className="theme-chrome-muted px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em]">
              Điều hành
            </p>
          )}
          <NavLink to="/dashboard" className={menuClass}>
            <Home size={navIconSize} />
            {!collapsed && <span>Trang chủ</span>}
          </NavLink>
          <NavLink to="/weapon-search" className={menuClass}>
            <Search size={navIconSize} />
            {!collapsed && <span>Tra cứu khí tài</span>}
          </NavLink>

          <NavLink to="/products" className={menuClass}>
            <Shield size={navIconSize} />
            {!collapsed && <span>Thống kê vũ khí</span>}
          </NavLink>

          <div className="space-y-1">
            <NavLink to="/inventory" end className={menuClass}>
              <Warehouse size={navIconSize} />
              {!collapsed && <span>Nhập kho</span>}
            </NavLink>
            {!collapsed && (
              <div className="theme-chrome-divider ml-8 space-y-1 border-l pl-2">
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
              <Send size={navIconSize} />
              {!collapsed && <span>Xuất kho</span>}
            </NavLink>
            {!collapsed && (
              <div className="theme-chrome-divider ml-8 space-y-1 border-l pl-2">
                <NavLink to="/exports" end className={menuClass}>
                  <span>Khí tài, vũ khí</span>
                </NavLink>
                <NavLink to="/exports/ammunition" className={menuClass}>
                  <span>Đạn dược</span>
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/warehouses" className={menuClass}>
            <ListCheck size={navIconSize} />
            {!collapsed && <span>Danh sách kho</span>}
          </NavLink>
          <NavLink to="/broken-watching" className={menuClass}>
            <ClockAlert size={navIconSize} />
            {!collapsed && <span>Theo dõi hư hỏng - sửa chữa</span>}
          </NavLink>
          <NavLink to="/owners" className={menuClass}>
            <Users size={navIconSize} />
            {!collapsed && <span>Danh sách Quân nhân</span>}
          </NavLink>
          <NavLink to="/categories" className={menuClass}>
            <Tags size={navIconSize} />
            {!collapsed && <span>Thêm Danh mục</span>}
          </NavLink>
          <NavLink to="/registrations" className={menuClass}>
            <ClipboardList size={navIconSize} />
            {!collapsed && <span>Biên chế cá nhân</span>}
          </NavLink>
          <NavLink to="/logs" className={menuClass}>
            <Activity size={navIconSize} />
            {!collapsed && <span>Nhật ký hệ thống</span>}
          </NavLink>
          {canManageChildren && (
            <NavLink to="/child-accounts" className={menuClass}>
              <UserPlus size={navIconSize} />
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
        <div
          className={`theme-chrome-divider mt-auto border-t py-4 ${collapsed ? "px-1" : "px-2"}`}
        >
          <div
            className={`theme-chrome-profile flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl p-2.5`}
          >
            <div className="theme-chrome-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="theme-chrome-text truncate text-xs font-semibold">
                  {displayName}
                </p>
                <p className="theme-chrome-muted mt-0.5 truncate text-[10px] uppercase tracking-wider">
                  {user?.role || "Tài khoản"}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CONTENT */}

      <main
        className="
        flex-1
        min-w-0
        bg-slate-100
        overflow-auto
        "
      >
        <header className="theme-chrome theme-chrome-divider sticky top-0 z-40 flex min-h-16 items-center gap-4 border-b px-5 py-3 shadow-sm sm:px-8">
          <form
            onSubmit={handleSearch}
            className="flex w-44 shrink-0 gap-1.5 sm:w-64 lg:w-72"
          >
            <label className="theme-chrome-field flex min-w-0 flex-1 items-center rounded-lg border px-2.5 transition-colors focus-within:border-cyan-400">
              <Search size={16} className="theme-chrome-muted shrink-0" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm khí tài..."
                aria-label="Tìm kiếm khí tài"
                className="theme-chrome-text min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"
              />
            </label>
            <button
              type="submit"
              title="Tìm kiếm"
              aria-label="Tìm kiếm"
              disabled={!searchQuery.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              <Search size={17} />
            </button>
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Badge badgeContent={unreadCount} color="error" overlap="circular">
              <IconButton
                onClick={handleNotificationOpen}
                aria-label="Thông báo"
                className="theme-chrome-control border shadow-sm"
                sx={{ width: 42, height: 42 }}
              >
                <Bell size={21} />
              </IconButton>
            </Badge>
            <MuiMenu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={() => setNotificationAnchor(null)}
              slotProps={{
                paper: {
                  sx: {
                    width: 400,
                    maxHeight: 450,
                    mt: 1.5,
                    borderRadius: 2,
                    boxShadow: "0 10px 30px var(--color-shadow)",
                  },
                },
              }}
            >
              {notifications.length === 0 && incomingTransfers.length === 0 ? (
                <MenuItem className="text-slate-500">
                  Không có thông báo
                </MenuItem>
              ) : (
                <>
                  {incomingTransfers.map((transfer) => (
                    <MenuItem
                      key={`transfer-${transfer.id}`}
                      sx={{
                        whiteSpace: "normal",
                        alignItems: "flex-start",
                        py: 1.5,
                        borderBottom: 1,
                        borderColor: "divider",
                      }}
                    >
                      <div className="w-full">
                        <div className="font-semibold text-slate-800">
                          Yêu cầu xuất kho
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {transfer.fromUsername || "Tài khoản khác"} muốn xuất{" "}
                          {transfer.product?.name || "-"} đến tài khoản{" "}
                          {transfer.toUsername || "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Số hiệu: {transfer.productDetail?.serialNumber || "-"}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="rounded border border-blue-600 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50"
                            onClick={() => setReceiptTransfer(transfer)}
                          >
                            Xem phiếu xuất kho
                          </button>
                          <button
                            className="rounded bg-green-600 px-3 py-1 text-xs text-white"
                            onClick={() => respondToTransfer(transfer.id, true)}
                          >
                            Chấp nhận
                          </button>
                          <button
                            className="rounded bg-red-600 px-3 py-1 text-xs text-white"
                            onClick={() =>
                              respondToTransfer(transfer.id, false)
                            }
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>
                    </MenuItem>
                  ))}
                  {notifications.map((log) => (
                    <MenuItem
                      key={`log-${log.id}`}
                      sx={{
                        whiteSpace: "normal",
                        alignItems: "flex-start",
                        py: 1.5,
                        borderBottom: 1,
                        borderColor: "divider",
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                        <div>
                          <div className="font-semibold text-slate-800">
                            {log.action}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {log.detail}
                          </div>
                          <div className="mt-2 text-xs text-slate-400">
                            {new Date(log.createdAt).toLocaleString("vi-VN")}
                          </div>
                        </div>
                      </div>
                    </MenuItem>
                  ))}
                </>
              )}
              <MenuItem
                onClick={() => {
                  navigate("/logs");
                  setNotificationAnchor(null);
                }}
                sx={{
                  justifyContent: "center",
                  fontWeight: 600,
                  color: "primary.main",
                  py: 1.5,
                }}
              >
                Xem tất cả hoạt động
              </MenuItem>
            </MuiMenu>
            <button
              onClick={(event) => setUserAnchor(event.currentTarget)}
              aria-label="Mở menu tài khoản"
              className="theme-chrome-profile flex h-10 items-center gap-2 rounded-lg px-2.5 text-left shadow-sm transition sm:gap-3 sm:px-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                {initials}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="theme-chrome-text block max-w-32 truncate text-xs font-semibold">
                  {displayName}
                </span>
                <span className="theme-chrome-muted block max-w-32 truncate text-[10px]">
                  {user?.username || "Tài khoản"}
                </span>
              </span>
            </button>
            <MuiMenu
              anchorEl={userAnchor}
              open={Boolean(userAnchor)}
              onClose={() => setUserAnchor(null)}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    width: 220,
                    borderRadius: 2,
                    boxShadow: "0 10px 30px var(--color-shadow)",
                  },
                },
              }}
            >
              <MenuItem sx={{ gap: 2, py: 1.5 }}>
                <Shield size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm font-semibold">Quyền truy cập</p>
                  <p className="text-xs text-slate-500">
                    {user?.role || "USER"}
                  </p>
                </div>
              </MenuItem>
              {user?.role === "SYSADMIN" && (
                <MenuItem
                  onClick={() => {
                    navigate("/admin");
                    setUserAnchor(null);
                  }}
                  sx={{ gap: 2, py: 1.5 }}
                >
                  <ShieldCheck size={20} />
                  <span className="font-semibold">Trang Quản trị</span>
                </MenuItem>
              )}

              <MenuItem
                onClick={handleLogout}
                sx={{ gap: 2, py: 1.5, color: "error.main" }}
              >
                <LogOut size={20} />
                <span className="font-semibold">Đăng xuất</span>
              </MenuItem>
            </MuiMenu>
          </div>
        </header>
        <div className="px-5 pb-8 sm:px-8">
          <Outlet />
        </div>
      </main>
      {receiptTransfer && (
        <TransferReceipt
          transfer={receiptTransfer}
          onClose={() => setReceiptTransfer(null)}
        />
      )}
    </div>
  );
}
