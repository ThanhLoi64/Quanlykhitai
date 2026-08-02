import { useMemo } from "react";

export default function LoginStatus() {
  const user = useMemo(() => {
    const data = localStorage.getItem("user");

    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
        {user?.username?.charAt(0).toUpperCase() || "U"}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white italic">
          {user?.fullName || "Chưa đăng nhập"}
        </span>
        <span className="text-sm font-semibold text-white">
          {user?.username || "Chưa đăng nhập"}
        </span>

        {/* <span className="text-xs text-slate-400">
          {user?.role || "Người dùng"}
        </span> */}
      </div>
    </div>
  );
}
