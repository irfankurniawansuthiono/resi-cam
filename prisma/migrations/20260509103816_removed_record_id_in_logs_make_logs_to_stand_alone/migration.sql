-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_recordId_fkey";

-- AlterTable
ALTER TABLE "logs" ADD COLUMN     "chunkId" TEXT,
ALTER COLUMN "recordId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "record"("id") ON DELETE SET NULL ON UPDATE CASCADE;
