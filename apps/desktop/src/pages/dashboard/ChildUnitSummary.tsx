import qbz95 from "../../assets/img-weapons-qbz95.webp";
import type { ChildProduct, ChildSummary } from "./types";

type Props = {
  children: ChildSummary[];
  selectedTenantId: number | null;
  onSelectTenant: (tenantId: number) => void;
};

type GroupedProducts = Record<
  string,
  {
    category: string;
    total: number;
    products: { name: string; quantity: number; image?: string | null }[];
  }
>;

function groupProducts(products: ChildProduct[]) {
  const grouped: GroupedProducts = {};

  products.forEach((product) => {
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
      image: product.image || null,
    });
    grouped[categoryName].total += quantity;
  });

  return Object.values(grouped);
}

export default function ChildUnitSummary({
  children,
  selectedTenantId,
  onSelectTenant,
}: Props) {
  const activeChild =
    children.find((child) => child.tenantId === selectedTenantId) || children[0];

  if (children.length === 0 || !activeChild) return null;

  const categories = groupProducts(activeChild.products);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-bold mb-6">
        Tổng quan vũ khí - khí tài các đơn vị
      </h2>
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {children.map((child) => (
          <button
            key={child.tenantId}
            type="button"
            onClick={() => onSelectTenant(child.tenantId)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              selectedTenantId === child.tenantId
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <h3 className="font-bold text-slate-800">
              {child.accounts.map((account) => account.username).join(", ")}
            </h3>
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-bold text-slate-800 text-2xl">
              {activeChild.accounts
                .map((account) => account.username)
                .join(", ")}
            </h1>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            {activeChild.totalWeapons}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Chi tiết số lượng vũ khí
        </p>
        <div className="mt-3 space-y-4">
          {categories.map((category) => (
            <div key={category.category}>
              <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-semibold text-slate-700">
                  {category.category}
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {category.total}
                </span>
              </div>
              <div className="space-y-2">
                {category.products.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || qbz95}
                        alt={product.name || "Ảnh vũ khí"}
                        className="h-8 w-12 rounded border border-slate-200 object-cover"
                      />
                      <span className="text-slate-600">{product.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">
                      {product.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}