-- CreateTable
CREATE TABLE "ConvenienceFee" (
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

    CONSTRAINT "ConvenienceFee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConvenienceFee_type_idx" ON "ConvenienceFee"("type");

-- CreateIndex
CREATE INDEX "ConvenienceFee_sourceType_idx" ON "ConvenienceFee"("sourceType");

-- CreateIndex
CREATE INDEX "ConvenienceFee_sourceId_idx" ON "ConvenienceFee"("sourceId");

-- CreateIndex
CREATE INDEX "ConvenienceFee_createdAt_idx" ON "ConvenienceFee"("createdAt");

-- AddForeignKey
ALTER TABLE "ConvenienceFee" ADD CONSTRAINT "ConvenienceFee_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
