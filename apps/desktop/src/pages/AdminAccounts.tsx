import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  KeyRound,
  LockKeyhole,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UnlockKeyhole,
  Users,
} from "lucide-react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/api";

type ManagedAccount = {
  id: number;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  expiresAt: string | null;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
  tenantId: number;
  tenant: { name: string };
};

type AccountsPage = {
  accounts: ManagedAccount[];
  total: number;
  page: number;
  pageSize: number;
  summary: { total: number; active: number; inactive: number; online: number; offline: number };
};

type Tenant = { id: number; name: string; parentId: number | null };
type LoginEvent = {
  id: number;
  action: string;
  detail: string | null;
  createdAt: string;
};

type AccountForm = {
  username: string;
  fullName: string;
  password: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  mustChangePassword: boolean;
  expiresAt: string;
};

const emptyForm: AccountForm = {
  username: "",
  fullName: "",
  password: "",
  role: "STAFF",
  tenantId: "",
  isActive: true,
  mustChangePassword: true,
  expiresAt: "",
};

const roles = ["SYSADMIN", "ADMIN", "STAFF"];
const onlineWindowMs = 2 * 60 * 1000;

async function fetchAdminAccounts(
  page: number,
  filters: { search: string; role: string; status: string; presence: string },
) {
  const response = await api.get<AccountsPage>("/admin/accounts", {
    params: {
      page,
      search: filters.search || undefined,
      role: filters.role === "all" ? undefined : filters.role,
      status: filters.status === "all" ? undefined : filters.status,
      presence: filters.presence === "all" ? undefined : filters.presence,
    },
  });
  return response.data;
}

function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("vi-VN") : "Chưa ghi nhận";
}

function isAccountOnline(account: ManagedAccount, now: number) {
  if (!account.isActive || (account.expiresAt && Date.parse(account.expiresAt) <= now)) {
    return false;
  }
  if (!account.lastActivityAt) return false;
  const lastActivity = Date.parse(account.lastActivityAt);
  return Number.isFinite(lastActivity) && now - lastActivity <= onlineWindowMs;
}

