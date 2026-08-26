import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { KeyRound, Plus, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import api from "../api/api";

const childRole: Record<string, string> = {
  SYSADMIN: "ADMIN",
  ADMIN: "STAFF",
  STAFF: "USER",
};

export default function ChildAccounts() {
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const nextRole = childRole[currentUser?.role || ""];
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({ username: "", fullName: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = async () => {
    try {
      const response = await api.get("/auth/child-accounts");
      setAccounts(response.data);
    } catch {
      toast.error("Không thể tải danh sách tài khoản con");
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!nextRole) return;
    setSubmitting(true);
    try {
      await api.post("/auth/child-accounts", form);
      toast.success(`Đã tạo tài khoản ${nextRole.toLowerCase()}`);
      setForm({ username: "", fullName: "", password: "" });
      await loadAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo tài khoản");
    } finally {
      setSubmitting(false);
    }
  };

  if (!nextRole) {
    return <div className="p-8 text-slate-600">Tài khoản USER không có cấp dưới.</div>;
  }

  return (
    <div className="space-y-8 pt-2">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Quản trị phân cấp</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">Tài khoản cấp dưới</h1>
        <p className="mt-2 text-slate-500">Tạo tài khoản <strong>{nextRole.toLowerCase()}</strong> thuộc tenant của bạn.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600"><UserPlus size={22} /></div>
            <div>
              <h2 className="font-bold text-slate-800">Tạo tài khoản mới</h2>
              <p className="text-sm text-slate-500">Cấp được tạo: {nextRole}</p>
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Tên đăng nhập
              <input required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
            </label>
            <label className="block text-sm font-medium text-slate-700">Họ và tên
              <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
            </label>
            <label className="block text-sm font-medium text-slate-700">Mật khẩu
              <input required minLength={6} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
            </label>
          </div>
          <button disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            <Plus size={18} /> {submitting ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </form>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600"><ShieldCheck size={22} /></div>
            <div><h2 className="font-bold text-slate-800">Tài khoản trong nhánh</h2><p className="text-sm text-slate-500">Chỉ xem thông tin, không thao tác dữ liệu của họ.</p></div>
          </div>
          <div className="divide-y divide-slate-100">
            {accounts.length === 0 && <p className="py-6 text-sm text-slate-500">Chưa có tài khoản cấp dưới.</p>}
            {accounts.map((account) => (
              <div key={account.username} className="flex items-center justify-between gap-4 py-4">
                <div><p className="font-semibold text-slate-800">{account.fullName}</p><p className="text-sm text-slate-500">@{account.username} · {account.tenantName}</p></div>
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"><KeyRound size={13} />{account.role}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}