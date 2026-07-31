/*
  Warnings:

  - You are about to drop the column `commissionTransactionId` on the `CreditWithdrawalRequest` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CreditWithdrawalRequest_commissionTransactionId_key";

-- AlterTable
ALTER TABLE "CreditWithdrawalRequest" DROP COLUMN "commissionTransactionId";

-- AddForeignKey
ALTER TABLE "CreditWithdrawalRequest" ADD CONSTRAINT "CreditWithdrawalRequest_commissionScanId_fkey" FOREIGN KEY ("commissionScanId") REFERENCES "commission_scans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
