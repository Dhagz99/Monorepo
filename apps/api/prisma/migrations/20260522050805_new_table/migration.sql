-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('GRACE', 'ACTIVE', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MAINTENANCE_CREATED', 'MAINTENANCE_WARNING', 'MAINTENANCE_EXPIRED', 'MAINTENANCE_COMPLETED');

-- DropForeignKey
ALTER TABLE "commission_transactions" DROP CONSTRAINT "commission_transactions_receiverAgentId_fkey";

-- DropForeignKey
ALTER TABLE "commission_transactions" DROP CONSTRAINT "commission_transactions_sourceAgentId_fkey";

-- CreateTable
CREATE TABLE "agent_maintenance_cycles" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "cycleMonth" INTEGER NOT NULL,
    "cycleYear" INTEGER NOT NULL,
    "cycleStartDate" TIMESTAMP(3) NOT NULL,
    "cycleEndDate" TIMESTAMP(3) NOT NULL,
    "requiredSales" INTEGER NOT NULL DEFAULT 1,
    "completedSales" INTEGER NOT NULL DEFAULT 0,
    "remainingSales" INTEGER NOT NULL DEFAULT 1,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isFirstCycle" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "status" "MaintenanceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_maintenance_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_notifications" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_maintenance_cycles_agentId_idx" ON "agent_maintenance_cycles"("agentId");

-- CreateIndex
CREATE INDEX "agent_maintenance_cycles_status_idx" ON "agent_maintenance_cycles"("status");

-- CreateIndex
CREATE INDEX "agent_maintenance_cycles_cycleMonth_cycleYear_idx" ON "agent_maintenance_cycles"("cycleMonth", "cycleYear");

-- CreateIndex
CREATE UNIQUE INDEX "agent_maintenance_cycles_agentId_cycleMonth_cycleYear_key" ON "agent_maintenance_cycles"("agentId", "cycleMonth", "cycleYear");

-- CreateIndex
CREATE INDEX "agent_notifications_agentId_idx" ON "agent_notifications"("agentId");

-- AddForeignKey
ALTER TABLE "agent_maintenance_cycles" ADD CONSTRAINT "agent_maintenance_cycles_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_notifications" ADD CONSTRAINT "agent_notifications_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_sourceAgentId_fkey" FOREIGN KEY ("sourceAgentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_receiverAgentId_fkey" FOREIGN KEY ("receiverAgentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
