CREATE TABLE "Ammunition" (
  "id" SERIAL NOT NULL,
  "productId" INTEGER NOT NULL,
  "batch" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "productionYear" INTEGER NOT NULL,
  "tenantId" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Ammunition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Ammunition_id_tenantId_key" ON "Ammunition"("id", "tenantId");
CREATE INDEX "Ammunition_tenantId_idx" ON "Ammunition"("tenantId");
CREATE INDEX "Ammunition_productId_tenantId_idx" ON "Ammunition"("productId", "tenantId");

ALTER TABLE "Ammunition" ADD CONSTRAINT "Ammunition_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;