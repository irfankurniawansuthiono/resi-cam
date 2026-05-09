/*
  Warnings:

  - You are about to drop the column `recordId` on the `logs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_recordId_fkey";

-- AlterTable
ALTER TABLE "logs" DROP COLUMN "recordId";
