ALTER TABLE "Transfer"
  ALTER COLUMN "productDetailId" DROP NOT NULL,
  ADD COLUMN "ammunitionId" INTEGER,
  ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "Transfer_ammunitionId_status_idx" ON "Transfer"("ammunitionId", "status");

ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_ammunitionId_fkey"
  FOREIGN KEY ("ammunitionId") REFERENCES "Ammunition"("id") ON DELETE SET NULL ON UPDATE CASCADE;