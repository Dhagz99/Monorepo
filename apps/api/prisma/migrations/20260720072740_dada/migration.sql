-- AlterTable
ALTER TABLE "CreditWithdrawalRequest" ADD COLUMN     "commissionTransactionId" TEXT;

-- AddForeignKey
ALTER TABLE "CreditWithdrawalRequest" ADD CONSTRAINT "CreditWithdrawalRequest_commissionTransactionId_fkey" FOREIGN KEY ("commissionTransactionId") REFERENCES "commission_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
