/*
  Warnings:

  - Added the required column `commissionScanId` to the `commission_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "commission_transactions" ADD COLUMN     "commissionScanId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "commission_scans" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "claimedByAgentId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "scannedBy" INTEGER,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commission_scans_clientId_idx" ON "commission_scans"("clientId");

-- CreateIndex
CREATE INDEX "commission_scans_claimedByAgentId_idx" ON "commission_scans"("claimedByAgentId");

-- CreateIndex
CREATE INDEX "commission_scans_branchId_idx" ON "commission_scans"("branchId");

-- AddForeignKey
ALTER TABLE "commission_scans" ADD CONSTRAINT "commission_scans_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "DailyClientDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_scans" ADD CONSTRAINT "commission_scans_claimedByAgentId_fkey" FOREIGN KEY ("claimedByAgentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_scans" ADD CONSTRAINT "commission_scans_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("branchCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_scans" ADD CONSTRAINT "commission_scans_scannedBy_fkey" FOREIGN KEY ("scannedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_commissionScanId_fkey" FOREIGN KEY ("commissionScanId") REFERENCES "commission_scans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
