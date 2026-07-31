-- AlterTable
ALTER TABLE "commission_scans" ADD COLUMN     "checkNumber" TEXT,
ADD COLUMN     "payoutChannel" "PayoutChannel" NOT NULL DEFAULT 'CHECK';
