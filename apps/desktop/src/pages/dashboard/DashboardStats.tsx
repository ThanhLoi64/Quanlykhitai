import { useNavigate } from "react-router-dom";
import type { DashboardStat } from "./types";

const colorMap: Record<string, { bg: string; icon: string; number: string; line: string }> = {
  green: {
    bg: "bg-green-100",
    icon: "text-green-600",
    number: "text-green-600",
    line: "bg-green-500",
  },
  blue: {
    bg: "bg-blue-100",
    icon: "text-blue-600",
    number: "text-blue-600",
    line: "bg-blue-500",
  },
  indigo: {
    bg: "bg-indigo-100",
    icon: "text-indigo-600",
    number: "text-indigo-600",
    line: "bg-indigo-500",
  },
  emerald: {
    bg: "bg-emerald-100",
    icon: "text-emerald-600",
    number: "text-emerald-600",
    line: "bg-emerald-500",
  },
  orange: {
    bg: "bg-orange-100",
    icon: "text-orange-600",
    number: "text-orange-600",
    line: "bg-orange-500",
  },
};

const statImages = [
  { keywords: ["vũ khí", "súng"], src: "/images/sung.jpg" },
  { keywords: ["trang bị", "balo"], src: "/images/balo.jpg" },
  { keywords: ["khí tài"], src: "/images/khitai.jpg" },
  { keywords: ["đạn", "ammunition"], src: "/images/dan.jpg" },
  { keywords: ["quân cụ"], src: "/images/kim.png" },
];

export default function DashboardStats({
  stats,
}: {
  stats: DashboardStat[];
}) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {stats.map((item, index) => {
        const Icon = item.icon;
        const colors = colorMap[item.color] || colorMap.blue;
        const normalizedTitle = item.title.trim().toLocaleLowerCase("vi");
        const image =
          statImages.find(({ keywords }) =>
            keywords.some((keyword) => normalizedTitle.includes(keyword)),
          )?.src ?? statImages[index]?.src ?? "/images/sung.jpg";

        return (
          <button
            key={`${item.path}-${item.title}-${index}`}
            type="button"
            onClick={() =>
              navigate(`/dashboard/category?category=${encodeURIComponent(item.title)}`)
            }
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <div className="relative h-40 overflow-hidden bg-slate-100">
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
              <div
                className={`${colors.bg} absolute right-4 top-4 rounded-xl p-3 shadow-md`}
              >
                <Icon size={24} className={colors.icon} />
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm font-semibold text-slate-500">
                {item.title}
              </p>
              <div className="mt-2 flex items-end justify-between">
                <span
                  className={`text-4xl font-bold tracking-tight ${colors.number}`}
                >
                  {item.value}
                </span>
                <div
                  className={`${colors.line} mb-2 h-1.5 w-12 rounded-full transition-all duration-300 group-hover:w-20`}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}