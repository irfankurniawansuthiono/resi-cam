/*
  Warnings:

  - You are about to drop the `Discount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantDiscount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantSupplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `app_config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pricing_rule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `variant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VariantDiscount" DROP CONSTRAINT "VariantDiscount_discountId_fkey";

-- DropForeignKey
ALTER TABLE "VariantDiscount" DROP CONSTRAINT "VariantDiscount_variantId_fkey";

-- DropForeignKey
ALTER TABLE "VariantSupplier" DROP CONSTRAINT "VariantSupplier_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "VariantSupplier" DROP CONSTRAINT "VariantSupplier_variantId_fkey";

-- DropForeignKey
ALTER TABLE "pricing_rule" DROP CONSTRAINT "pricing_rule_variantId_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_brandId_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "variant" DROP CONSTRAINT "variant_productId_fkey";

-- DropTable
DROP TABLE "Discount";

-- DropTable
DROP TABLE "VariantDiscount";

-- DropTable
DROP TABLE "VariantSupplier";

-- DropTable
DROP TABLE "app_config";

-- DropTable
DROP TABLE "brand";

-- DropTable
DROP TABLE "category";

-- DropTable
DROP TABLE "pricing_rule";

-- DropTable
DROP TABLE "product";

-- DropTable
DROP TABLE "supplier";

-- DropTable
DROP TABLE "variant";

-- DropEnum
DROP TYPE "DiscountType";

-- DropEnum
DROP TYPE "PaymentTerm";
