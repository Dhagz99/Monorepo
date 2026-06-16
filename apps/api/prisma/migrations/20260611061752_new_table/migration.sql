/*
  Warnings:

  - The values [PROBATION] on the enum `MaintenanceStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReactivationRequestStatus" AS ENUM ('PENDING', 'PROBATION', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReactivationType" AS ENUM ('SELF_REACTIVATION', 'ADMIN_APPROVAL');

-- AlterEnum
BEGIN;
CREATE TYPE "MaintenanceStatus_new" AS ENUM ('GRACE', 'ACTIVE', 'COMPLETED', 'EXPIRED');
ALTER TABLE "agent_maintenance_cycles" ALTER COLUMN "status" TYPE "MaintenanceStatus_new" USING ("status"::text::"MaintenanceStatus_new");
ALTER TYPE "MaintenanceStatus" RENAME TO "MaintenanceStatus_old";
ALTER TYPE "MaintenanceStatus_new" RENAME TO "MaintenanceStatus";
DROP TYPE "public"."MaintenanceStatus_old";
COMMIT;

-- CreateTable
CREATE TABLE "agent_reactivation_requests" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "requiredSales" INTEGER NOT NULL DEFAULT 1,
    "completedSales" INTEGER NOT NULL DEFAULT 0,
    "requestType" "ReactivationType" NOT NULL,
    "status" "ReactivationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "probationStartedAt" TIMESTAMP(3),
    "probationEndsAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "cooldownUntil" TIMESTAMP(3),
    "reason" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_reactivation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_reactivation_requests_agentId_idx" ON "agent_reactivation_requests"("agentId");

-- CreateIndex
CREATE INDEX "agent_reactivation_requests_status_idx" ON "agent_reactivation_requests"("status");

-- AddForeignKey
ALTER TABLE "agent_reactivation_requests" ADD CONSTRAINT "agent_reactivation_requests_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
