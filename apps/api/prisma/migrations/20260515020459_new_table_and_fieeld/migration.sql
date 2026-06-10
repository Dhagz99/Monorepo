/*
  Warnings:

  - You are about to drop the column `amount` on the `commission_transactions` table. All the data in the column will be lost.
  - Added the required column `commissionAmount` to the `commission_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commissionRuleId` to the `commission_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saleAmount` to the `commission_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FormulaType" AS ENUM ('FORMULA3', 'FORMULA4');

-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "creditScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "commission_transactions" DROP COLUMN "amount",
ADD COLUMN     "commissionAmount" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "commissionRuleId" TEXT NOT NULL,
ADD COLUMN     "saleAmount" DECIMAL(12,2) NOT NULL;

-- CreateTable
CREATE TABLE "commission_rules" (
    "id" TEXT NOT NULL,
    "accountType" "AccType" NOT NULL,
    "agentStatus" "AgentStatus" NOT NULL,
    "formulaType" "FormulaType" NOT NULL,
    "sspAmount" DECIMAL(12,2) NOT NULL,
    "piraRate" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commission_rules_accountType_idx" ON "commission_rules"("accountType");

-- CreateIndex
CREATE INDEX "commission_rules_agentStatus_idx" ON "commission_rules"("agentStatus");

-- CreateIndex
CREATE INDEX "commission_rules_isActive_idx" ON "commission_rules"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "commission_rules_accountType_agentStatus_key" ON "commission_rules"("accountType", "agentStatus");

-- CreateIndex
CREATE INDEX "commission_transactions_commissionRuleId_idx" ON "commission_transactions"("commissionRuleId");

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_commissionRuleId_fkey" FOREIGN KEY ("commissionRuleId") REFERENCES "commission_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
