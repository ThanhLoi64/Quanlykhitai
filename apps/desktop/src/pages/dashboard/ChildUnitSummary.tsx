import type { ChildProduct, ChildSummary } from "./types";

type Props = {
  children: ChildSummary[];
  category: string;
};

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

export default function ChildUnitSummary({ children, category }: Props) {
  if (children.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">{category} theo đơn vị</h2>
        <p className="mt-3 text-sm text-slate-500">
          Không tìm thấy tài khoản con thuộc các đơn vị hiển thị.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">
        {category} theo đơn vị
      </h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {children.map((child) => {
          const products = child.products.filter((product) =>
            matchesCategory(product, category),
          );
          const total = products.reduce(
            (sum, product) => sum + product.details.length,
            0,
          );
          const accountNames = child.accounts
            .map((account) => account.username)
            .join(", ");

          return (
            <article
              key={child.tenantId}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-800">
                    {child.tenantName || accountNames || "Đơn vị"}
                  </h3>
                  {accountNames && (
                    <p className="mt-1 truncate text-sm text-slate-500">
                      Tài khoản: {accountNames}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                  {total}
                </span>
              </div>
              {products.length > 0 ? (
                <ul className="mt-4 divide-y divide-slate-200">
                  {products.map((product, index) => (
                    <li
                      key={`${product.category?.name}-${product.name}-${index}`}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="h-10 w-12 shrink-0 rounded-lg border border-slate-200 bg-white object-cover"
                          />
                        ) : (
                          <div className="h-10 w-12 shrink-0 rounded-lg bg-slate-200" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700">
                            {product.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {product.category?.name || category}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-slate-800">
                        {product.details.length}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-lg bg-white px-3 py-4 text-sm text-slate-500">
                  Đơn vị chưa có sản phẩm thuộc mục này.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}