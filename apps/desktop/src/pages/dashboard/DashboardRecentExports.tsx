import { useEffect, useState } from "react";
import { ArrowUpRight, Eye } from "lucide-react";
import api from "../../api/api";
import TransferReceipt from "../../components/TransferReceipt";
import { Link } from "react-router-dom";
type TransferRecord = {
  id: number;
  status: string;
  ammunitionId?: number | null;
  productDetailId?: number | null;
  product?: { name?: string | null } | null;
  productDetail?: { serialNumber?: string | null } | null;
  ammunition?: { batch?: string | null } | null;
  createdAt: string;
};

type ExportListProps = {
  transfers: TransferRecord[];
  ammunition?: boolean;
};

function statusPresentation(status: string) {
  const states: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Chờ phê duyệt",
      className: "bg-amber-100 text-amber-800",
    },
    ACCEPTED: {
      label: "Đã phê duyệt",
      className: "bg-green-100 text-green-800",
    },
    REJECTED: {
      label: "Từ chối",
      className: "bg-red-100 text-red-800",
    },
  };

  return (
    states[status] || {
      label: status || "Không xác định",
      className: "bg-slate-100 text-slate-700",
    }
  );
}

function RecentExportList({ transfers, ammunition = false }: ExportListProps) {
  const [receipt, setReceipt] = useState<TransferRecord | null>(null);

  return (
    <>
      {transfers.length === 0 ? (
        <p className="py-4 text-sm text-slate-500">
          Chưa có phiếu xuất kho gần đây.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {transfers.map((transfer) => {
            const status = statusPresentation(transfer.status);
            const identifier = ammunition
              ? transfer.ammunition?.batch || "-"
              : transfer.productDetail?.serialNumber || "-";

            return (
              <div
                key={transfer.id}
                className="flex min-w-0 items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">
                    {transfer.product?.name || "Chưa xác định"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {ammunition ? "Số lô" : "Số hiệu"}: {identifier}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded px-2 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReceipt(transfer)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-blue-200 px-2.5 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <Eye size={16} />
                  Xem phiếu
                </button>
              </div>
            );
          })}
        </div>
      )}
      {receipt && (
        <TransferReceipt transfer={receipt} onClose={() => setReceipt(null)} />
      )}
    </>
  );
}

export function RecentWeaponExports({ transfers }: ExportListProps) {
  return (
    <section className="min-w-0 rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h2 className="mb-5 text-xl font-bold text-slate-800">
          Xuất kho vũ khí gần đây
        </h2>
        <Link
          to="/exports"
          aria-label="Mở trang Xuất kho đạn dược"
          title="Xem tất cả hồ sơ"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <RecentExportList transfers={transfers} />
    </section>
  );
}

export function RecentAmmunitionExports({ transfers }: ExportListProps) {
  return (
    <section className="min-w-0 rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h2 className="mb-5 text-xl font-bold text-slate-800">
          Xuất kho đạn dược gần đây
        </h2>
        <Link
          to="/exports/ammunition"
          aria-label="Mở trang Xuất kho đạn dược"
          title="Xem tất cả hồ sơ"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>

      <RecentExportList transfers={transfers} ammunition />
    </section>
  );
}

export default function DashboardRecentExports() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/inventory/transfer/outgoing")
      .then((res) => setTransfers(res.data))
      .catch(() => setTransfers([]))
      .finally(() => setLoading(false));
  }, []);

  const weaponTransfers = transfers
    .filter((transfer) => !transfer.ammunitionId)
    .slice(0, 3);
  const ammunitionTransfers = transfers
    .filter((transfer) => Boolean(transfer.ammunitionId))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-6">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-800">
            Xuất kho vũ khí gần đây
          </h2>
          <p className="text-sm text-slate-500">Đang tải phiếu...</p>
        </section>
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-800">
            Xuất kho đạn dược gần đây
          </h2>
          <p className="text-sm text-slate-500">Đang tải phiếu...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <RecentWeaponExports transfers={weaponTransfers} />
      <RecentAmmunitionExports transfers={ammunitionTransfers} />
    </div>
  );
}
