export type WeaponProduct = {
  id: number;
  name: string;
  quantity: number;
  issued: number;
  inStock: number;
  repair: number;
  image?: string | null;
};

export type WeaponCategory = {
  category: string;
  total: number;
  issued: number;
  inStock: number;
  repair: number;
  products: WeaponProduct[];
};

export type ChildProduct = {
  name: string;
  details: unknown[];
  category?: { name?: string } | null;
  image?: string | null;
};

export type ChildSummary = {
  tenantId: number;
  tenantName?: string;
  totalWeapons: number;
  accounts: { username: string }[];
  products: ChildProduct[];
};

export type AmmunitionItem = {
  id: number;
  quantity: number;
  unit?: string | null;
  batch?: string | null;
  productionYear?: number | null;
  product?: { name?: string | null } | null;
};

export type AmmunitionType = {
  name: string;
  batches: AmmunitionItem[];
};

export type DashboardStat = {
  title: string;
  value: number;
  path: string;
  icon: typeof import("lucide-react").Package;
  color: string;
};