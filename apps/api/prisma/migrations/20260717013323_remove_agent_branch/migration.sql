/*
  Warnings:

  - You are about to drop the `agent_branches` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "agent_branches" DROP CONSTRAINT "agent_branches_agentId_fkey";

-- DropForeignKey
ALTER TABLE "agent_branches" DROP CONSTRAINT "agent_branches_branchId_fkey";

-- DropTable
DROP TABLE "agent_branches";
