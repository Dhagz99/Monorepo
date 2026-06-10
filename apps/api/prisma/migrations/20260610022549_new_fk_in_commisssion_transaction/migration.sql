-- DropForeignKey
ALTER TABLE "commission_transactions" DROP CONSTRAINT "commission_transactions_commissionRuleId_fkey";

-- AlterTable
ALTER TABLE "commission_transactions" ADD COLUMN     "overrideCommissionRuleId" TEXT,
ALTER COLUMN "commissionRuleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_commissionRuleId_fkey" FOREIGN KEY ("commissionRuleId") REFERENCES "commission_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_overrideCommissionRuleId_fkey" FOREIGN KEY ("overrideCommissionRuleId") REFERENCES "OverrideCommissionRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
