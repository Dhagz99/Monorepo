-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('DIRECT', 'UPLINE');

-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "saleMaintenance" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "commission_transactions" ADD COLUMN     "commissionType" "CommissionType" NOT NULL DEFAULT 'UPLINE';
