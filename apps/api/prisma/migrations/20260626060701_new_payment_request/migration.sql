-- CreateEnum
CREATE TYPE "ReactivationPaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReactivationRequestStatus" ADD VALUE 'APPROVED_WAITING_PAYMENT';
ALTER TYPE "ReactivationRequestStatus" ADD VALUE 'PAYMENT_PENDING';

-- AlterTable
ALTER TABLE "agent_reactivation_requests" ADD COLUMN     "cancelledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "agent_reactivation_payments" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "provider" TEXT NOT NULL DEFAULT 'XENDIT',
    "status" "ReactivationPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "checkoutUrl" TEXT,
    "xenditPaymentSessionId" TEXT,
    "xenditReferenceId" TEXT,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "rawResponse" JSONB,
    "rawWebhook" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_reactivation_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_reactivation_payments_requestId_key" ON "agent_reactivation_payments"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_reactivation_payments_xenditPaymentSessionId_key" ON "agent_reactivation_payments"("xenditPaymentSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_reactivation_payments_xenditReferenceId_key" ON "agent_reactivation_payments"("xenditReferenceId");

-- CreateIndex
CREATE INDEX "agent_reactivation_payments_agentId_idx" ON "agent_reactivation_payments"("agentId");

-- CreateIndex
CREATE INDEX "agent_reactivation_payments_requestId_idx" ON "agent_reactivation_payments"("requestId");

-- CreateIndex
CREATE INDEX "agent_reactivation_payments_status_idx" ON "agent_reactivation_payments"("status");

-- CreateIndex
CREATE INDEX "agent_reactivation_payments_xenditPaymentSessionId_idx" ON "agent_reactivation_payments"("xenditPaymentSessionId");

-- CreateIndex
CREATE INDEX "agent_reactivation_payments_xenditReferenceId_idx" ON "agent_reactivation_payments"("xenditReferenceId");

-- AddForeignKey
ALTER TABLE "agent_reactivation_payments" ADD CONSTRAINT "agent_reactivation_payments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "agent_reactivation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_reactivation_payments" ADD CONSTRAINT "agent_reactivation_payments_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
