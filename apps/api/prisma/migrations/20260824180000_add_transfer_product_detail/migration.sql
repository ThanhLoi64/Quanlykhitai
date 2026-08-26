ALTER TABLE "Transfer" ADD COLUMN "productDetailId" INTEGER NOT NULL;
ALTER TABLE "Transfer" ADD COLUMN "toWarehouseId" INTEGER NOT NULL;

ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_productDetailId_fkey"
  FOREIGN KEY ("productDetailId") REFERENCES "ProductDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Transfer_productDetailId_idx" ON "Transfer"("productDetailId");
