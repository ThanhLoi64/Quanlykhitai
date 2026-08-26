import { useEffect, useState, useMemo, useRef } from "react";
import api from "../api/api";
import {
  Package,
  FolderOpen,
  User,
  Warehouse,
  Wrench,
  LogOut,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LogComponent from "../components/LogComponent";
import TransferReceipt from "../components/TransferReceipt";
import { Bell } from "lucide-react";
import { Menu, MenuItem, Badge, IconButton } from "@mui/material";

type ChildProduct = {
  name: string;
  details: unknown[];
  category?: { name?: string } | null;
};

export default function Dashboard() {
  const [products, setProducts] = useState(0);
  const [categories, setCategories] = useState(0);
  const [owners, setOwners] = useState(0);
  const [inventory, setInventory] = useState(0);
  const [repairs, setRepairs] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const viewedNotificationIds = useRef(new Set<string>());
  const navigate = useNavigate();
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const [weaponSummary, setWeaponSummary] = useState<any[]>([]);
  const [childSummary, setChildSummary] = useState<any[]>([]);
  const [selectedChildTenantId, setSelectedChildTenantId] = useState<number | null>(null);
  const [receiptTransfer, setReceiptTransfer] = useState<any | null>(null);

  const user = useMemo(() => {
    const data = localStorage.getItem("user");

    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, []);

  const handleUserOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchor(event.currentTarget);
  };

  const handleUserClose = () => {
    setUserAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");

    navigate("/");
  };
  useEffect(() => {
    api.get("/auth/child-weapon-summary").then((res) => {
      setChildSummary(res.data);
      setSelectedChildTenantId((current) => current ?? res.data[0]?.tenantId ?? null);
    }).catch(() => setChildSummary([]));

    api.get("/products").then((res) => {
      const data = res.data;
      setProducts(data.length);

      const grouped: any = {};

      data.forEach((product: any) => {
        const categoryName = product.category?.name || "Khác";

        if (!grouped[categoryName]) {
          grouped[categoryName] = {
            category: categoryName,
            total: 0,
            products: [],
          };
        }

        const quantity = product.details.length;

        grouped[categoryName].products.push({
          name: product.name,
          quantity,
        });

        grouped[categoryName].total += quantity;
      });

      setWeaponSummary(Object.values(grouped));
    });

    api.get("/categories").then((res) => {
      setCategories(res.data.length);
    });

    api.get("/owners").then((res) => {
      setOwners(res.data.length);
    });
    api.get("/inventory").then((res) => {
      setInventory(res.data.length);
    });
    api.get("/repairs").then((res) => {
      setRepairs(res.data.length);
    });
  }, []);

  useEffect(() => {
    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

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

      setNotifications(latest);
      setIncomingTransfers(transfersRes.data);

      const notificationIds = [
        ...latest.map((log: any) => `log-${log.id}`),
        ...transfersRes.data.map((transfer: any) => `transfer-${transfer.id}`),
      ];
      setUnreadCount(
        notificationIds.filter((id) => !viewedNotificationIds.current.has(id)).length,
      );
      return { latest, transfers: transfersRes.data };
    } catch {}
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
  const handleOpen = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    const loaded = await loadNotifications();
    loaded?.latest.forEach((log: any) => viewedNotificationIds.current.add(`log-${log.id}`));
    loaded?.transfers.forEach((transfer: any) => viewedNotificationIds.current.add(`transfer-${transfer.id}`));
    setUnreadCount(0);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const stats = [
    {
      title: "Tổng khí tài",
      value: products,
      path: "/products",
      icon: Package,
      color: "blue",
    },
    {
      title: "Danh mục",
      value: categories,
      path: "/categories",
      icon: FolderOpen,
      color: "green",
    },
    {
      title: "Vũ khí trong kho",
      value: inventory,
      path: "/inventory",
      icon: Warehouse,
      color: "emerald",
    },
    {
      title: "Đang sửa chữa",
      value: repairs,
      path: "/broken-watching",
      icon: Wrench,
      color: "orange",
    },
    {
      title: "Quân nhân",
      value: owners,
      path: "/owners",
      icon: User,
      color: "indigo",
    },
  ];
  return (
    <div className="space-y-8 pt-2">
      {/* Header */}
      <div className="sticky top-0 z-40 -mx-8 bg-slate-100 px-8 pt-2 pb-1 flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Trang chủ
          </h1>

          <p className="text-slate-500 mt-2">
            Tổng quan hệ thống quản lý khí tài trang bị
          </p>
        </div>
        <div className="flex items-center justify-center mb-8">
          <Badge
            badgeContent={unreadCount}
            color="error"
            overlap="circular"
          >
            <IconButton
              onClick={handleOpen}
              className="bg-white shadow-sm border hover:bg-slate-50"
              sx={{
                width: 48,
                height: 48,
              }}
            >
              <Bell size={22} className="text-slate-700" />
            </IconButton>
          </Badge>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            slotProps={{
              paper: {
                sx: {
                  width: 400,
                  maxHeight: 450,
                  mt: 1.5,
                  borderRadius: 3,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                },
              },
            }}
          >
            {notifications.length === 0 && incomingTransfers.length === 0 ? (
              <MenuItem className="text-slate-500">Không có thông báo</MenuItem>
            ) : (
              <>
                {incomingTransfers.map((transfer) => (
                  <MenuItem
                    key={`transfer-${transfer.id}`}
                    sx={{
                      whiteSpace: "normal",
                      alignItems: "flex-start",
                      py: 1.5,
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <div className="w-full">
                      <div className="font-semibold text-slate-800">
                        Yêu cầu xuất kho
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {transfer.fromUsername || "Tài khoản khác"} muốn xuất {transfer.product?.name || "-"}
                        đến tài khoản {transfer.toUsername || "-"}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Số hiệu: {transfer.productDetail?.serialNumber || "-"}
                      </div>
                      <div className="flex gap-2 mt-3">
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
                          onClick={() => respondToTransfer(transfer.id, false)}
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </MenuItem>
                ))}
                {notifications.map((log) => (
                  <MenuItem
                    key={log.id}
                    sx={{
                      whiteSpace: "normal",
                      alignItems: "flex-start",
                      py: 1.5,
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <div className="flex gap-3">
                      <div
                        className="
              mt-1 
              w-2 
              h-2 
              rounded-full 
              bg-blue-600
              "
                      />

                      <div>
                        <div className="font-semibold text-slate-800">
                          {log.action}
                        </div>

                        <div className="text-sm text-slate-600 mt-1">
                          {log.detail}
                        </div>

                        <div className="text-xs text-slate-400 mt-2">
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
                handleClose();
              }}
              sx={{
                justifyContent: "center",
                fontWeight: "600",
                color: "#2563eb",
                py: 1.5,
              }}
            >
              Xem tất cả hoạt động
            </MenuItem>
          </Menu>
          {/* User Profile */}
          <div className="ml-4">
            <button
              onClick={handleUserOpen}
              className="
flex
items-center
gap-3
bg-white
border
rounded-xl
px-3
py-2
shadow-sm
hover:bg-slate-50
transition
"
            >
              <div
                className="
w-10
h-10
rounded-xl
bg-blue-600
text-white
flex
items-center
justify-center
font-bold
text-lg
"
              >
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="text-left">
                <p
                  className="
text-sm
font-semibold
text-slate-800
"
                >
                  {user?.fullName || "Chưa đăng nhập"}
                </p>

                <p
                  className="
text-xs
text-slate-500
"
                >
                  {user?.username || "Chưa đăng nhập"}
                </p>
              </div>
            </button>

            <Menu
              anchorEl={userAnchor}
              open={Boolean(userAnchor)}
              onClose={handleUserClose}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    width: 220,
                    borderRadius: 3,
                    boxShadow: "0 10px 30px rgba(0,0,0,.12)",
                  },
                },
              }}
            >
              <MenuItem
                sx={{
                  gap: 2,
                  py: 1.5,
                }}
              >
                <Shield size={20} className="text-blue-600" />

                <div>
                  <p
                    className="
text-sm
font-semibold
"
                  >
                    Quyền truy cập
                  </p>

                  <p
                    className="
text-xs
text-slate-500
"
                  >
                    {user?.role || "USER"}
                  </p>
                </div>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleLogout();
                }}
                sx={{
                  gap: 2,
                  py: 1.5,
                  color: "#dc2626",
                }}
              >
                <LogOut size={20} />

                <span
                  className="
font-semibold
"
                >
                  Đăng xuất
                </span>
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <div
        className="
  relative
  overflow-hidden
  bg-linear-to-r
  from-slate-800
  to-slate-700
  rounded-2xl
  shadow-lg
  p-8
  text-white
  mb-8
  "
      >
        {/* decoration */}
        <div
          className="
    absolute
    right-0
    top-0
    w-72
    h-72
    bg-white/10
    rounded-full
    translate-x-20
    -translate-y-20
    "
        />

        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-3">
            Chào mừng đến với hệ thống
          </h2>

          <p
            className="
      text-slate-200
      max-w-3xl
      leading-7
      "
          >
            Hệ thống hỗ trợ quản lý khí tài, trang bị, danh mục và thông tin sử
            dụng. Bạn có thể theo dõi số lượng trang bị, quản lý danh mục và cập
            nhật dữ liệu nhanh chóng từ thanh điều hướng bên trái.
          </p>

          <div className="flex gap-4 mt-6"></div>
        </div>
      </div>
      {/* Statistic Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        {stats.map((item) => {
          const Icon = item.icon;

          const colorMap: any = {
            blue: {
              bg: "bg-blue-100",
              icon: "text-blue-600",
              number: "text-blue-600",
              line: "bg-blue-500",
            },

            green: {
              bg: "bg-green-100",
              icon: "text-green-600",
              number: "text-green-600",
              line: "bg-green-500",
            },

            indigo: {
              bg: "bg-indigo-100",
              icon: "text-indigo-600",
              number: "text-indigo-600",
              line: "bg-indigo-500",
            },

            emerald: {
              bg: "bg-emerald-100",
              icon: "text-emerald-600",
              number: "text-emerald-600",
              line: "bg-emerald-500",
            },

            orange: {
              bg: "bg-orange-100",
              icon: "text-orange-600",
              number: "text-orange-600",
              line: "bg-orange-500",
            },
          };

          return (
            <Link key={item.path} to={item.path}>
              <div
                className="
group
relative
overflow-hidden
bg-white
rounded-2xl
border
shadow-sm
p-6

cursor-pointer

transition-all
duration-300

hover:-translate-y-1
hover:shadow-xl
"
              >
                {/* top line */}

                <div
                  className={`
absolute
top-0
left-0
h-1
w-full
${colorMap[item.color].line}
`}
                ></div>

                <div className="flex justify-between items-start">
                  <div>
                    <p
                      className="
text-sm
text-slate-500
font-medium
"
                    >
                      {item.title}
                    </p>

                    <h2
                      className={`
text-4xl
font-bold
mt-3
${colorMap[item.color].number}
`}
                    >
                      {item.value}
                    </h2>

                    <p
                      className="
text-xs
text-slate-400
mt-2
"
                    ></p>
                  </div>

                  <div
                    className={`
${colorMap[item.color].bg}
p-4
rounded-2xl

group-hover:scale-110

transition-transform
duration-300
`}
                  >
                    <Icon size={32} className={colorMap[item.color].icon} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ */}

        {/* Sản phẩm mới nhất */}
      </div>
      {childSummary.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-6">Tổng quan vũ khí - khí tài các đơn vị</h2>
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
            {childSummary.map((child: any) => (
              <button
                key={child.tenantId}
                onClick={() => setSelectedChildTenantId(child.tenantId)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  selectedChildTenantId === child.tenantId
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {/* {child.tenantName || child.accounts.map((account: any) => account.username).join(", ")} */}
                 <h3 className="font-bold text-slate-800">{child.accounts.map((account: any) => account.username).join(", ")}</h3>
              </button>
            ))}
          </div>
          {(() => {
            const child = childSummary.find((item: any) => item.tenantId === selectedChildTenantId) || childSummary[0];

            if (!child) return null;

            return (
              <div className="mt-5 rounded-xl border border-slate-200 p-5">
                {(() => {
                  const grouped: Record<string, { category: string; total: number; products: { name: string; quantity: number }[] }> = {};

                  child.products.forEach((product: ChildProduct) => {
                    const categoryName = product.category?.name || "Khác";

                    if (!grouped[categoryName]) {
                      grouped[categoryName] = { category: categoryName, total: 0, products: [] };
                    }

                    const quantity = product.details.length;
                    grouped[categoryName].products.push({ name: product.name, quantity });
                    grouped[categoryName].total += quantity;
                  });

                  return (
                    <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="font-bold text-slate-800 text-2xl">{child.accounts.map((account: any) => account.username).join(", ")}</h1>
                    {/* <p className="mt-1 text-sm text-slate-500">
                      {child.accounts.map((account: any) => account.username).join(", ")}
                    </p> */}
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{child.totalWeapons}</span>
        
                </div>
                <p className="mt-3 text-sm text-slate-500">Chi tiết số lượng vũ khí</p>
                <div className="mt-3 space-y-4">
                  {Object.values(grouped).map((category) => (
                    <div key={category.category}>
                      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-sm font-semibold text-slate-700">{category.category}</span>
                        <span className="text-sm font-bold text-blue-600">{category.total}</span>
                      </div>
                      <div className="space-y-2">
                        {category.products.map((product) => (
                          <div key={product.name} className="flex justify-between text-sm">
                            <span className="text-slate-600">{product.name}</span>
                            <span className="font-semibold text-slate-800">{product.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                    </>
                  );
                })()}
              </div>          
            );
          })()}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Biểu đồ cột ngang */}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-6">Chi tiết số lượng vũ khí hiện tại</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {weaponSummary.slice(0, 3).map((category: any) => (
              <div
                key={category.category}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm "
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      Danh mục
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-800">
                      {category.category}
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    📦
                  </div>
                </div>

                {/* Total */}
                <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Tổng số</span>

                    <span className="text-xl font-bold text-blue-600">
                      {category.total}
                    </span>
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-3">
                  {category.products.map((product: any) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-slate-50"
                    >
                      <span className="text-sm text-slate-600">
                        {product.name}
                      </span>

                      <span className="min-w-[40px] rounded-lg bg-slate-100 px-2 py-1 text-center text-sm font-semibold text-slate-700">
                        {product.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <button className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <LogComponent />
      </div>
      <div className=" text-center text-[0.7rem] text-slate-500 ">
        <span>
          <span> @ 2026 Quan Ly Khi Tai. All rights reserved.</span>
        </span>
      </div>

      {receiptTransfer && (
        <TransferReceipt
          transfer={receiptTransfer}
          onClose={() => setReceiptTransfer(null)}
        />
      )}
    </div>
  );
}
