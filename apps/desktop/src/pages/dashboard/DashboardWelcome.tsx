export default function DashboardWelcome() {
  return (
    <div
      className="
  relative
  overflow-hidden
  bg-linear-to-r
  from-slate-800
  to-slate-700
  rounded-2xl
  shadow-lg
  p-8
  text-white
  mb-8
  "
    >
      <div
        className="
    absolute
    right-0
    top-0
    w-72
    h-72
    bg-white/10
    rounded-full
    translate-x-20
    -translate-y-20
    "
      />
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-3">
          Tổng quan quản lý khí tài
        </h2>
        <p className="text-slate-200 max-w-3xl leading-7">
          Theo dõi dữ liệu, kiểm soát trang bị và quản lý danh mục tập trung. Mọi
          thông tin cần thiết được tổ chức rõ ràng, hỗ trợ tra cứu và cập nhật
          thuận tiện.
        </p>
        <div className="flex gap-4 mt-6" />
      </div>
    </div>
  );
}