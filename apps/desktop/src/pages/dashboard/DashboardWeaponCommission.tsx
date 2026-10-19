import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  PackageCheck,
  Warehouse,
  Wrench,
} from "lucide-react";
import type { WeaponCategory } from "./types";
import { Link } from "react-router-dom";

const PAGE_SIZE = 5;
type CommissionStatus = "issued" | "inStock" | "repair";

export default function DashboardWeaponCommission({
  categories,
}: {
  categories: WeaponCategory[];
}) {
  const totals = categories.reduce(
    (summary, category) => ({
      total: summary.total + category.total,
      issued: summary.issued + category.issued,
      inStock: summary.inStock + category.inStock,
      repair: summary.repair + category.repair,
    }),
    { total: 0, issued: 0, inStock: 0, repair: 0 },
  );

  const products = categories.flatMap((category) =>
    category.products.map((product) => ({
      ...product,
      category: category.category,
    })),
  );
  const [page, setPage] = useState(0);
  const [selectedStatus, setSelectedStatus] =
    useState<CommissionStatus>("issued");
  const [selectedProductId, setSelectedProductId] = useState("all");

  const metrics = [
    {
      key: "issued",
      label: "Đã biên chế",
      value: totals.issued,
      icon: PackageCheck,
      color: "text-green-700 bg-green-50",
    },
    {
      key: "inStock",
      label: "Còn trong kho",
      value: totals.inStock,
      icon: Warehouse,
      color: "text-blue-700 bg-blue-50",
    },
    {
      key: "repair",
      label: "Đang sửa chữa",
      value: totals.repair,
      icon: Wrench,
      color: "text-orange-700 bg-orange-50",
    },
  ] as const;

  const selectedMetric = metrics.find(
    (metric) => metric.key === selectedStatus,
  );
  const filteredProducts = products.filter(
    (product) =>
      (selectedProductId === "all" ||
        String(product.id) === selectedProductId) &&
      product[selectedStatus] > 0,
  );
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleProducts = filteredProducts.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Thống kê biên chế vũ khí, khí tài
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Số lượng theo tình trạng hiện tại
          </p>
        </div>

        <Link
          to="/registrations"
          aria-label="Mở trang Xuất kho đạn dược"
          title="Xem tất cả hồ sơ"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y overflow-hidden rounded-lg border border-slate-200 md:grid-cols-3 md:divide-y-0">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className={`min-w-0 p-4 ${selectedStatus === metric.key ? "bg-slate-100" : ""}`}
            >
              <span
                className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${metric.color}`}
              >
                <Icon size={18} />
              </span>
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {metric.value.toLocaleString("vi-VN")}
              </p>
              <button
                type="button"
                aria-pressed={selectedStatus === metric.key}
                onClick={() => {
                  setSelectedStatus(metric.key);
                  setPage(0);
                }}
                className={`mt-3 text-sm font-semibold ${selectedStatus === metric.key ? "text-slate-500" : "text-blue-700 hover:text-blue-900"}`}
              >
                {selectedStatus === metric.key ? "Đang xem" : "Chi tiết"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-slate-800">
          Chi tiết: {selectedMetric?.label}
        </h3>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="shrink-0">Loại vũ khí</span>
          <select
            value={selectedProductId}
            onChange={(event) => {
              setSelectedProductId(event.target.value);
              setPage(0);
            }}
            className="min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">Tất cả loại</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Loại vũ khí, khí tài</th>
              <th className="px-4 py-3 text-right font-semibold">
                {selectedMetric?.label}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">{product.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {product.category}
                  </p>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  {product[selectedStatus]}
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Không có dữ liệu phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {filteredProducts.length === 0 ? 0 : currentPage * PAGE_SIZE + 1}-
          {Math.min((currentPage + 1) * PAGE_SIZE, filteredProducts.length)} /{" "}
          {filteredProducts.length} loại
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Trang trước"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={15} />
          </button>
          <span className="min-w-16 text-center text-xs text-slate-600">
            {currentPage + 1} / {pageCount}
          </span>
          <button
            type="button"
            aria-label="Trang sau"
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage(currentPage + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
