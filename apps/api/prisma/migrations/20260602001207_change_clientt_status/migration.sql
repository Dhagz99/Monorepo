/*
  Warnings:

  - The values [APPROVED] on the enum `ClientStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ClientStatus_new" AS ENUM ('NEW', 'PENDING', 'SCANNED');
ALTER TABLE "DailyClientDetails" ALTER COLUMN "clientStatus" TYPE "ClientStatus_new" USING ("clientStatus"::text::"ClientStatus_new");
ALTER TYPE "ClientStatus" RENAME TO "ClientStatus_old";
ALTER TYPE "ClientStatus_new" RENAME TO "ClientStatus";
DROP TYPE "public"."ClientStatus_old";
COMMIT;
