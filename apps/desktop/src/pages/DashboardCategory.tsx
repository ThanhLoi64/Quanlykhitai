import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, Package } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/api";
import type {
  AmmunitionItem,
  ChildProduct,
  ChildSummary,
} from "./dashboard/types";

type CurrentUser = {
  id?: number;
  username?: string;
  fullName?: string;
  tenantId?: number;
};

type ProductPayload = {
  id: number;
} & ChildProduct;

type UnitSummary = {
  id: string;
  name: string;
  accounts: string[];
  products: ChildProduct[];
  ammunition: AmmunitionItem[];
};

function getCurrentUser(): CurrentUser {
  try {
    return JSON.parse(localStorage.getItem("user") || "null") as CurrentUser;
  } catch {
    return {};
  }
}

function matchesCategory(product: ChildProduct, selectedCategory: string) {
  const category = product.category?.name?.trim().toLocaleLowerCase("vi") || "";
  const name = product.name.trim().toLocaleLowerCase("vi");
  const selected = selectedCategory.trim().toLocaleLowerCase("vi");

  if (selected === "tổng khí tài") return true;
  if (selected.includes("đạn")) {
    return /đạn|dan duoc|ammunition/.test(`${category} ${name}`);
  }

  return category === selected || category.includes(selected);
}

function isAmmunitionCategory(category: string) {
  return /đạn|ammunition/i.test(category);
}

export default function DashboardCategory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get("category")?.trim() || "";
  const [currentUser] = useState(getCurrentUser);
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [currentProducts, setCurrentProducts] = useState<ChildProduct[]>([]);
  const [currentAmmunition, setCurrentAmmunition] = useState<AmmunitionItem[]>(
    [],
  );
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      api.get<ChildSummary[]>("/auth/child-weapon-summary"),
      api.get<ProductPayload[]>("/products"),
      api.get<AmmunitionItem[]>("/ammunition"),
    ])
      .then(([childrenResponse, productsResponse, ammunitionResponse]) => {
        if (!active) return;
        setChildren(childrenResponse.data);
        setCurrentProducts(
          productsResponse.data.map((product) => ({
            ...product,
            name: product.name,
            details: Array.isArray(product.details) ? product.details : [],
            category: product.category,
            image: product.image,
          })),
        );
        setCurrentAmmunition(ammunitionResponse.data);
      })
      .catch(() => {
        if (active) {
          setLoadError(true);
          toast.error("Không thể tải dữ liệu thống kê theo đơn vị");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const units = useMemo<UnitSummary[]>(() => {
    const currentUnit: UnitSummary = {
      id: `current-${currentUser.tenantId ?? currentUser.id ?? "user"}`,
      name: "Tài khoản hiện tại",
      accounts: [currentUser.fullName || currentUser.username || "Đang đăng nhập"],
      products: currentProducts,
      ammunition: currentAmmunition,
    };
    const childUnits = children.map((child) => ({
      id: String(child.tenantId),
      name: child.tenantName || `Đơn vị ${child.tenantId}`,
      accounts: child.accounts.map((account) => account.username),
      products: child.products,
      ammunition: child.ammunition || [],
    }));

    return [currentUnit, ...childUnits];
  }, [children, currentAmmunition, currentProducts, currentUser]);

  const selectedUnit =
    units.find((unit) => unit.id === selectedUnitId) ?? units[0];
  const activeUnitId = selectedUnit?.id ?? "";
  const ammunitionCategory = isAmmunitionCategory(category);
  const filteredProducts = ammunitionCategory
    ? []
    : selectedUnit?.products.filter((product) =>
        matchesCategory(product, category),
      ) ?? [];
  const filteredAmmunition = ammunitionCategory
    ? selectedUnit?.ammunition ?? []
    : [];
  const total = ammunitionCategory
    ? filteredAmmunition.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0,
      )
    : filteredProducts.reduce(
        (sum, product) => sum + product.details.length,
        0,
      );

  if (!category) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-700">Chưa chọn danh mục thống kê.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft size={16} />
          Quay lại tổng quan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-1 *:pt-2 mt-2">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700 border border-slate-300 hover:border-blue-700  rounded-xl px-3 py-1.5"
      >
        <ArrowLeft size={17} />
        Quay lại tổng quan
      </Link>

      <div>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">THỐNG KÊ THEO DANH MỤC: {category}</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Đang tải dữ liệu đơn vị...
            </p>
          ) : loadError ? (
            <p className="py-12 text-center text-sm text-red-600">
              Không thể tải dữ liệu. Vui lòng quay lại và thử mở trang này lần nữa.
            </p>
          ) : selectedUnit ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {selectedUnit.name}
                  </h2>
                  {selectedUnit.accounts.length > 0 && (
                    <p className="mt-1 text-sm text-slate-500">
                      Tài khoản: {selectedUnit.accounts.join(", ")}
                    </p>
                  )}
                </div>
                <div className="rounded-xl bg-blue-50 px-4 py-2 text-right">
                  <p className="text-xs font-medium text-blue-700">
                    Tổng số lượng
                  </p>
                  <p className="text-2xl font-bold text-blue-800">{total}</p>
                </div>
              </div>

              {filteredAmmunition.length > 0 ? (
                <ul className="mt-2 divide-y divide-slate-100">
                  {filteredAmmunition.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {item.product?.name || "Loại đạn"}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          Lô {item.batch || "—"}
                          {item.productionYear
                            ? ` · Năm ${item.productionYear}`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                        {item.quantity} {item.unit || "viên"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : filteredProducts.length > 0 ? (
                <ul className="mt-2 divide-y divide-slate-100">
                  {filteredProducts.map((product, index) => (
                    <li
                      key={`${product.category?.name}-${product.name}-${index}`}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="h-12 w-14 shrink-0 rounded-lg border border-slate-200 object-cover"
                          />
                        ) : (
                          <span className="flex h-12 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                            <Package size={20} />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {product.category?.name || category}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                        {product.details.length}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/products/${product.id}`, {
                            state: { product },
                          })
                        }
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        <Eye size={16} />
                        Xem chi tiết
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-14 text-center">
                  <Package className="mx-auto text-slate-300" size={32} />
                  <p className="mt-3 text-sm text-slate-500">
                    Đơn vị này chưa có sản phẩm thuộc mục {category}.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">
              Không tìm thấy dữ liệu đơn vị.
            </p>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="px-2 pb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            Chọn đơn vị
          </h2>
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {units.map((unit) => {
              const isSelected = activeUnitId === unit.id;
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => setSelectedUnitId(unit.id)}
                  aria-pressed={isSelected}
                  className={`min-w-48 rounded-xl border px-4 py-3 text-left transition-colors lg:min-w-0 ${
                    isSelected
                      ? "border-blue-200 bg-blue-50 text-blue-800"
                      : "border-transparent text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="block truncate text-sm font-semibold">
                    {unit.accounts.join(", ") || "Chưa có tài khoản"}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

    </div>
  );
}
