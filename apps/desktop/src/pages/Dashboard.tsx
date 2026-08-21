import { useEffect, useState, useMemo } from "react";
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
import { Bell } from "lucide-react";
import { Menu, MenuItem, Badge, IconButton } from "@mui/material";

export default function Dashboard() {
  const [products, setProducts] = useState(0);
  const [categories, setCategories] = useState(0);
  const [owners, setOwners] = useState(0);
  const [inventory, setInventory] = useState(0);
  const [repairs, setRepairs] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const [weaponSummary, setWeaponSummary] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
  "category" | "stock" | "issued"
>("category");


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

    navigate("/login");
  };
  useEffect(() => {
   api.get("/products").then((res) => {
  const data = res.data;

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

  async function loadNotifications() {
    try {
      const res = await api.get("/logs");

      const latest = res.data
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

      setNotifications(latest);
    } catch {}
  }
  const handleOpen = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    await loadNotifications();
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
      <div className="flex items-center justify-between mb-8">
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
            badgeContent={notifications.length}
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
            {notifications.length === 0 ? (
              <MenuItem className="text-slate-500">Không có thông báo</MenuItem>
            ) : (
              notifications.map((log) => (
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
              ))
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ cột ngang */}

        <div className="bg-white rounded-xl shadow-sm border p-6">
  <h2 className="text-xl font-bold mb-6">
    Chi tiết số lượng vũ khí
  </h2>

  <div className="space-y-6">
    {weaponSummary.map((category: any) => (
      <div key={category.category}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-slate-800">
            {category.category}
          </h3>

          <span className="bg-blue-100 px-3 py-1 rounded-full text-sm font-semibold">
            {category.total}
          </span>
        </div>

        <div className="space-y-2">
          {category.products.map((product: any) => (
            <div
              key={product.name}
              className="flex items-center justify-between border-b pb-2"
            >
              <span className="text-slate-600">
                {product.name}
              </span>

              <span className="font-semibold">
                {product.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>

        {/* Biểu đồ tròn */}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-5"></h2>
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
    </div>
  );
}
