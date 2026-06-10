/*
  Warnings:

  - You are about to drop the column `consecutiveMonthsActive` on the `agent_maintenance_cycles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "agent_maintenance_cycles" DROP COLUMN "consecutiveMonthsActive";
