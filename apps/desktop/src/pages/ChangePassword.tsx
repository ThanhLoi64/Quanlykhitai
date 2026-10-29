import { useState, type FormEvent } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/api";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setSaving(true);
    try {
      const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Đã đổi mật khẩu");
      navigate(response.data.user.role === "SYSADMIN" ? "/admin" : "/dashboard", { replace: true });
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      toast.error(message || "Không thể đổi mật khẩu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-lg bg-blue-50 p-3 text-blue-700"><ShieldCheck size={22} /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Bảo mật tài khoản</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">Đổi mật khẩu</h1>
          </div>
        </div>
        <p className="mb-5 text-sm text-slate-600">Quản trị viên yêu cầu bạn đổi mật khẩu trước khi tiếp tục sử dụng hệ thống.</p>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Mật khẩu hiện tại
            <input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-600" />
          </label>
          <label className="block text-sm font-medium text-slate-700">Mật khẩu mới
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-600" />
          </label>
          <label className="block text-sm font-medium text-slate-700">Nhập lại mật khẩu mới
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-600" />
          </label>
        </div>
        <button type="submit" disabled={saving} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
          <KeyRound size={17} /> {saving ? "Đang cập nhật..." : "Đổi mật khẩu và tiếp tục"}
        </button>
      </form>
    </main>
  );
}