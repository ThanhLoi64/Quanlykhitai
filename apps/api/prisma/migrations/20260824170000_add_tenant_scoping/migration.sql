-- Convert the former per-database routing key to a tenant id.
ALTER TABLE "User" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
UPDATE "User" SET "tenantId" = 2 WHERE "databaseKey" = 'testuser';
ALTER TABLE "User" DROP COLUMN "databaseKey";

ALTER TABLE "Category" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Product" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Registration" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Owner" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ProductDetail" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "RepairRecord" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Warehouse" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "AppLog" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_name_key";
ALTER TABLE "Warehouse" DROP CONSTRAINT IF EXISTS "Warehouse_name_key";

CREATE UNIQUE INDEX "Category_tenantId_name_key" ON "Category"("tenantId", "name");
CREATE UNIQUE INDEX "Warehouse_tenantId_name_key" ON "Warehouse"("tenantId", "name");
CREATE UNIQUE INDEX "User_id_tenantId_key" ON "User"("id", "tenantId");
CREATE UNIQUE INDEX "Category_id_tenantId_key" ON "Category"("id", "tenantId");
CREATE UNIQUE INDEX "Product_id_tenantId_key" ON "Product"("id", "tenantId");
CREATE UNIQUE INDEX "Registration_id_tenantId_key" ON "Registration"("id", "tenantId");
CREATE UNIQUE INDEX "Owner_id_tenantId_key" ON "Owner"("id", "tenantId");
CREATE UNIQUE INDEX "ProductDetail_id_tenantId_key" ON "ProductDetail"("id", "tenantId");
CREATE UNIQUE INDEX "RepairRecord_id_tenantId_key" ON "RepairRecord"("id", "tenantId");
CREATE UNIQUE INDEX "Warehouse_id_tenantId_key" ON "Warehouse"("id", "tenantId");
CREATE UNIQUE INDEX "AppLog_id_tenantId_key" ON "AppLog"("id", "tenantId");

CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE "Transfer" (
  "id" SERIAL NOT NULL,
  "productId" INTEGER NOT NULL,
  "fromTenantId" INTEGER NOT NULL,
  "toTenantId" INTEGER NOT NULL,
  "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Category_tenantId_idx" ON "Category"("tenantId");
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");
CREATE INDEX "Owner_tenantId_idx" ON "Owner"("tenantId");
CREATE INDEX "Warehouse_tenantId_idx" ON "Warehouse"("tenantId");
CREATE INDEX "Transfer_tenantId_status_idx" ON "Transfer"("tenantId", "status");
CREATE INDEX "Transfer_toTenantId_status_idx" ON "Transfer"("toTenantId", "status");
CREATE UNIQUE INDEX "Transfer_id_tenantId_key" ON "Transfer"("id", "tenantId");

ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
