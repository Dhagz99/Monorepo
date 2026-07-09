-- CreateTable
CREATE TABLE "agent_reassignment_logs" (
    "id" TEXT NOT NULL,
    "droppedAgentId" TEXT NOT NULL,
    "oldUplineId" TEXT,
    "newUplineId" TEXT NOT NULL,
    "downlineAgentId" TEXT NOT NULL,
    "reassignedById" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_reassignment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_reassignment_logs_droppedAgentId_idx" ON "agent_reassignment_logs"("droppedAgentId");

-- CreateIndex
CREATE INDEX "agent_reassignment_logs_oldUplineId_idx" ON "agent_reassignment_logs"("oldUplineId");

-- CreateIndex
CREATE INDEX "agent_reassignment_logs_newUplineId_idx" ON "agent_reassignment_logs"("newUplineId");

-- CreateIndex
CREATE INDEX "agent_reassignment_logs_downlineAgentId_idx" ON "agent_reassignment_logs"("downlineAgentId");
