
import { useEffect, useState } from "react";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Database,
    HardDrive,
    LockKeyhole,
    RefreshCw,
    Server,
    ShieldAlert,
    ShieldCheck,
    Tags,
    Users,
    UserRoundCheck,
    XCircle,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import api from "../api/api";

type ActivityEntry = {
    id: number;
    username: string;
    action: string;
    detail?: string | null;
    createdAt: string;
};

type AdminDashboardData = {
    metrics: {
        totalAccounts: number | null;
        activeAccounts: number | null;
        lockedAccounts: number | null;
        totalEquipment: number | null;
        totalCategories: number | null;
        businessRecords: number | null;
    };
    system: {
        api: string;
        database: string;
        databaseSizeBytes: string | null;
        databaseSizeLabel: string | null;
    };
    recentActivity: ActivityEntry[];
    securityEvents: ActivityEntry[];
};

const errorPattern = /error|failed|lỗi|thất bại|không thành công/i;

async function fetchAdminDashboard() {
    const response = await api.get<AdminDashboardData>("/admin/dashboard");
    return response.data;
}

function Metric({
    label,
    value,
    caption,
    icon: Icon,
    accent,
}: {
    label: string;
    value: number | null | undefined;
    caption: string;
    icon: typeof Users;
    accent: string;
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-3 text-3xl font-bold tabular-nums text-slate-900">
                        {value == null ? "--" : value.toLocaleString("vi-VN")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{caption}</p>
                </div>
                <span className={`rounded-lg p-2.5 ${accent}`}>
                    <Icon size={20} />
                </span>
            </div>
        </section>
    );
}

function SystemStatus({
    icon: Icon,
    label,
    detail,
    healthy,
}: {
    icon: typeof Server;
    label: string;
    detail: string;
    healthy: boolean | null;
}) {
    const StatusIcon = healthy ? CheckCircle2 : healthy === false ? XCircle : null;
    return (
        <div className="flex min-w-0 items-center gap-3 border-b border-slate-100 py-3 last:border-0">
            <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
                <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="truncate text-xs text-slate-500">{detail}</p>
            </div>
            <span
                className={`flex shrink-0 items-center gap-1.5 text-xs font-semibold ${healthy === null ? "text-slate-500" : healthy ? "text-emerald-700" : "text-rose-700"}`}
            >
                {StatusIcon && <StatusIcon size={15} />}
                {healthy === null ? "Đang kiểm tra" : healthy ? "Hoạt động" : "Có sự cố"}
            </span>
        </div>
    );
}

function ActivityList({
    entries,
    emptyMessage,
}: {
    entries: ActivityEntry[];
    emptyMessage: string;
}) {
    if (!entries.length) {
        return <p className="py-5 text-sm text-slate-500">{emptyMessage}</p>;
    }

    return (
        <div className="divide-y divide-slate-100">
            {entries.map((entry) => (
                <div key={entry.id} className="flex gap-3 py-3 first:pt-1 last:pb-1">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-400" />
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <p className="text-sm font-semibold text-slate-800">
                                {entry.action}
                            </p>
                            <time className="text-xs text-slate-500">
                                {new Date(entry.createdAt).toLocaleString("vi-VN")}
                            </time>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            {entry.username}
                            {entry.detail ? ` · ${entry.detail}` : ""}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AdminPage() {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

    const loadDashboard = async () => {
        setLoading(true);
        setError("");
        try {
            setData(await fetchAdminDashboard());
            setUpdatedAt(new Date());
        } catch {
            setError("Không thể tải dữ liệu quản trị. Vui lòng thử tải lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        fetchAdminDashboard()
            .then((dashboard) => {
                if (!active) return;
                setData(dashboard);
                setUpdatedAt(new Date());
            })
            .catch(() => {
                if (active) setError("Không thể tải dữ liệu quản trị. Vui lòng thử tải lại.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    if (currentUser?.role !== "SYSADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    const metrics = data?.metrics;
    const recentActivity = data?.recentActivity ?? [];
    const errorEvents = [
        ...recentActivity.filter((entry) =>
            errorPattern.test(`${entry.action} ${entry.detail ?? ""}`),
        ),
        ...(data?.system.database === "disconnected"
            ? [
                    {
                        id: -1,
                        username: "Hệ thống",
                        action: "Không kết nối được PostgreSQL",
                        detail: "Không truy vấn được trạng thái và dung lượng database.",
                        createdAt: new Date().toISOString(),
                    },
                ]
            : []),
    ];
    const securityEvents = data?.securityEvents ?? [];
    const databaseSize = data?.system.databaseSizeLabel ?? "Chưa xác định";

    return (
        <div className="space-y-6 py-6">
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                        Trung tâm điều hành
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900">
                        Tổng quan hệ thống
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Tình hình tài khoản, dữ liệu và hoạt động toàn hệ thống.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/admin/accounts" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800">
                        <Users size={17} /> Quản lý tài khoản
                    </Link>
                    {updatedAt && (
                        <span className="text-xs text-slate-500">
                            Cập nhật {updatedAt.toLocaleTimeString("vi-VN")}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => void loadDashboard()}
                        disabled={loading}
                        aria-label="Làm mới dữ liệu"
                        title="Làm mới dữ liệu"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </header>

            {error && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                >
                    <span className="flex items-center gap-2">
                        <AlertTriangle size={17} /> {error}
                    </span>
                    <button
                        type="button"
                        onClick={() => void loadDashboard()}
                        className="shrink-0 font-semibold underline underline-offset-2"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            <section aria-label="Chỉ số quản trị" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Metric label="Tổng tài khoản" value={metrics?.totalAccounts} caption="Tài khoản toàn hệ thống" icon={Users} accent="bg-blue-50 text-blue-700" />
                <Metric label="Đang hoạt động" value={metrics?.activeAccounts} caption="Có thể truy cập hệ thống" icon={UserRoundCheck} accent="bg-emerald-50 text-emerald-700" />
                <Metric label="Bị khóa / không hoạt động" value={metrics?.lockedAccounts} caption="Tài khoản không ở trạng thái hoạt động" icon={LockKeyhole} accent="bg-rose-50 text-rose-700" />
                <Metric label="Tổng số khí tài" value={metrics?.totalEquipment} caption="Hồ sơ khí tài theo từng số hiệu" icon={ShieldCheck} accent="bg-cyan-50 text-cyan-800" />
                <Metric label="Danh mục" value={metrics?.totalCategories} caption="Danh mục được khai báo" icon={Tags} accent="bg-amber-50 text-amber-800" />
                <Metric label="Bản ghi nghiệp vụ" value={metrics?.businessRecords} caption="Biên chế, điều chuyển và sửa chữa" icon={Activity} accent="bg-indigo-50 text-indigo-700" />
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                <div className="rounded-xl border border-slate-200 bg-white px-5 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 py-4">
                        <Server size={18} className="text-blue-700" />
                        <h2 className="font-semibold text-slate-900">Sức khỏe hệ thống</h2>
                    </div>
                    <SystemStatus
                        icon={Server}
                        label="API"
                        detail="Dịch vụ quản lý yêu cầu"
                        healthy={data ? data.system.api === "online" : null}
                    />
                    <SystemStatus
                        icon={Database}
                        label="PostgreSQL"
                        detail="Kết nối cơ sở dữ liệu"
                        healthy={data ? data.system.database === "connected" : null}
                    />
                    <SystemStatus
                        icon={HardDrive}
                        label="Dung lượng database đang dùng"
                        detail={databaseSize}
                        healthy={data ? Boolean(data.system.databaseSizeBytes) : null}
                    />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-5 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 py-4">
                        <Activity size={18} className="text-blue-700" />
                        <h2 className="font-semibold text-slate-900">Hoạt động gần đây</h2>
                    </div>
                    <div className="py-3">
                        <ActivityList
                            entries={recentActivity.slice(0, 6)}
                            emptyMessage={loading ? "Đang tải hoạt động..." : "Chưa có hoạt động được ghi nhận."}
                        />
                    </div>
                </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white px-5 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 py-4">
                        <AlertTriangle size={18} className="text-amber-700" />
                        <h2 className="font-semibold text-slate-900">Cảnh báo lỗi</h2>
                        <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                            {errorEvents.length}
                        </span>
                    </div>
                    <div className="py-3">
                        <ActivityList
                            entries={errorEvents}
                            emptyMessage={loading ? "Đang kiểm tra nhật ký..." : "Chưa ghi nhận cảnh báo lỗi trong nhật ký gần đây."}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-5 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 py-4">
                        <ShieldAlert size={18} className="text-rose-700" />
                        <h2 className="font-semibold text-slate-900">Sự kiện bảo mật</h2>
                        <span className="ml-auto rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-800">
                            {securityEvents.length}
                        </span>
                    </div>
                    <div className="py-3">
                        <ActivityList
                            entries={securityEvents}
                            emptyMessage={loading ? "Đang kiểm tra nhật ký..." : "Chưa ghi nhận sự kiện bảo mật trong nhật ký gần đây."}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}