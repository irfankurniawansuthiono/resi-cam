-- CreateEnum
CREATE TYPE "logStatus" AS ENUM ('done', 'failed');

-- AlterTable
ALTER TABLE "Camera" ALTER COLUMN "isActive" SET DEFAULT true;

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "status" "logStatus" NOT NULL,
    "message" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
