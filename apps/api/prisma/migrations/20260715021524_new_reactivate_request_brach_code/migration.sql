/*
  Warnings:

  - Added the required column `branchCode` to the `agent_reactivation_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agent_reactivation_requests" ADD COLUMN     "branchCode" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "agent_reactivation_requests" ADD CONSTRAINT "agent_reactivation_requests_branchCode_fkey" FOREIGN KEY ("branchCode") REFERENCES "branches"("branchCode") ON DELETE SET NULL ON UPDATE CASCADE;
