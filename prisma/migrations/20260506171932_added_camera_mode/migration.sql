-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL,
    "barcodeResi" TEXT NOT NULL,
    "videoPath" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Record_barcodeResi_idx" ON "Record"("barcodeResi");

-- CreateIndex
CREATE INDEX "Record_recordedAt_idx" ON "Record"("recordedAt");

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
