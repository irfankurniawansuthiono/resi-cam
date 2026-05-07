/*
  Warnings:

  - A unique constraint covering the columns `[barcodeResi]` on the table `Record` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('recording', 'processing', 'done', 'failed');

-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "status" "Status" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Record_barcodeResi_key" ON "Record"("barcodeResi");
