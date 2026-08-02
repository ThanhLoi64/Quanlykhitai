/*
  Warnings:

  - You are about to drop the column `accessories` on the `ProductDetail` table. All the data in the column will be lost.
  - You are about to drop the column `classification` on the `ProductDetail` table. All the data in the column will be lost.
  - You are about to drop the column `militaryGear` on the `ProductDetail` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `ProductDetail` table. All the data in the column will be lost.
  - You are about to drop the column `receiveDate` on the `ProductDetail` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ProductDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductDetail" DROP COLUMN "accessories",
DROP COLUMN "classification",
DROP COLUMN "militaryGear",
DROP COLUMN "note",
DROP COLUMN "receiveDate",
DROP COLUMN "status",
ADD COLUMN     "accessory" TEXT,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "militaryEquipment" TEXT,
ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "receivedDate" TIMESTAMP(3);
