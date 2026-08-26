-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'SYSADMIN';
ALTER TYPE "UserRole" ADD VALUE 'USER';

-- DropIndex
DROP INDEX "Transfer_productDetailId_idx";

-- AlterTable
ALTER TABLE "ProductDetail" ADD COLUMN     "warehouseId" INTEGER;

-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_name_key" ON "Tenant"("name");

-- CreateIndex
CREATE INDEX "Tenant_parentId_idx" ON "Tenant"("parentId");

INSERT INTO "Tenant" ("id", "name", "parentId", "updatedAt")
VALUES
    (1, 'Tenant gốc', NULL, CURRENT_TIMESTAMP),
    (2, 'Tenant test', 1, CURRENT_TIMESTAMP);

SELECT setval(pg_get_serial_sequence('"Tenant"', 'id'), GREATEST((SELECT MAX("id") FROM "Tenant"), 1));

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDetail" ADD CONSTRAINT "ProductDetail_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
