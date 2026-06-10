/*
  Warnings:

  - The `accountType` column on the `agents` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `accountType` column on the `commission_rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "agents" DROP COLUMN "accountType",
ADD COLUMN     "accountType" TEXT DEFAULT 'CODED';

-- AlterTable
ALTER TABLE "commission_rules" DROP COLUMN "accountType",
ADD COLUMN     "accountType" TEXT NOT NULL DEFAULT 'CODED';

-- DropEnum
DROP TYPE "AccType";

-- CreateIndex
CREATE INDEX "commission_rules_accountType_idx" ON "commission_rules"("accountType");

-- CreateIndex
CREATE UNIQUE INDEX "commission_rules_accountType_agentStatus_key" ON "commission_rules"("accountType", "agentStatus");
