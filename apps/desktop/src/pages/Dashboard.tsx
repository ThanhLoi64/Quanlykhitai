import { useEffect, useState } from "react";
import api from "../api/api";
import { Package, FolderOpen, User, Warehouse } from "lucide-react";

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
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [products, setProducts] = useState(0);
  const [categories, setCategories] = useState(0);
  const [owners, setOwners] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState(0);
  const [warehouseChart, setWarehouseChart] = useState<any[]>([]);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>

        <p className="text-slate-500 mt-2">
          Tổng quan hệ thống quản lý khí tài trang bị
        </p>
      </div>
      {/* Welcome */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-3">
          Chào mừng đến với hệ thống
        </h2>

        <p className="text-slate-600 leading-7">
          Hệ thống hỗ trợ quản lý khí tài, trang bị, danh mục và thông tin sử
          dụng. Bạn có thể theo dõi số lượng trang bị, quản lý danh mục và cập
          nhật dữ liệu nhanh chóng từ thanh điều hướng bên trái.
        </p>
      </div>
      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Link to="/products">
          <div
            className="bg-white rounded-xl shadow-sm border p-6
      cursor-pointer
      transition-all duration-200 ease-out
      hover:-translate-y-1 hover:shadow-lg
      active:translate-y-0 active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Tổng khí tài</p>

                <h2 className="text-4xl font-bold text-blue-600 mt-2">
                  {products}
                </h2>
              </div>

              <div className="bg-blue-100 p-4 rounded-full">
                <Package size={32} className="text-blue-600" />
              </div>
            </div>
          </div>
        </Link>
        <Link to="/categories">
          <div
            className="bg-white rounded-xl shadow-sm border p-6
      cursor-pointer
      transition-all duration-200 ease-out
      hover:-translate-y-1 hover:shadow-lg
      active:translate-y-0 active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Danh mục</p>

                <h2 className="text-4xl font-bold text-green-600 mt-2">
                  {categories}
                </h2>
              </div>

              <div className="bg-green-100 p-4 rounded-full">
                <FolderOpen size={32} className="text-green-600" />
              </div>
            </div>
          </div>
        </Link>
        <Link to="/owners">
          <div
            className="bg-white rounded-xl shadow-sm border p-6
      cursor-pointer
      transition-all duration-200 ease-out
      hover:-translate-y-1 hover:shadow-lg
      active:translate-y-0 active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Quân nhân</p>

                <h2 className="text-4xl font-bold text-green-600 mt-2">
                  {owners}
                </h2>
              </div>

              <div className="bg-green-100 p-4 rounded-full">
                <User size={32} className="text-green-600" />
              </div>
            </div>
          </div>
        </Link>
        <Link to="/inventory">
          <div
            className="bg-white rounded-xl shadow-sm border p-6
      cursor-pointer
      transition-all duration-200 ease-out
      hover:-translate-y-1 hover:shadow-lg
      active:translate-y-0 active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Vũ khí trong kho</p>

                <h2 className="text-4xl font-bold text-green-600 mt-2">
                  {inventory}
                </h2>
              </div>

              <div className="bg-green-100 p-4 rounded-full">
                <Warehouse size={32} className="text-green-600" />
              </div>
            </div>
          </div>
        </Link>
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
  <h2 className="text-xl font-bold mb-5">
    Tỷ lệ vũ khí theo đầu mối
  </h2>

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
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
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

            <span className="font-medium">
              {item.warehouseName}
            </span>

          </div>

          <span className="font-bold">
            {item.total}
          </span>

        </div>

      ))}
      <hr className="my-2" />
      <span className="font-bold">
        <span className="mr-2">Tổng:</span>
        <span>{warehouseChart.reduce((sum, item) => sum + item.total, 0)}</span>
      </span>

    </div>

  </div>
</div>
      </div>
    </div>
  );
}
