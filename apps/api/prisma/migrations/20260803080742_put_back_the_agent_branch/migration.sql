-- CreateTable
CREATE TABLE "agent_branches" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_branches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_branches_agentId_idx" ON "agent_branches"("agentId");

-- CreateIndex
CREATE INDEX "agent_branches_branchId_idx" ON "agent_branches"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_branches_agentId_branchId_key" ON "agent_branches"("agentId", "branchId");

-- AddForeignKey
ALTER TABLE "agent_branches" ADD CONSTRAINT "agent_branches_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_branches" ADD CONSTRAINT "agent_branches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("branchCode") ON DELETE RESTRICT ON UPDATE CASCADE;
