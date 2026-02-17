-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "alternatePhone" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "deliveryArea" TEXT,
ADD COLUMN     "deliveryFee" INTEGER NOT NULL DEFAULT 250000,
ADD COLUMN     "deliveryNote" TEXT,
ADD COLUMN     "deliveryState" TEXT;
