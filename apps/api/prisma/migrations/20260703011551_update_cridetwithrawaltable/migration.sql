-- AlterTable
ALTER TABLE "CreditWithdrawalRequest" ADD COLUMN     "rawResponse" JSONB,
ADD COLUMN     "rawWebhook" JSONB;
