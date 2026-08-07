import { useEffect, useState } from "react";
import api from "../api/api";
import { Package, FolderOpen, User, Warehouse, Wrench } from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import LogComponent from "../components/LogComponent";
import { Bell } from "lucide-react";
import { Menu, MenuItem, Badge, IconButton } from "@mui/material";

export default function Dashboard() {
  const [products, setProducts] = useState(0);
  const [categories, setCategories] = useState(0);
  const [owners, setOwners] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState(0);
  const [repairs, setRepairs] = useState(0);
  const [warehouseChart, setWarehouseChart] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/products").then((res) => {
      const data = res.data;

      setProducts(data.length);

      // 5 sản phẩm mới nhất
      const latest = [...data]
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

      setLatestProducts(latest);

      // Biểu đồ
      const grouped: any = {};

      data.forEach((p: any) => {
        const category = p.category?.name || "Khác";

        grouped[category] = (grouped[category] || 0) + p.quantity;
      });

      setChartData(
        Object.keys(grouped).map((key) => ({
          category: key,
          quantity: grouped[key],
        })),
      );
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
    api.get("/inventory/warehouse-summary").then((res) => {
      setWarehouseChart(res.data);
    });
    api.get("/repairs").then((res) => {
      setRepairs(res.data.length);
    });
  }, []);

  const COLORS = [
    "#2563eb",
    "#16a34a",
    "#ea580c",
    "#9333ea",
    "#dc2626",
    "#0891b2",
    "#ca8a04",
  ];
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
      title: "Quân nhân",
      value: owners,
      path: "/owners",
      icon: User,
      color: "indigo",
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
  ];
  return (
    <div className="space-y-8 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Tổng quan hệ thống quản lý khí tài trang bị
          </p>
        </div>

        {/* Notification */}
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
                    >
                    </p>
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
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-5">
            Biểu đồ số lượng theo danh mục
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="category" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="quantity" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sản phẩm mới nhất */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-5">Khí tài mới nhất</h2>

          <div className="divide-y">
            {latestProducts.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-4"
              >
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>

                  <p className="text-sm text-slate-500">
                    {item.category?.name}
                  </p>
                </div>

                <span className="text-sm text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ cột ngang */}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-5">Vũ khí theo đầu mối</h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={warehouseChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis type="number" />

              <YAxis dataKey="warehouseName" type="category" width={90} />

              <Tooltip />

              <Bar dataKey="total" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ tròn */}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-5">Tỷ lệ vũ khí theo đầu mối</h2>

          <div className="flex items-center">
            <div className="w-2/3 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={warehouseChart}
                    dataKey="total"
                    nameKey="warehouseName"
                    outerRadius={110}
                    label={({ percent }) =>
                      `${((percent ?? 0) * 100).toFixed(1)}%`
                    }
                  >
                    {warehouseChart.map((_: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Chú thích */}

            <div className="w-1/3 space-y-3">
              {warehouseChart.map((item: any, index: number) => (
                <div
                  key={item.warehouseId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />

                    <span className="font-medium">{item.warehouseName}</span>
                  </div>

                  <span className="font-bold">{item.total}</span>
                </div>
              ))}
              <hr className="my-2" />
              <span className="font-bold">
                <span className="mr-2">Tổng:</span>
                <span>
                  {warehouseChart.reduce((sum, item) => sum + item.total, 0)}
                </span>
              </span>
            </div>
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
    </div>
  );
}
