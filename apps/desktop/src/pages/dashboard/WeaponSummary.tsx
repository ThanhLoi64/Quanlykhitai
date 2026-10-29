import { Link } from "react-router-dom";
import qbz95 from "../../assets/img-weapons-qbz95.webp";
import type { WeaponCategory } from "./types";

type Props = {
  categories: WeaponCategory[];
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
};

export default function WeaponSummary({
  categories,
  selectedCategory,
  onSelectCategory,
}: Props) {
  const activeCategory =
    categories.find((category) => category.category === selectedCategory) ||
    categories[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="mb-6 text-xl font-bold">
          Chi tiết số lượng vũ khí hiện tại
        </h2>
        {categories.length > 0 && activeCategory && (
          <>
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
              {categories.map((category) => (
                <button
                  key={category.category}
                  type="button"
                  onClick={() => onSelectCategory(category.category)}
                  className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeCategory.category === category.category
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  {category.category}
                </button>
              ))}
            </div>
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-105 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tên khí tài</th>
                    <th className="w-56 px-4 py-3 text-right font-semibold">
                      Số lượng trong kho
                    </th>
                    <th className="w-40 px-4 py-3 text-center font-semibold">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCategory.products.map((product) => (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-slate-700">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || qbz95}
                            alt={product.name || "Ảnh vũ khí"}
                            className="h-10 w-14 rounded-lg border border-slate-200 object-cover"
                          />
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-800">
                        {product.quantity}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          to={`/products/${product.id}`}
                          className="inline-flex items-center rounded-md border border-blue-200 px-3 py-1.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-200 bg-blue-50/50">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Tổng số
                    </th>
                    <th className="px-4 py-3 text-right text-base font-bold text-blue-600">
                      {activeCategory.total}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}