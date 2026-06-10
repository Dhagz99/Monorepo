/*
  Warnings:

  - The values [UPLINE] on the enum `CommissionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CommissionType_new" AS ENUM ('DIRECT', 'DOWNLINE', 'WITHDRAW');
ALTER TABLE "public"."commission_transactions" ALTER COLUMN "commissionType" DROP DEFAULT;
ALTER TABLE "commission_transactions" ALTER COLUMN "commissionType" TYPE "CommissionType_new" USING ("commissionType"::text::"CommissionType_new");
ALTER TYPE "CommissionType" RENAME TO "CommissionType_old";
ALTER TYPE "CommissionType_new" RENAME TO "CommissionType";
DROP TYPE "public"."CommissionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "commission_transactions" ALTER COLUMN "commissionType" DROP DEFAULT;
