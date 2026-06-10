-- CreateIndex
CREATE INDEX "agent_maintenance_cycles_status_cycleEndDate_idx" ON "agent_maintenance_cycles"("status", "cycleEndDate");
