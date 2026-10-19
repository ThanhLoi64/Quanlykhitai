import { useEffect, useState } from "react";
import { ArrowUpRight, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/api";

type RepairRecord = {
  id: number;
  cause?: string | null;
  severity?: string | null;
  repairStartDate?: string | null;
  createdAt: string;
  productDetail?: {
    serialNumber?: string | null;
    product?: { name?: string | null } | null;
  } | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function severityClass(severity: string) {
  const colors: Record<string, string> = {
    thấp: "bg-green-100 text-green-800",
    "trung bình": "bg-yellow-100 text-yellow-800",
    cao: "bg-orange-100 text-orange-800",
    "cực cao": "bg-red-100 text-red-800",
  };

  return colors[severity.trim().toLocaleLowerCase("vi")] || "bg-slate-100 text-slate-600";
}

export default function DashboardRepairTracking() {
  const [repairs, setRepairs] = useState<RepairRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/repairs")
      .then((res) => setRepairs(res.data.slice(0, 3)))
      .catch(() => setRepairs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            THÔNG TIN HỒ SƠ HƯ HỎNG VÀ SỬA CHỮA
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Hồ sơ sửa chữa mới nhất
          </p>
        </div>
        <Link
          to="/broken-watching"
          aria-label="Mở trang theo dõi hư hỏng và sửa chữa"
          title="Xem tất cả hồ sơ"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {loading ? (
        <p className="py-4 text-sm text-slate-500">Đang tải hồ sơ...</p>
      ) : repairs.length === 0 ? (
        <p className="py-4 text-sm text-slate-500">
          Chưa có hồ sơ hư hỏng, sửa chữa.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {repairs.map((repair) => (
            <div key={repair.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <Wrench size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <p className="truncate font-semibold text-slate-800">
                    {repair.productDetail?.product?.name || "Khí tài chưa xác định"}
                  </p>
                  <time className="shrink-0 text-xs text-slate-500">
                    {formatDate(repair.repairStartDate || repair.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Số hiệu: {repair.productDetail?.serialNumber || "-"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {repair.cause && (
                    <span className="rounded bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                      {repair.cause}
                    </span>
                  )}
                  {repair.severity && (
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${severityClass(repair.severity)}`}
                    >
                      Mức độ: {repair.severity}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}