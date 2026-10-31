import { useEffect, useMemo, useState } from "react";
import { Package } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/api";
import type {
  AmmunitionItem,
  AmmunitionType,
  ChildSummary,
  DashboardStat,
  WeaponCategory,
} from "./types";

type ProductPayload = {
  id: number;
  name: string;
  details: { status?: string | null }[];
  category?: { name?: string | null } | null;
  image?: string | null;
};

function isAmmunition(name: string, category?: string | null) {
  return /đạn|dan duoc|ammunition/i.test(`${name} ${category || ""}`);
}

export function useDashboardData() {
  const [products, setProducts] = useState(0);
  const [weaponSummary, setWeaponSummary] = useState<WeaponCategory[]>([]);
  const [selectedWeaponCategory, setSelectedWeaponCategory] = useState<
    string | null
  >(null);
  const [childSummary, setChildSummary] = useState<ChildSummary[]>([]);
  const [selectedChildTenantId, setSelectedChildTenantId] = useState<
    number | null
  >(null);
  const [ammunition, setAmmunition] = useState<AmmunitionItem[]>([]);
  const [selectedAmmunitionType, setSelectedAmmunitionType] = useState<
    string | null
  >(null);

  useEffect(() => {
    api
      .get("/auth/child-weapon-summary")
      .then((res) => {
        setChildSummary(res.data);
        setSelectedChildTenantId(
          (current) => current ?? res.data[0]?.tenantId ?? null,
        );
      })
      .catch(() => {
        setChildSummary([]);
        toast.error("Không thể tải danh sách tài khoản con");
      });

    api.get("/products").then((res) => {
      const data = res.data as ProductPayload[];
      setProducts(
        data.reduce(
          (total, product) =>
            total +
            (isAmmunition(product.name, product.category?.name)
              ? 0
              : product.details.length),
          0,
        ),
      );

      const grouped: Record<string, WeaponCategory> = {};

      data.forEach((product) => {
        if (isAmmunition(product.name, product.category?.name)) return;

        const categoryName = product.category?.name || "Khác";

        if (!grouped[categoryName]) {
          grouped[categoryName] = {
            category: categoryName,
            total: 0,
            issued: 0,
            inStock: 0,
            repair: 0,
            products: [],
          };
        }

        const quantity = product.details.length;
        const issued = product.details.filter(
          (detail) => detail.status === "ISSUED",
        ).length;
        const inStock = product.details.filter(
          (detail) =>
            detail.status === "IN_STOCK" || detail.status === "AVAILABLE",
        ).length;
        const repair = product.details.filter(
          (detail) => detail.status === "REPAIR",
        ).length;

        grouped[categoryName].products.push({
          id: product.id,
          name: product.name,
          quantity,
          issued,
          inStock,
          repair,
          image: product.image || null,
        });

        grouped[categoryName].total += quantity;
        grouped[categoryName].issued += issued;
        grouped[categoryName].inStock += inStock;
        grouped[categoryName].repair += repair;
      });

      setWeaponSummary(Object.values(grouped));
    });

    api
      .get("/ammunition")
      .then((res) => {
        setAmmunition(res.data);
        setSelectedAmmunitionType(
          (current) => current ?? res.data[0]?.product?.name ?? null,
        );
      })
      .catch(() => setAmmunition([]));
  }, []);

  const totalAmmunition = useMemo(
    () => [
      ...ammunition,
      ...childSummary.flatMap((child) => child.ammunition || []),
    ].reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [ammunition, childSummary],
  );

  const ammunitionTypes = useMemo<AmmunitionType[]>(() => {
    const grouped = new Map<string, AmmunitionItem[]>();

    ammunition.forEach((item) => {
      const typeName = item.product?.name || "-";
      const batches = grouped.get(typeName) || [];
      batches.push(item);
      grouped.set(typeName, batches);
    });

    return Array.from(grouped, ([name, batches]) => ({ name, batches }));
  }, [ammunition]);

  const stats = useMemo<DashboardStat[]>(() => {
    const palette = ["blue", "green", "indigo", "emerald", "orange"];
    const categoryTotals = new Map<string, { title: string; total: number }>();

    weaponSummary.forEach((category) => {
      const key = category.category.trim().toLocaleLowerCase("vi");
      const existing = categoryTotals.get(key);
      categoryTotals.set(key, {
        title: existing?.title || category.category,
        total: (existing?.total || 0) + category.total,
      });
    });

    childSummary.forEach((child) => {
      child.products.forEach((product) => {
        const categoryName = product.category?.name || "Khác";
        if (isAmmunition(product.name, categoryName)) return;

        const key = categoryName.trim().toLocaleLowerCase("vi");
        const existing = categoryTotals.get(key);
        categoryTotals.set(key, {
          title: existing?.title || categoryName,
          total:
            (existing?.total || 0) +
            (Array.isArray(product.details) ? product.details.length : 0),
        });
      });
    });

    const categoryCards =
      categoryTotals.size > 0
        ? Array.from(categoryTotals.values()).map((category, index) => ({
            title: category.title,
            value: category.total,
            path: "/products",
            icon: Package,
            color: palette[index % palette.length],
          }))
        : [
            {
              title: "Tổng khí tài",
              value:
                products +
                childSummary.reduce(
                  (sum, child) =>
                    sum +
                    child.products.reduce(
                      (productSum, product) =>
                        productSum +
                        (isAmmunition(
                          product.name,
                          product.category?.name,
                        )
                          ? 0
                          : Array.isArray(product.details)
                            ? product.details.length
                            : 0),
                      0,
                    ),
                  0,
                ),
              path: "/products",
              icon: Package,
              color: "blue",
            },
          ];

    const ammunitionCard = {
      title: "Đạn dược",
      value: totalAmmunition,
      path: "/inventory/ammunition",
      icon: Package,
      color: "orange",
    };
    const categoryOrder = ["vũ khí", "trang bị", "khí tài", "quân cụ"];
    const orderedCategories = [...categoryCards].sort((left, right) => {
      const leftIndex = categoryOrder.indexOf(
        left.title.trim().toLocaleLowerCase("vi"),
      );
      const rightIndex = categoryOrder.indexOf(
        right.title.trim().toLocaleLowerCase("vi"),
      );
      return (
        (leftIndex < 0 ? categoryOrder.length : leftIndex) -
        (rightIndex < 0 ? categoryOrder.length : rightIndex)
      );
    });

    return [
      ...orderedCategories.filter((category) =>
        ["vũ khí", "trang bị", "khí tài"].includes(
          category.title.trim().toLocaleLowerCase("vi"),
        ),
      ),
      ammunitionCard,
      ...orderedCategories.filter(
        (category) =>
          !["vũ khí", "trang bị", "khí tài"].includes(
            category.title.trim().toLocaleLowerCase("vi"),
          ),
      ),
    ];
  }, [weaponSummary, childSummary, products, totalAmmunition]);

  return {
    weaponSummary,
    selectedWeaponCategory,
    setSelectedWeaponCategory,
    childSummary,
    selectedChildTenantId,
    setSelectedChildTenantId,
    ammunition,
    ammunitionTypes,
    selectedAmmunitionType,
    setSelectedAmmunitionType,
    stats,
  };
}