-- AlterTable
ALTER TABLE "user" ADD COLUMN     "branchId" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("branchCode") ON DELETE SET NULL ON UPDATE CASCADE;
