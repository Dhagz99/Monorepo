/*
  Warnings:

  - The values [New,Pending,Approved] on the enum `ClientStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'PROBATION', 'EXPIRED', 'DROPPED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AccType" AS ENUM ('CODED', 'UNCODED');

-- CreateEnum
CREATE TYPE "AgentLevel" AS ENUM ('L1', 'L2', 'L3');

-- CreateEnum
CREATE TYPE "CommissionSourceLevel" AS ENUM ('L1', 'L2', 'L3');

-- AlterEnum
BEGIN;
CREATE TYPE "ClientStatus_new" AS ENUM ('NEW', 'PENDING', 'APPROVED');
ALTER TABLE "DailyClientDetails" ALTER COLUMN "clientStatus" TYPE "ClientStatus_new" USING ("clientStatus"::text::"ClientStatus_new");
ALTER TYPE "ClientStatus" RENAME TO "ClientStatus_old";
ALTER TYPE "ClientStatus_new" RENAME TO "ClientStatus";
DROP TYPE "public"."ClientStatus_old";
COMMIT;

-- CreateTable
CREATE TABLE "companydetails" (
    "companyCode" VARCHAR(20) NOT NULL,
    "companyCycle" VARCHAR(50),
    "companyName" VARCHAR(100),
    "isDisburse" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "companydetails_pkey" PRIMARY KEY ("companyCode")
);

-- CreateTable
CREATE TABLE "branches" (
    "branchCode" VARCHAR(20) NOT NULL,
    "companyName" VARCHAR(50),
    "location" VARCHAR(100),
    "employeesCount" VARCHAR(10),
    "branchImage" VARCHAR(255),
    "position" INTEGER NOT NULL DEFAULT 0,
    "companyId" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "branches_pkey" PRIMARY KEY ("branchCode")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "agentCode" VARCHAR(15) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20),
    "birthDate" TIMESTAMP(3),
    "address" VARCHAR(255),
    "email" VARCHAR(100),
    "telephone" VARCHAR(20),
    "status" "AgentStatus" NOT NULL,
    "accountType" "AccType" NOT NULL,
    "level" "AgentLevel" NOT NULL,
    "parentAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_branches" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "commissionRate" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_transactions" (
    "id" TEXT NOT NULL,
    "sourceAgentId" TEXT NOT NULL,
    "receiverAgentId" TEXT NOT NULL,
    "saleReference" VARCHAR(100),
    "amount" DECIMAL(12,2) NOT NULL,
    "percentage" DECIMAL(5,2),
    "sourceLevel" "CommissionSourceLevel" NOT NULL,
    "remarks" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "branches_companyId_idx" ON "branches"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "agents_agentCode_key" ON "agents"("agentCode");

-- CreateIndex
CREATE UNIQUE INDEX "agents_username_key" ON "agents"("username");

-- CreateIndex
CREATE INDEX "agents_parentAgentId_idx" ON "agents"("parentAgentId");

-- CreateIndex
CREATE INDEX "agents_level_idx" ON "agents"("level");

-- CreateIndex
CREATE INDEX "agents_status_idx" ON "agents"("status");

-- CreateIndex
CREATE INDEX "agent_branches_agentId_idx" ON "agent_branches"("agentId");

-- CreateIndex
CREATE INDEX "agent_branches_branchId_idx" ON "agent_branches"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_branches_agentId_branchId_key" ON "agent_branches"("agentId", "branchId");

-- CreateIndex
CREATE INDEX "commission_transactions_sourceAgentId_idx" ON "commission_transactions"("sourceAgentId");

-- CreateIndex
CREATE INDEX "commission_transactions_receiverAgentId_idx" ON "commission_transactions"("receiverAgentId");

-- CreateIndex
CREATE INDEX "commission_transactions_createdAt_idx" ON "commission_transactions"("createdAt");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companydetails"("companyCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_parentAgentId_fkey" FOREIGN KEY ("parentAgentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_branches" ADD CONSTRAINT "agent_branches_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_branches" ADD CONSTRAINT "agent_branches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("branchCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_sourceAgentId_fkey" FOREIGN KEY ("sourceAgentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_receiverAgentId_fkey" FOREIGN KEY ("receiverAgentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
