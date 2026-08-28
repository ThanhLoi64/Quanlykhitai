import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  LockKeyhole,
  Shield,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import api from "../api/api";
import loginBg from "../assets/quandoi.avif";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function login() {
    if (!username.trim() || !password.trim()) {
      toast.error("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    const toastId = toast.loading("Đang đăng nhập...");

    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.dismiss(toastId);
      toast.success("Đăng nhập thành công");

      navigate("/dashboard");
    } catch (err: any) {
      toast.dismiss(toastId);

      if (!err.response) {
        toast.error(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.",
        );
        return;
      }

      const status = err.response.status;

      switch (status) {
        case 400:
          toast.error(
            err.response.data?.message || "Dữ liệu không hợp lệ.",
          );
          break;

        case 401:
          toast.error("Sai tên đăng nhập hoặc mật khẩu.");
          break;

        case 403:
          toast.error("Bạn không có quyền thực hiện thao tác này.");
          break;

        case 404:
          toast.error("Không tìm thấy máy chủ hoặc API.");
          break;

        case 500:
          toast.error(
            "Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.",
          );
          break;

        default:
          toast.error(
            err.response.data?.message ||
              "Đã xảy ra lỗi. Vui lòng thử lại.",
          );
      }
    }
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-slate-50 text-slate-900 md:flex-row">
      <div className="relative z-10 flex w-full items-center justify-center bg-[#fffafa] px-4 py-6 sm:px-6 md:w-[42%] md:px-8 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b42318] text-white shadow-[0_8px_20px_rgba(180,35,24,0.22)]">
              <Shield className="h-5 w-5" />
            </div>

            <div>
              <p className="text-base font-extrabold tracking-[0.02em] text-[#b42318]">
                QUẢN LÝ KHÍ TÀI
              </p>
              <p className="mt-0.5 text-[11px] tracking-[0.5px] text-slate-500">
                HỆ THỐNG QUẢN LÝ TRANG BỊ
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-slate-900 md:text-[2.1rem]">
              Chào mừng trở lại
            </h1>
            <p className="mt-2 text-[15px] text-slate-500">
              Đăng nhập vào hệ thống để tiếp tục.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Tên đăng nhập
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <UserRound className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Nhập tên đăng nhập"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#b42318] focus:outline-none focus:ring-2 focus:ring-[#b42318]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Mật khẩu
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      login();
                    }
                  }}
                  placeholder="Nhập mật khẩu"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#b42318] focus:outline-none focus:ring-2 focus:ring-[#b42318]/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 transition hover:text-slate-700"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={login}
              className="mt-1 flex h-[54px] w-full items-center justify-center rounded-2xl bg-[#b42318] text-base font-bold text-white shadow-[0_8px_20px_rgba(180,35,24,0.22)] transition hover:bg-[#8f1d14] hover:shadow-[0_10px_24px_rgba(180,35,24,0.28)]"
            >
              Đăng nhập
            </button>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#b42318]" />
            <p className="text-xs leading-6 text-slate-500">
              Thông tin đăng nhập được bảo mật. Vui lòng không chia sẻ tài khoản cho người khác.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            © 2026 Hệ thống quản lý khí tài
          </p>
        </div>
      </div>

      <div
        className="relative hidden min-h-[280px] flex-1 min-w-0 bg-cover bg-center bg-no-repeat md:block"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.15), rgba(15, 23, 42, 0.05)), url(${loginBg})`,
        }}
      >
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 md:p-8 lg:p-10">
          <h2 className="max-w-[600px] text-3xl font-extrabold leading-tight text-white md:text-[2rem] lg:text-[2.3rem]">
            Hệ thống quản lý
            <br />
            khí tài &amp; trang bị
          </h2>
          <p className="mt-3 max-w-[520px] text-sm leading-7 text-white/80 md:text-[15px]">
            Quản lý, theo dõi và kiểm soát trang bị một cách chính xác, an toàn và hiệu quả.
          </p>
        </div>
      </div>
    </div>
  );
}
