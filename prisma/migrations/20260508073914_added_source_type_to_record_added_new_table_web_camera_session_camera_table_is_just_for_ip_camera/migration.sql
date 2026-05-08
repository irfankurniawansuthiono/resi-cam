/*
  Warnings:

  - You are about to drop the `Record` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('CAMERA', 'WEBCAM');

-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_cameraId_fkey";

-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_recordedById_fkey";

-- DropTable
DROP TABLE "Record";

-- CreateTable
CREATE TABLE "record" (
    "id" TEXT NOT NULL,
    "barcodeResi" TEXT NOT NULL,
    "videoPath" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "cameraId" TEXT,
    "webCameraSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recordedById" TEXT,
    "sourceType" "SourceType" NOT NULL,

    CONSTRAINT "record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebCameraSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT,
    "name" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebCameraSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "record_barcodeResi_key" ON "record"("barcodeResi");

-- CreateIndex
CREATE INDEX "record_barcodeResi_idx" ON "record"("barcodeResi");

-- AddForeignKey
ALTER TABLE "record" ADD CONSTRAINT "record_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record" ADD CONSTRAINT "record_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record" ADD CONSTRAINT "record_webCameraSessionId_fkey" FOREIGN KEY ("webCameraSessionId") REFERENCES "WebCameraSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebCameraSession" ADD CONSTRAINT "WebCameraSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
