/*
  Warnings:

  - Changed the type of `status` on the `logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('done', 'failed');

-- DropForeignKey
ALTER TABLE "WebCameraSession" DROP CONSTRAINT "WebCameraSession_userId_fkey";

-- AlterTable
ALTER TABLE "logs" DROP COLUMN "status",
ADD COLUMN     "status" "LogStatus" NOT NULL;

-- DropEnum
DROP TYPE "logStatus";
