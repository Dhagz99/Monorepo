/*
  Warnings:

  - A unique constraint covering the columns `[commissionTransactionId]` on the table `CreditWithdrawalRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PayoutPurpose" AS ENUM ('WITHDRAWAL', 'DIRECT_COMMISSION');

-- AlterTable
ALTER TABLE "CreditWithdrawalRequest" ADD COLUMN     "commissionScanId" TEXT,
ADD COLUMN     "commissionTransactionId" TEXT,
ADD COLUMN     "purpose" "PayoutPurpose" NOT NULL DEFAULT 'WITHDRAWAL';

-- CreateIndex
CREATE UNIQUE INDEX "CreditWithdrawalRequest_commissionTransactionId_key" ON "CreditWithdrawalRequest"("commissionTransactionId");

-- CreateIndex
CREATE INDEX "CreditWithdrawalRequest_agentId_status_idx" ON "CreditWithdrawalRequest"("agentId", "status");

-- CreateIndex
CREATE INDEX "CreditWithdrawalRequest_commissionScanId_idx" ON "CreditWithdrawalRequest"("commissionScanId");
