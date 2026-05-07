/*
  Warnings:

  - You are about to drop the column `type` on the `Camera` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `Camera` will be added. If there are existing duplicate values, this will fail.
  - Made the column `url` on table `Camera` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Camera" DROP COLUMN "type",
ALTER COLUMN "url" SET NOT NULL;

-- DropEnum
DROP TYPE "CameraType";

-- CreateIndex
CREATE UNIQUE INDEX "Camera_url_key" ON "Camera"("url");
