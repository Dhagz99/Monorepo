/*
  Warnings:

  - The primary key for the `DailyClientDetails` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "DailyClientDetails" DROP CONSTRAINT "DailyClientDetails_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "DailyClientDetails_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DailyClientDetails_id_seq";
