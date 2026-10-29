import type { AmmunitionItem, AmmunitionType } from "./types";

type Props = {
  ammunition: AmmunitionItem[];
  types: AmmunitionType[];
  selectedType: string | null;
  onSelectType: (type: string) => void;
};

export default function AmmunitionSummary({
  ammunition,
  types,
  selectedType,
  onSelectType,
}: Props) {
  const activeType =
    types.find((type) => type.name === selectedType) || types[0];

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-slate-800">
        Thống kê đạn dược
      </h2>
      {ammunition.length === 0 ? (
        <p className="text-slate-500">Chưa có dữ liệu đạn dược.</p>
      ) : (
        <div className="grid min-h-64 grid-cols-1 overflow-hidden rounded-xl border border-slate-200 md:grid-cols-[220px_minmax(0,1fr)]">
          <div
            aria-label="Loại đạn"
            className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50 p-3 md:flex-col md:overflow-y-auto md:border-r md:border-b-0"
          >
            {types.map((type) => (
              <button
                key={type.name}
                type="button"
                onClick={() => onSelectType(type.name)}
                aria-pressed={(selectedType ?? types[0]?.name) === type.name}
                className={`flex min-w-44 items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors md:min-w-0 ${
                  (selectedType ?? types[0]?.name) === type.name
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-white hover:text-slate-800"
                }`}
              >
                <span className="truncate">{type.name}</span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {type.batches.length}
                </span>
              </button>
            ))}
          </div>
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-120 text-left text-sm">
              <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Lô</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Số lượng trong kho
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Năm SX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeType?.batches.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {item.batch || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {item.quantity} {item.unit || "viên"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {item.productionYear || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}