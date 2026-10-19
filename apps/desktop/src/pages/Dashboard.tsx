import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import DashboardActivity from "./dashboard/DashboardActivity";
import DashboardRepairTracking from "./dashboard/DashboardRepairTracking";
import DashboardRecentExports from "./dashboard/DashboardRecentExports";
import AmmunitionSummary from "./dashboard/AmmunitionSummary";
import ChildUnitSummary from "./dashboard/ChildUnitSummary";
import DashboardStats from "./dashboard/DashboardStats";
import DashboardWelcome from "./dashboard/DashboardWelcome";
import DashboardWeaponCommission from "./dashboard/DashboardWeaponCommission";
import WeaponSummary from "./dashboard/WeaponSummary";
import { useDashboardData } from "./dashboard/useDashboardData";

export default function Dashboard() {
  const dashboard = useDashboardData();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const scrollContainer = document.querySelector("main");
    if (!scrollContainer) return;

    const updateVisibility = () =>
      setShowScrollTop(scrollContainer.scrollTop > 240);

    updateVisibility();
    scrollContainer.addEventListener("scroll", updateVisibility, {
      passive: true,
    });

    return () =>
      scrollContainer.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <div className="space-y-8 pt-2">
      <DashboardWelcome />
      <DashboardStats stats={dashboard.stats} />
      <DashboardWeaponCommission categories={dashboard.weaponSummary} />
      <WeaponSummary
        categories={dashboard.weaponSummary}
        selectedCategory={dashboard.selectedWeaponCategory}
        onSelectCategory={dashboard.setSelectedWeaponCategory}
      />
      <AmmunitionSummary
        ammunition={dashboard.ammunition}
        types={dashboard.ammunitionTypes}
        selectedType={dashboard.selectedAmmunitionType}
        onSelectType={dashboard.setSelectedAmmunitionType}
      />
         <DashboardRecentExports />
      <ChildUnitSummary
        children={dashboard.childSummary}
        selectedTenantId={dashboard.selectedChildTenantId}
        onSelectTenant={dashboard.setSelectedChildTenantId}
      />
      <div className="grid grid-cols-2 gap-6">
        <DashboardActivity />
        <DashboardRepairTracking />
      </div>
      <div className="text-center text-[0.7rem] text-slate-500">
        <span>@ 2026 Quan Ly Khi Tai. All rights reserved.</span>
      </div>
      {showScrollTop && (
        <button
          type="button"
          aria-label="Cuộn lên đầu trang"
          title="Lên đầu trang"
          onClick={() =>
            document.querySelector("main")?.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shadow-lg border border-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer "
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}