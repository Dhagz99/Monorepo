-- CreateEnum
CREATE TYPE "CreditLedgerType" AS ENUM ('CREDIT', 'DEBIT', 'RESERVE', 'RELEASE');

-- CreateEnum
CREATE TYPE "CreditSource" AS ENUM ('COMMISSION', 'WITHDRAWAL');

-- CreateTable
CREATE TABLE "AgentWithdrawalLedger" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" "CreditLedgerType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "sourceType" "CreditSource" NOT NULL,
    "sourceId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentWithdrawalLedger_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgentWithdrawalLedger" ADD CONSTRAINT "AgentWithdrawalLedger_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