function errorMessage(error: unknown, fallback: string) {
  return (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message || fallback;
}

export default function AdminAccounts() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [summary, setSummary] = useState<AccountsPage["summary"]>({ total: 0, active: 0, inactive: 0, online: 0, offline: 0 });
  const [page, setPage] = useState(1);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [presenceFilter, setPresenceFilter] = useState("all");
  const [presenceNow, setPresenceNow] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedAccount | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [passwordTarget, setPasswordTarget] = useState<ManagedAccount | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [historyTarget, setHistoryTarget] = useState<ManagedAccount | null>(null);
  const [history, setHistory] = useState<LoginEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const result = await fetchAdminAccounts(page, {
        search: search.trim(),
        role: roleFilter,
        status: statusFilter,
        presence: presenceFilter,
      });
      setAccounts(result.accounts);
      setTotalAccounts(result.total);
      setSummary(result.summary);
      setPresenceNow(Date.now());
    } catch (error) {
      toast.error(errorMessage(error, "Không thể tải danh sách tài khoản"));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [page, presenceFilter, roleFilter, search, statusFilter]);

  useEffect(() => {
    let active = true;
    api.get<Tenant[]>("/admin/tenants")
      .then((response) => {
        if (active) setTenants(response.data);
      })
      .catch((error: unknown) => {
        if (active) toast.error(errorMessage(error, "Không thể tải danh sách đơn vị"));
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => void loadData(), 0);
    const intervalId = window.setInterval(() => void loadData(false), 30_000);
    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, tenantId: tenants[0] ? String(tenants[0].id) : "" });
    setEditorOpen(true);
  };

  const openEdit = (account: ManagedAccount) => {
    setEditing(account);
    setForm({
      username: account.username,
      fullName: account.fullName,
      password: "",
      role: account.role,
      tenantId: String(account.tenantId),
      isActive: account.isActive,
      mustChangePassword: account.mustChangePassword,
      expiresAt: localDateTime(account.expiresAt),
    });
    setEditorOpen(true);
  };

  const submitAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const expiresAt = form.expiresAt ? new Date(form.expiresAt).toISOString() : null;
    try {
      if (editing) {
        const invalidatesCurrentSession = editing.id === currentUser?.id && (
          editing.role !== form.role ||
          editing.isActive !== form.isActive ||
          editing.tenantId !== Number(form.tenantId) ||
          editing.mustChangePassword !== form.mustChangePassword ||
          localDateTime(editing.expiresAt) !== form.expiresAt
        );
        await api.patch(`/admin/accounts/${editing.id}`, {
          fullName: form.fullName,
          role: form.role,
          tenantId: Number(form.tenantId),
          isActive: form.isActive,
          mustChangePassword: form.mustChangePassword,
          expiresAt,
        });
        toast.success("Đã cập nhật tài khoản");
        if (editing.id === currentUser?.id) {
          if (invalidatesCurrentSession) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/", { replace: true });
            return;
          }
          localStorage.setItem("user", JSON.stringify({ ...currentUser, fullName: form.fullName }));
        }
      } else {
        await api.post("/admin/accounts", {
          username: form.username,
          fullName: form.fullName,
          password: form.password,
          role: form.role,
          tenantId: Number(form.tenantId),
          mustChangePassword: form.mustChangePassword,
          expiresAt,
        });
        toast.success("Đã tạo tài khoản");
      }
      setEditorOpen(false);
      await loadData();
    } catch (error) {
      toast.error(errorMessage(error, "Không thể lưu tài khoản"));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (account: ManagedAccount) => {
    const action = account.isActive ? "khóa" : "mở khóa";
    if (!window.confirm(`Bạn muốn ${action} tài khoản ${account.username}?`)) return;
    try {
      await api.patch(`/admin/accounts/${account.id}`, { isActive: !account.isActive });
      toast.success(`Đã ${action} tài khoản`);
      await loadData();
    } catch (error) {
      toast.error(errorMessage(error, `Không thể ${action} tài khoản`));
    }
  };

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordTarget) return;
    setSaving(true);
    try {
      await api.patch(`/admin/accounts/${passwordTarget.id}/password`, { password: newPassword });
      toast.success("Đã đặt lại mật khẩu; người dùng phải đổi mật khẩu khi đăng nhập");
      if (passwordTarget.id === currentUser?.id) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
        return;
      }
      setPasswordTarget(null);
      setNewPassword("");
      await loadData();
    } catch (error) {
      toast.error(errorMessage(error, "Không thể đặt lại mật khẩu"));
    } finally {
      setSaving(false);
    }
  };

  const revokeSessions = async (account: ManagedAccount) => {
    if (!window.confirm(`Thu hồi tất cả phiên đăng nhập của ${account.username}?`)) return;
    try {
      await api.post(`/admin/accounts/${account.id}/revoke-sessions`);
      if (account.id === currentUser?.id) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
        return;
      }
      toast.success("Đã thu hồi tất cả phiên đăng nhập");
    } catch (error) {
      toast.error(errorMessage(error, "Không thể thu hồi phiên đăng nhập"));
    }
  };

  const showHistory = async (account: ManagedAccount) => {
    setHistoryTarget(account);
    setHistory([]);
    setHistoryLoading(true);
    try {
      const response = await api.get<LoginEvent[]>(`/admin/accounts/${account.id}/login-history`);
      setHistory(response.data);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể tải lịch sử đăng nhập"));
    } finally {
      setHistoryLoading(false);
    }
  };

  if (currentUser?.role !== "SYSADMIN") return <Navigate to="/dashboard" replace />;

  const totalPages = Math.max(1, Math.ceil(totalAccounts / 10));
  const firstAccount = totalAccounts === 0 ? 0 : (page - 1) * 10 + 1;
  const lastAccount = Math.min(page * 10, totalAccounts);

  return (
    <div className="space-y-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Quản trị hệ thống</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Tài khoản toàn hệ thống</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý quyền truy cập, đơn vị, mật khẩu và phiên đăng nhập.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void loadData()} disabled={loading} title="Tải lại" aria-label="Tải lại danh sách" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
          <button type="button" onClick={openCreate} disabled={tenants.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
            <Plus size={17} /> Tạo tài khoản
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Tổng quan tài khoản">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Tổng tài khoản</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{summary.total.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Đang hoạt động</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.active.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Đang khóa / vô hiệu hóa</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">{summary.inactive.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Đang online</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.online.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Đang offline</p>
          <p className="mt-1 text-2xl font-bold text-slate-600">{summary.offline.toLocaleString("vi-VN")}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 border-b border-slate-200 p-4">
          <label className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-slate-300 px-3">
            <Search size={17} className="text-slate-400" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm tên, tài khoản, đơn vị" aria-label="Tìm tài khoản" className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
          <select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }} aria-label="Lọc theo vai trò" className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm">
            <option value="all">Tất cả vai trò</option>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            <option value="USER">USER</option>
          </select>
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} aria-label="Lọc theo tình trạng tài khoản" className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm">
            <option value="all">Mọi tình trạng tài khoản</option>
            <option value="active">Được phép đăng nhập</option>
            <option value="inactive">Đã khóa</option>
          </select>
          <select value={presenceFilter} onChange={(event) => { setPresenceFilter(event.target.value); setPage(1); }} aria-label="Lọc online hoặc offline" className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm">
            <option value="all">Online và offline</option>
            <option value="online">Đang online</option>
            <option value="offline">Đang offline</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Tài khoản</th>
                <th className="px-4 py-3 font-semibold">Vai trò / đơn vị</th>
                {/* <th className="px-4 py-3 font-semibold">Trạng thái</th> */}
                <th className="px-4 py-3 font-semibold">Trực tuyến</th>
                <th className="px-4 py-3 font-semibold">Đăng nhập gần nhất</th>
                <th className="px-4 py-3 font-semibold">Hoạt động gần nhất</th>
                <th className="px-4 py-3 font-semibold">Thời hạn</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((account) => (
                <tr key={account.id} className="align-top hover:bg-slate-50/70">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{account.fullName}</p>
                    <p className="mt-1 text-xs text-slate-500">@{account.username}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-700">{account.role}</p>
                    <p className="mt-1 text-xs text-slate-500">{account.tenant.name}</p>
                  </td>
                  {/* <td className="px-4 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${account.isActive ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                        {account.isActive ? "Hoạt động" : "Đã khóa"}
                      </span>
                      {account.mustChangePassword && <span className="text-xs font-medium text-amber-700">Cần đổi mật khẩu</span>}
                    </div>
                  </td> */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isAccountOnline(account, presenceNow) ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isAccountOnline(account, presenceNow) ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {isAccountOnline(account, presenceNow) ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600">{formatDate(account.lastLoginAt)}</td>
                  <td className="px-4 py-4 text-xs text-slate-600">{formatDate(account.lastActivityAt)}</td>
                  <td className="px-4 py-4 text-xs text-slate-600">{account.expiresAt ? formatDate(account.expiresAt) : "Không thời hạn"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => openEdit(account)} title="Sửa tài khoản" aria-label={`Sửa ${account.username}`} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-700"><Pencil size={17} /></button>
                      <button type="button" onClick={() => void toggleActive(account)} title={account.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"} aria-label={`${account.isActive ? "Khóa" : "Mở khóa"} ${account.username}`} className={`rounded-md p-2 ${account.isActive ? "text-slate-600 hover:bg-slate-100 hover:text-amber-700" : "text-rose-700 hover:bg-rose-50"}`}>{account.isActive ? <UnlockKeyhole size={17} /> : <LockKeyhole size={17} />}</button>
                      <button type="button" onClick={() => { setPasswordTarget(account); setNewPassword(""); }} title="Đặt lại mật khẩu" aria-label={`Đặt lại mật khẩu ${account.username}`} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-700"><KeyRound size={17} /></button>
                      <button type="button" onClick={() => void showHistory(account)} title="Lịch sử đăng nhập" aria-label={`Lịch sử đăng nhập ${account.username}`} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-700"><Clock3 size={17} /></button>
                      <button type="button" onClick={() => void revokeSessions(account)} title="Buộc đăng xuất mọi nơi" aria-label={`Thu hồi phiên ${account.username}`} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-rose-700"><LogOut size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && accounts.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">Không tìm thấy tài khoản phù hợp.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">Đang tải danh sách tài khoản...</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            Hiển thị {firstAccount.toLocaleString("vi-VN")}–{lastAccount.toLocaleString("vi-VN")} / {totalAccounts.toLocaleString("vi-VN")} tài khoản
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              aria-label="Trang trước"
              title="Trang trước"
              className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-24 text-center text-xs font-medium text-slate-600">
              Trang {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || loading}
              aria-label="Trang sau"
              title="Trang sau"
              className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <Dialog open={editorOpen} onClose={() => !saving && setEditorOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={submitAccount}>
          <DialogTitle className="flex items-center gap-2">
            {editing ? <Pencil size={18} /> : <UserPlusIcon />}
            {editing ? "Cập nhật tài khoản" : "Tạo tài khoản toàn hệ thống"}
          </DialogTitle>
          <DialogContent dividers>
            <div className="grid gap-4 sm:grid-cols-2">
              {!editing && <label className="text-sm font-medium text-slate-700">Tên đăng nhập<input required minLength={3} maxLength={100} autoComplete="off" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-600" /></label>}
              <label className="text-sm font-medium text-slate-700">Họ và tên<input required maxLength={150} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-600" /></label>
              {!editing && <label className="text-sm font-medium text-slate-700">Mật khẩu ban đầu<input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-600" /></label>}
              <label className="text-sm font-medium text-slate-700">Vai trò<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3">
                {form.role === "USER" && <option value="USER" disabled>USER (vai trò hiện tại)</option>}
                {roles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select></label>
              <label className="text-sm font-medium text-slate-700">Đơn vị<select required value={form.tenantId} onChange={(event) => setForm({ ...form, tenantId: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3">
                {tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}
              </select></label>
              <label className="text-sm font-medium text-slate-700">Hết hạn lúc (tùy chọn)<input type="datetime-local" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3" /></label>
            </div>
            <div className="mt-5 space-y-3">
              {editing && <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4 accent-blue-700" /> Tài khoản được phép đăng nhập</label>}
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.mustChangePassword} onChange={(event) => setForm({ ...form, mustChangePassword: event.target.checked })} className="h-4 w-4 accent-blue-700" /> Yêu cầu đổi mật khẩu khi đăng nhập tiếp theo</label>
            </div>
          </DialogContent>
          <DialogActions className="p-4">
            <button type="button" onClick={() => setEditorOpen(false)} disabled={saving} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button>
            <button type="submit" disabled={saving || tenants.length === 0} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo tài khoản"}</button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(passwordTarget)} onClose={() => !saving && setPasswordTarget(null)} fullWidth maxWidth="xs">
        <form onSubmit={submitPassword}>
          <DialogTitle className="flex items-center gap-2"><KeyRound size={18} /> Đặt lại mật khẩu</DialogTitle>
          <DialogContent dividers>
            <p className="mb-4 text-sm text-slate-600">Người dùng <strong>{passwordTarget?.username}</strong> sẽ phải đổi mật khẩu này khi đăng nhập.</p>
            <label className="text-sm font-medium text-slate-700">Mật khẩu mới<input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-600" /></label>
          </DialogContent>
          <DialogActions className="p-4">
            <button type="button" onClick={() => setPasswordTarget(null)} disabled={saving} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{saving ? "Đang cập nhật..." : "Đặt lại mật khẩu"}</button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(historyTarget)} onClose={() => setHistoryTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle className="flex items-center gap-2"><ShieldCheck size={18} /> Lịch sử đăng nhập · {historyTarget?.username}</DialogTitle>
        <DialogContent dividers>
          {historyLoading ? <p className="py-6 text-center text-sm text-slate-500">Đang tải lịch sử...</p> : history.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">Chưa có lịch sử đăng nhập.</p> : (
            <div className="divide-y divide-slate-100">
              {history.map((event) => (
                <div key={event.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div><p className={`text-sm font-semibold ${event.action === "Đăng nhập thành công" ? "text-emerald-700" : "text-rose-700"}`}>{event.action}</p><p className="mt-1 text-xs text-slate-500">{event.detail}</p></div>
                  <time className="shrink-0 text-xs text-slate-500">{formatDate(event.createdAt)}</time>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions className="p-4"><button type="button" onClick={() => setHistoryTarget(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Đóng</button></DialogActions>
      </Dialog>
    </div>
  );
}

function UserPlusIcon() {
  return <Users size={18} />;
}