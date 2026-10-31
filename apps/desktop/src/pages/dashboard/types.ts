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
  id?: number;
  name: string;
  unit?: string | null;
  classification?: string | null;
  quantity?: number;
  storageLocation?: string | null;
  note?: string | null;
  origin?: string | null;
  usageHistory?: string | null;
  documents?: string | null;
  imageFileId?: string | null;
  categoryId?: number;
  tenantId?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  details: ProductDetailSummary[];
  category?: { name?: string | null } | null;
  image?: string | null;
};

export type ProductDetailSummary = {
  id: number;
  productId: number;
  ownerId?: number | null;
  ownerName?: string | null;
  position?: string | null;
  serialNumber?: string | null;
  level?: string | null;
  accessory?: string | null;
  equipment?: string | null;
  status?: string | null;
  militaryEquipment?: string | null;
  importOrder?: string | null;
  receivedDate?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  warehouseId?: number | null;
  tenantId?: number;
  owner?: {
    fullName?: string | null;
    name?: string | null;
    position?: string | null;
    department?: string | null;
  } | null;
  warehouse?: { name?: string | null } | null;
};

export type ChildSummary = {
  tenantId: number;
  tenantName?: string;
  totalWeapons: number;
  accounts: { username: string }[];
  products: ChildProduct[];
  ammunition?: AmmunitionItem[];
};

export type AmmunitionItem = {
  id: number;
  quantity: number;
  unit?: string | null;
  batch?: string | null;
  productionYear?: number | null;
  product?: {
    name?: string | null;
    category?: { name?: string | null } | null;
  } | null;
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