import { Link } from "react-router-dom";
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

export default function DashboardStats({ stats }: { stats: DashboardStat[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
      {stats.map((item, index) => {
        const Icon = item.icon;
        const colors = colorMap[item.color] || colorMap.blue;

        return (
          <Link key={`${item.path}-${item.title}-${index}`} to={item.path}>
            <div className="group relative overflow-hidden bg-white rounded-2xl border shadow-sm p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div
                className={`absolute top-0 left-0 h-1 w-full ${colors.line}`}
              />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    {item.title}
                  </p>
                  <h2 className={`text-4xl font-bold mt-3 ${colors.number}`}>
                    {item.value}
                  </h2>
                  <p className="text-xs text-slate-400 mt-2" />
                </div>
                <div
                  className={`${colors.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={32} className={colors.icon} />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}