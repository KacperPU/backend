-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('KURIER', 'PACZKOMAT', 'ODBIOR_OSOBISTY');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PRZELEW', 'BLIK', 'PRZY_ODBIORZE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'KURIER',
ADD COLUMN     "deliveryPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'PRZELEW',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;
