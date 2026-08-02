-- DropIndex
DROP INDEX "ProductDetail_serialNumber_key";

-- AlterTable
ALTER TABLE "ProductDetail" ALTER COLUMN "serialNumber" DROP NOT NULL;
