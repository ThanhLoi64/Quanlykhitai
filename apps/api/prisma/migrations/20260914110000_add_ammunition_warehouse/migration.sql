ALTER TABLE "Ammunition"
ADD COLUMN "warehouseId" INTEGER;

ALTER TABLE "Ammunition"
ADD CONSTRAINT "Ammunition_warehouseId_fkey"
FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Ammunition_warehouseId_tenantId_idx"
ON "Ammunition"("warehouseId", "tenantId");