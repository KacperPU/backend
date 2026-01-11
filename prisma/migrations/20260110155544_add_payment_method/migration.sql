/*
  Warnings:

  - You are about to drop the column `deliveryMethod` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Order` table. All the data in the column will be lost.
  - Added the required column `deliveryOptionId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethodId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deliveryMethod",
DROP COLUMN "paymentMethod",
ADD COLUMN     "deliveryOptionId" INTEGER NOT NULL,
ADD COLUMN     "paymentMethodId" INTEGER NOT NULL,
ALTER COLUMN "deliveryPrice" DROP DEFAULT;

-- DropEnum
DROP TYPE "PaymentMethod";

-- CreateTable
CREATE TABLE "DeliveryOption" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DeliveryOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryOption_code_key" ON "DeliveryOption"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_code_key" ON "PaymentMethod"("code");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryOptionId_fkey" FOREIGN KEY ("deliveryOptionId") REFERENCES "DeliveryOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
