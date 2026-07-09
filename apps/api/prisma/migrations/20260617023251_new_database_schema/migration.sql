-- CreateEnum
CREATE TYPE "ReactivationReviewerType" AS ENUM ('ADMIN', 'UPLINE_AGENT');

-- CreateEnum
CREATE TYPE "ReactivationApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "agent_reactivation_approvals" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "reviewerType" "ReactivationReviewerType" NOT NULL,
    "reviewerUserId" INTEGER,
    "reviewerAgentId" TEXT,
    "status" "ReactivationApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_reactivation_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_reactivation_attachments" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_reactivation_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_reactivation_approvals_requestId_idx" ON "agent_reactivation_approvals"("requestId");

-- CreateIndex
CREATE INDEX "agent_reactivation_approvals_reviewerType_idx" ON "agent_reactivation_approvals"("reviewerType");

-- CreateIndex
CREATE INDEX "agent_reactivation_approvals_status_idx" ON "agent_reactivation_approvals"("status");

-- CreateIndex
CREATE INDEX "agent_reactivation_approvals_reviewerUserId_idx" ON "agent_reactivation_approvals"("reviewerUserId");

-- CreateIndex
CREATE INDEX "agent_reactivation_approvals_reviewerAgentId_idx" ON "agent_reactivation_approvals"("reviewerAgentId");

-- CreateIndex
CREATE INDEX "agent_reactivation_attachments_requestId_idx" ON "agent_reactivation_attachments"("requestId");

-- AddForeignKey
ALTER TABLE "agent_reactivation_approvals" ADD CONSTRAINT "agent_reactivation_approvals_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "agent_reactivation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_reactivation_approvals" ADD CONSTRAINT "agent_reactivation_approvals_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_reactivation_approvals" ADD CONSTRAINT "agent_reactivation_approvals_reviewerAgentId_fkey" FOREIGN KEY ("reviewerAgentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_reactivation_attachments" ADD CONSTRAINT "agent_reactivation_attachments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "agent_reactivation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
