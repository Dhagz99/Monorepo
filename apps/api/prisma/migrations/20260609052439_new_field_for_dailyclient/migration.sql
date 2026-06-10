-- AlterTable
ALTER TABLE "DailyClientDetails" ADD COLUMN     "term" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OverrideCommissionRule" ADD COLUMN     "createdById" INTEGER;

-- AddForeignKey
ALTER TABLE "OverrideCommissionRule" ADD CONSTRAINT "OverrideCommissionRule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
