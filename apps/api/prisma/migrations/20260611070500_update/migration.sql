-- DropIndex
DROP INDEX "agent_reactivation_requests_status_idx";

-- CreateIndex
CREATE INDEX "agent_reactivation_requests_agentId_status_idx" ON "agent_reactivation_requests"("agentId", "status");

-- CreateIndex
CREATE INDEX "agent_reactivation_requests_agentId_createdAt_idx" ON "agent_reactivation_requests"("agentId", "createdAt");

-- CreateIndex
CREATE INDEX "agent_reactivation_requests_agentId_cooldownUntil_idx" ON "agent_reactivation_requests"("agentId", "cooldownUntil");
