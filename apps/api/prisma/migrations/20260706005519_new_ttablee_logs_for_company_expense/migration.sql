-- CreateEnum
CREATE TYPE "CompanyExpenseType" AS ENUM ('XENDIT_PAYOUT_FEE', 'XENDIT_PAYMENT_FEE');

-- CreateEnum
CREATE TYPE "CompanyExpenseSource" AS ENUM ('WITHDRAWAL', 'REACTIVATION_PAYMENT');

-- CreateTable
CREATE TABLE "CompanyExpenseLog" (
    "id" TEXT NOT NULL,
    "type" "CompanyExpenseType" NOT NULL,
    "sourceType" "CompanyExpenseSource" NOT NULL,
    "sourceId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "rate" DECIMAL(5,4),
    "description" TEXT,
    "createdBy" INTEGER,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyExpenseLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyExpenseLog_type_idx" ON "CompanyExpenseLog"("type");

-- CreateIndex
CREATE INDEX "CompanyExpenseLog_sourceType_idx" ON "CompanyExpenseLog"("sourceType");

-- CreateIndex
CREATE INDEX "CompanyExpenseLog_sourceId_idx" ON "CompanyExpenseLog"("sourceId");

-- CreateIndex
CREATE INDEX "CompanyExpenseLog_createdAt_idx" ON "CompanyExpenseLog"("createdAt");

-- AddForeignKey
ALTER TABLE "CompanyExpenseLog" ADD CONSTRAINT "CompanyExpenseLog_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
