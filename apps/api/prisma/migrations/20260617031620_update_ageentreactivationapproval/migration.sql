/*
  Warnings:

  - A unique constraint covering the columns `[requestId,reviewerType]` on the table `agent_reactivation_approvals` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "agent_reactivation_approvals" ADD COLUMN     "approvalOrder" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "agent_reactivation_approvals_requestId_reviewerType_key" ON "agent_reactivation_approvals"("requestId", "reviewerType");
