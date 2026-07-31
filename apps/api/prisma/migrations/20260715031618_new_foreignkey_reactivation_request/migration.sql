/*
  Warnings:

  - You are about to drop the column `branchCode` on the `agent_reactivation_requests` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "agent_reactivation_requests" DROP CONSTRAINT "agent_reactivation_requests_branchCode_fkey";

-- AlterTable
ALTER TABLE "agent_reactivation_requests" DROP COLUMN "branchCode",
ADD COLUMN     "submittedBranchCode" TEXT,
ADD COLUMN     "submittedByUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "agent_reactivation_requests" ADD CONSTRAINT "agent_reactivation_requests_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_reactivation_requests" ADD CONSTRAINT "agent_reactivation_requests_submittedBranchCode_fkey" FOREIGN KEY ("submittedBranchCode") REFERENCES "branches"("branchCode") ON DELETE SET NULL ON UPDATE CASCADE;
